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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { cloudinaryStorage, cloudinaryResultStorage } from '../../config/cloudinary.config';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @UseInterceptors(
    FilesInterceptor('photos', 3, {
      storage: cloudinaryStorage,
    }),
  )
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photos = files.map((file: any) => file.path);
    return this.ordersService.create(createOrderDto, photos);
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
