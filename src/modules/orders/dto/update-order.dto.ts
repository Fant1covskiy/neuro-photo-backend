import { IsString, IsNumber, IsEnum, IsArray, IsOptional } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';


export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  telegram_user_id?: string;


  @IsOptional()
  @IsString()
  username?: string;


  @IsOptional()
  @IsString()
  first_name?: string;


  @IsOptional()
  @IsString()
  last_name?: string;


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styles?: string[];


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];


  @IsOptional()
  @IsNumber()
  total_price?: number;


  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  result_photos?: string[];


  @IsOptional()
  @IsString()
  tochka_qr_id?: string;


  @IsOptional()
  @IsString()
  qr_code_url?: string;


  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;
}
