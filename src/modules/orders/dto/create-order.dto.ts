import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';


export class CreateOrderDto {
  @IsOptional()
  @IsInt()
  style_id?: number;


  @IsString()
  telegram_user_id: string;


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
  @IsString()
  comment?: string;


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styles?: string[];


  @IsOptional()
  @IsNumber()
  price?: number;


  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;


  @IsOptional()
  @IsBoolean()
  is_processed?: boolean;
}
