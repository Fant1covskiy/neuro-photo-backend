import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/tochka/qr')
  createQr(@Body('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.createQr(orderId);
  }

  @Get('payments/tochka/status/:orderId')
  getStatus(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.getStatus(orderId);
  }
}
