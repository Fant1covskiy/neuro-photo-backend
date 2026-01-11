import { IsEnum, IsOptional, IsArray } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsArray()
  @IsOptional()
  result_photos?: string[];
}
