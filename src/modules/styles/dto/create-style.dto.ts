import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateStyleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  category_id: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  preview_image?: string; // ОДНА строка, не массив

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
