import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, photos: string[]): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      photos,
      status: OrderStatus.PENDING,
    });
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(telegramUserId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { telegram_user_id: telegramUserId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  // 🆕 Добавить готовые фото к заказу
  async addResultPhotos(orderId: number, photos: string[]): Promise<Order> {
    const order = await this.findOne(orderId);
    
    // Добавляем новые фото к существующим
    const currentPhotos = order.result_photos || [];
    order.result_photos = [...currentPhotos, ...photos];
    
    return this.orderRepository.save(order);
  }

  // 🆕 Удалить готовое фото
  async removeResultPhoto(orderId: number, photoUrl: string): Promise<Order> {
    const order = await this.findOne(orderId);
    
    if (!order.result_photos || order.result_photos.length === 0) {
      throw new NotFoundException('No result photos found');
    }

    // Удаляем файл с диска
    const filePath = path.join('./uploads/results', photoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Удаляем из массива
    order.result_photos = order.result_photos.filter(photo => photo !== photoUrl);
    
    return this.orderRepository.save(order);
  }
}
