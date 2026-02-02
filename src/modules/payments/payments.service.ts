import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { tochkaConfig } from '../../config/tochka.config';
import { TochkaAuthService } from './tochka-auth.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly tochkaAuth: TochkaAuthService,
  ) {}

  async createQr(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (!tochkaConfig.merchantId || !tochkaConfig.accountId || !tochkaConfig.bankCode) {
      throw new BadRequestException('Tochka config missing: merchantId/accountId/bankCode');
    }

    const amountRub = Number(order.total_price);
    if (!Number.isFinite(amountRub) || amountRub <= 0) {
      throw new BadRequestException('Order total_price must be > 0 to create QR');
    }

    const amountKopecks = Math.round(amountRub * 100);
    const token = this.tochkaAuth.getToken();

    const body = {
      Data: {
        amount: amountKopecks,
        currency: 'RUB',
        paymentPurpose: `Оплата заказа #${order.id}`,
        qrcType: '01',
        imageParams: {
          width: 300,
          height: 300,
          mediaType: 'image/png',
        },
        sourceName: 'neuro-photo',
      },
    };

    const url = `https://enter.tochka.com/uapi/sbp/v1.0/qr-code/merchant/${tochkaConfig.merchantId}/${tochkaConfig.accountId}/${tochkaConfig.bankCode}`;

    try {
      const { data } = await axios.post(url, body, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Correlation-ID': `order-${orderId}-${Date.now()}`,
        },
      });

      const qrId = data?.Data?.qrcId;
      const qrPayload = data?.Data?.payload;

      if (!qrId || !qrPayload) {
        throw new BadRequestException(`Tochka returned no qrcId/payload: ${JSON.stringify(data)}`);
      }

      const paymentLink = `https://qr.nspk.ru/${qrId}`;

      order.tochka_qr_id = qrId;
      order.qr_code_url = qrPayload;
      order.payment_status = PaymentStatus.WAITING;
      await this.orderRepo.save(order);

      return {
        orderId: order.id,
        qrId,
        qrPayload,
        paymentLink,
        imageBase64: data?.Data?.image?.content ?? null,
      };
    } catch (e: any) {
      const status = e?.response?.status;
      const resp = e?.response?.data;
      throw new BadRequestException(`Tochka QR failed: status=${status} data=${JSON.stringify(resp) || e.message}`);
    }
  }

  async getStatus(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order || !order.tochka_qr_id) throw new BadRequestException('Order or QR not found');

    const token = this.tochkaAuth.getToken();

    try {
      const { data } = await axios.get(
        `https://enter.tochka.com/uapi/sbp/v1.0/qr-code/${order.tochka_qr_id}/payment-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const sbpStatus = data?.Data?.status;

      if (sbpStatus === 'Accepted' || sbpStatus === 'ACWP') {
        order.payment_status = PaymentStatus.PAID;
        order.status = OrderStatus.PROCESSING;
        await this.orderRepo.save(order);
      } else if (sbpStatus === 'Declined' || sbpStatus === 'RJCT') {
        order.payment_status = PaymentStatus.FAILED;
        await this.orderRepo.save(order);
      }

      return { payment_status: order.payment_status, sbp_status: sbpStatus };
    } catch (e: any) {
      const status = e?.response?.status;
      const resp = e?.response?.data;
      throw new BadRequestException(`Tochka status failed: status=${status} data=${JSON.stringify(resp) || e.message}`);
    }
  }
}
