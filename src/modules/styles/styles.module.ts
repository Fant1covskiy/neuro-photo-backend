import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylesController } from './styles.controller';
import { StylesService } from './styles.service';
import { Style } from './style.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Style, Category])],
  controllers: [StylesController],
  providers: [StylesService],
  exports: [StylesService],
})
export class StylesModule {}
