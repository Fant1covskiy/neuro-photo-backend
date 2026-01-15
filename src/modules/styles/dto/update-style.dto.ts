import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateStyleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preview_image?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
