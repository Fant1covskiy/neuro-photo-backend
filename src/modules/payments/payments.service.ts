import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { tochkaConfig } from '../../config/tochka.config';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async createQr(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const amountKopecks = Math.round(Number(order.total_price) * 100);

    // 🔥 MOCK MODE: Если Tochka недоступна
    const isMockMode = !tochkaConfig.secret || 
                       tochkaConfig.secret === 'mock' || 
                       tochkaConfig.accountId === 'test123';
    
    if (isMockMode) {
      console.log('⚠️ Using MOCK QR (Tochka sandbox unavailable)');
      
      const mockQrId = `MOCK_${Date.now()}_${orderId}`;
      const mockPayload = `https://qr.nspk.ru/AD10006M8KH234G9JOI76TA8930?type=02&bank=100000000009&sum=${amountKopecks}&cur=RUB&crc=AB75`;
      
      order.tochka_qr_id = mockQrId;
      order.payment_status = PaymentStatus.WAITING;
      await this.orderRepo.save(order);

      return {
        orderId: order.id,
        qrId: mockQrId,
        qrPayload: mockPayload,
      };
    }

    // 🌐 PRODUCTION: Real Tochka API
    const body: any = {
      merchantId: tochkaConfig.merchantId,
      accountId: tochkaConfig.accountId,
      amount: amountKopecks,
      currency: 'RUB',
      paymentPurpose: `Оплата заказа #${order.id}`,
      order: order.id.toString(),
    };

    if (tochkaConfig.returnUrl) {
      body.returnUrl = tochkaConfig.returnUrl;
    }

    const signature = this.sign(body);

    try {
      const { data } = await axios.post(
        `${tochkaConfig.apiUrl}/sbp/qr/register`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Login': tochkaConfig.login,
            'X-Signature': signature,
          },
        },
      );

      order.tochka_qr_id = data.qrcId || data.qrId || data.id;
      order.payment_status = PaymentStatus.WAITING;
      await this.orderRepo.save(order);

      return {
        orderId: order.id,
        qrId: order.tochka_qr_id,
        qrPayload: data.payload || data.qrPayload || data.qr,
      };
    } catch (error) {
      console.error('❌ Tochka API Error:', error.response?.status, error.response?.data);
      throw new BadRequestException(`Tochka API failed: ${error.message}`);
    }
  }

  async getStatus(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order || !order.tochka_qr_id) {
      throw new BadRequestException('Order or QR not found');
    }

    // 🔥 MOCK MODE: Возвращаем WAITING
    if (order.tochka_qr_id.startsWith('MOCK_')) {
      console.log('⚠️ Mock status check - returning WAITING');
      return { 
        payment_status: order.payment_status, 
        sbp_status: 'WAITING' 
      };
    }

    const params: any = {
      merchantId: tochkaConfig.merchantId,
      accountId: tochkaConfig.accountId,
      qrcIds: [order.tochka_qr_id],
    };

    const signature = this.sign(params);

    try {
      const { data } = await axios.get(
        `${tochkaConfig.apiUrl}/sbp/qr/payment-status`,
        {
          params,
          headers: {
            'X-Login': tochkaConfig.login,
            'X-Signature': signature,
          },
        },
      );

      const statusItem =
        data.items?.[0] ||
        data[0] ||
        data;

      const sbpStatus: string =
        statusItem?.status || statusItem?.paymentStatus || statusItem?.operationStatus;

      if (sbpStatus === 'Completed' || sbpStatus === 'Success' || sbpStatus === 'Paid') {
        order.payment_status = PaymentStatus.PAID;
        order.status = OrderStatus.PROCESSING;
        await this.orderRepo.save(order);
      } else if (sbpStatus === 'Failed' || sbpStatus === 'Declined' || sbpStatus === 'Cancelled') {
        order.payment_status = PaymentStatus.FAILED;
        await this.orderRepo.save(order);
      }

      return { payment_status: order.payment_status, sbp_status: sbpStatus };
    } catch (error) {
      console.error('❌ Tochka status check error:', error.response?.status);
      throw new BadRequestException('Payment status check failed');
    }
  }

  private sign(payload: Record<string, any>): string {
    const secret = process.env.TOCHKA_SECRET || tochkaConfig.secret;
    
    if (!secret || secret === 'mock') {
      console.warn('⚠️ TOCHKA_SECRET missing, mock signature');
      return 'mock_signature_' + Date.now();
    }

    const flat: any = {};

    Object.keys(payload)
      .sort()
      .forEach((key) => {
        const value = (payload as any)[key];
        if (value === undefined || value === null) {
          return;
        }
        if (Array.isArray(value)) {
          flat[key] = value.join(',');
        } else if (typeof value === 'object') {
          flat[key] = JSON.stringify(value);
        } else {
          flat[key] = String(value);
        }
      });

    const str = Object.keys(flat)
      .sort()
      .map((k) => `${k}=${flat[k]}`)
      .join('&');

    try {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(str);
      return hmac.digest('hex');
    } catch (error) {
      console.error('❌ HMAC error:', error);
      return 'mock_signature_fallback';
    }
  }
}
