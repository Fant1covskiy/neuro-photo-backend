import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaymentsService } from '../payments/payments.service';
import { cloudinaryStorage, cloudinaryResultStorage } from '../../config/cloudinary.config';


@Controller('api')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}


  @Post('orders')
  @UseInterceptors(
    FilesInterceptor('photos', 3, {
      storage: cloudinaryStorage,
    }),
  )
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photos = files?.map((file: any) => file.path) || [];
    
    const createOrderDto = {
      telegram_user_id: body.telegramUserId || body.telegram_user_id,
      username: body.username,
      first_name: body.firstName || body.first_name,
      styles: [],
    };
    
    const order = await this.ordersService.create(createOrderDto, photos);
    
    try {
      const qrData = await this.paymentsService.createQr(order.id);
      
      const updatedOrder = await this.ordersService.update(order.id, {
        qr_code_url: qrData.qrPayload,
        tochka_qr_id: qrData.qrId,
      });
      
      return {
        id: updatedOrder.id,
        qrCodeUrl: qrData.qrPayload,
        qrId: qrData.qrId,
      };
    } catch (error) {
      console.error('QR generation error:', error);
      return {
        id: order.id,
        qrCodeUrl: null,
        error: 'QR generation failed',
      };
    }
  }


  @Get('orders/:id/status')
  async getOrderStatus(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findOne(id);
    return {
      id: order.id,
      status: order.status,
      qrCodeUrl: order.qr_code_url,
      paymentStatus: order.payment_status,
    };
  }


  @Get('admin/orders')
  findAll() {
    return this.ordersService.findAll();
  }


  @Get('orders/user/:telegramUserId')
  findByUser(@Param('telegramUserId') telegramUserId: string) {
    return this.ordersService.findByUser(telegramUserId);
  }


  @Get('admin/orders/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }


  @Get('orders/:id')
  findOneByUser(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }


  @Put('admin/orders/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }


  @Delete('admin/orders/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }


  @Post('admin/orders/:id/result-photos')
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: cloudinaryResultStorage,
    }),
  )
  async uploadResultPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photos = files.map((file: any) => file.path);
    return this.ordersService.addResultPhotos(id, photos);
  }


  @Delete('admin/orders/:id/result-photos')
  async deleteResultPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Body('photo_url') photoUrl: string,
  ) {
    return this.ordersService.removeResultPhoto(id, photoUrl);
  }
}
