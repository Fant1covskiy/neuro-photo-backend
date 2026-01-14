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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @UseInterceptors(
    FilesInterceptor('photos', 3, {
      storage: diskStorage({
        destination: './uploads/orders',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photos = files.map((file) => file.filename);
    return this.ordersService.create(createOrderDto, photos);
  }

  @Get('admin/orders')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('orders/user/:telegramUserId')
  findByUser(@Param('telegramUserId') telegramUserId: string) { // ✅ Убрали ParseIntPipe
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
      storage: diskStorage({
        destination: './uploads/results',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadResultPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photos = files.map((file) => file.filename);
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
