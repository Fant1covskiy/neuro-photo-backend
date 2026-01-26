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
      return this.accessToken;
    }

    try {
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
      
      console.log('✅ Tochka access token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Tochka OAuth error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to authenticate with Tochka');
    }
  }


  async createQr(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const amountKopecks = Math.round(Number(order.total_price) * 100);
    const token = await this.getAccessToken();

    const body = {
      Data: {
        QRType: 'QRDynamic',
        Amount: amountKopecks.toString(),
        Currency: 'RUB',
        PaymentPurpose: `Оплата заказа #${order.id}`,
        QRExpirationDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    };

    try {
      console.log('🔄 Calling Tochka API...');
      
      const { data } = await axios.post(
        `${tochkaConfig.apiUrl}/sbp/qr/merchant/register`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      console.log('✅ Tochka response:', JSON.stringify(data));

      const qrId = data.Data?.qrcId || data.Data?.QRId;
      const qrPayload = data.Data?.payload || data.Data?.Payload;

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
        `${tochkaConfig.apiUrl}/sbp/qr/${order.tochka_qr_id}/payment-info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      const sbpStatus = data.Data?.Status || data.Data?.status;

      if (sbpStatus === 'ACWP' || sbpStatus === 'Success') {
        order.payment_status = PaymentStatus.PAID;
        order.status = OrderStatus.PROCESSING;
        await this.orderRepo.save(order);
      } else if (sbpStatus === 'RJCT' || sbpStatus === 'Failed') {
        order.payment_status = PaymentStatus.FAILED;
        await this.orderRepo.save(order);
      }

      return { payment_status: order.payment_status, sbp_status: sbpStatus };
    } catch (error) {
      console.error('❌ Tochka status check error:', error.response?.status, error.response?.data);
      throw new BadRequestException('Payment status check failed');
    }
  }
}
