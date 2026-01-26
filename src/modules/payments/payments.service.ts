import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { tochkaConfig } from '../../config/tochka.config';


@Injectable()
export class PaymentsService {
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}


  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      console.log('✅ Using cached token');
      return this.accessToken;
    }

    try {
      console.log('🔄 Requesting new access token...');
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', tochkaConfig.clientId);
      params.append('client_secret', tochkaConfig.clientSecret);

      const { data } = await axios.post(
        'https://enter.tochka.com/connect/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      
      console.log('✅ Access token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('❌ OAuth error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to authenticate');
    }
  }


  async createQr(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const amount = Number(order.total_price);
    const token = await this.getAccessToken();

    const body = {
      Data: {
        amount: amount,
        currency: 'RUB',
        paymentPurpose: `Оплата заказа #${order.id}`,
        qrcType: '01',
        imageParams: {
          width: 0,
          height: 0,
          mediaType: 'image/png'
        },
        sourceName: 'string',
      },
    };

    try {
      const url = `https://enter.tochka.com/uapi/sbp/v1.0/qr-code/merchant/${tochkaConfig.merchantId}/${tochkaConfig.accountId}`;
      
      console.log('🔄 Calling Tochka API:', url);
      
      const { data } = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Correlation-ID': `order-${orderId}-${Date.now()}`,
        },
      });

      console.log('✅ Tochka response:', JSON.stringify(data));

      const qrId = data.Data?.qrcId || data.qrcId;
      const qrPayload = data.Data?.payload || data.payload;

      order.tochka_qr_id = qrId;
      order.qr_code_url = qrPayload;
      order.payment_status = PaymentStatus.WAITING;
      await this.orderRepo.save(order);

      return {
        orderId: order.id,
        qrId: qrId,
        qrPayload: qrPayload,
      };
    } catch (error) {
      console.error('❌ Tochka API Error:', error.response?.status, JSON.stringify(error.response?.data));
      console.error('❌ Full error:', error.response);
      throw new BadRequestException(`Tochka API failed: ${error.response?.data?.message || error.message}`);
    }
  }


  async getStatus(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order || !order.tochka_qr_id) {
      throw new BadRequestException('Order or QR not found');
    }

    const token = await this.getAccessToken();

    try {
      const { data } = await axios.get(
        `https://enter.tochka.com/uapi/sbp/v1.0/qr-code/${order.tochka_qr_id}/payment-info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        },
      );

      const sbpStatus = data.Data?.status;

      if (sbpStatus === 'Accepted' || sbpStatus === 'ACWP') {
        order.payment_status = PaymentStatus.PAID;
        order.status = OrderStatus.PROCESSING;
        await this.orderRepo.save(order);
      } else if (sbpStatus === 'Declined' || sbpStatus === 'RJCT') {
        order.payment_status = PaymentStatus.FAILED;
        await this.orderRepo.save(order);
      }

      return { payment_status: order.payment_status, sbp_status: sbpStatus };
    } catch (error) {
      console.error('❌ Status check error:', error.response?.status, error.response?.data);
      throw new BadRequestException('Payment status check failed');
    }
  }
}
