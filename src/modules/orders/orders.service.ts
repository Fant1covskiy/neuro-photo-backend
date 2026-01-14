import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { cloudinary } from '../../config/cloudinary.config';

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

  async findByUser(telegramUserId: string): Promise<Order[]> {
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

  async addResultPhotos(orderId: number, photos: string[]): Promise<Order> {
    const order = await this.findOne(orderId);
    
    const currentPhotos = order.result_photos || [];
    order.result_photos = [...currentPhotos, ...photos];
    
    return this.orderRepository.save(order);
  }

  async removeResultPhoto(orderId: number, photoUrl: string): Promise<Order> {
    const order = await this.findOne(orderId);
    
    if (!order.result_photos || order.result_photos.length === 0) {
      throw new NotFoundException('No result photos found');
    }

    try {
      const urlParts = photoUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split('.')[0];
      const folder = 'neuro-photo/results';
      
      await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }

    order.result_photos = order.result_photos.filter(photo => photo !== photoUrl);
    
    return this.orderRepository.save(order);
  }
}
