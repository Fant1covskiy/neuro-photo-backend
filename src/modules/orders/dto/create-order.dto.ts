import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateOrderDto {
  @Transform(({ value }) => parseInt(value)) // Преобразуем строку в число
  @IsNumber()
  @IsNotEmpty()
  telegram_user_id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @Transform(({ value }) => {
    // Если пришла строка JSON - парсим
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

  @Transform(({ value }) => parseFloat(value)) // Преобразуем строку в число
  @IsNumber()
  @IsNotEmpty()
  total_price: number;

  @IsOptional()
  photos?: any[];
}
