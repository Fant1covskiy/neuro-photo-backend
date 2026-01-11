import { IsString, IsNumber, IsInt, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateStyleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  category_id: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  preview_image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
