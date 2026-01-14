import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @Transform(({ value }) => value.toString()) // ✅ Преобразуем в строку
  @IsString()
  @IsNotEmpty()
  telegram_user_id: string; // ✅ Изменили на string

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  @IsNotEmpty()
  styles: any[];

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsNotEmpty()
  total_price: number;

  @IsOptional()
  photos?: any[];
}
