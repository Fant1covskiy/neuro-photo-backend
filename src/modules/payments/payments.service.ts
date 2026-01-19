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
  }

  async getStatus(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order || !order.tochka_qr_id) {
      throw new BadRequestException('Order or QR not found');
    }

    const params: any = {
      merchantId: tochkaConfig.merchantId,
      accountId: tochkaConfig.accountId,
      qrcIds: [order.tochka_qr_id],
    };

    const signature = this.sign(params);

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
  }

  private sign(payload: Record<string, any>): string {
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

    const hmac = crypto.createHmac('sha256', tochkaConfig.secret);
    hmac.update(str);
    return hmac.digest('hex');
  }
}
