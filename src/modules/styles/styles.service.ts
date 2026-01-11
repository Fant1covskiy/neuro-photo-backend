import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Style } from './entities/style.entity';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';

@Injectable()
export class StylesService {
  constructor(
    @InjectRepository(Style)
    private stylesRepository: Repository<Style>,
  ) {}

  async findAll(filters?: { category_id?: number; limit?: number }) {
    const where: any = { is_active: true };

    if (filters?.category_id) {
      where.category_id = filters.category_id;
    }

    const options: any = {
      where,
      order: { id: 'DESC' },
    };

    if (filters?.limit) {
      options.take = filters.limit;
    }

    return await this.stylesRepository.find(options);
  }

  async findAllAdmin() {
    return await this.stylesRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.stylesRepository.findOne({
      where: { id },
    });
  }

  async search(query: string) {
    return await this.stylesRepository
      .createQueryBuilder('style')
      .where('style.is_active = :isActive', { isActive: true })
      .andWhere(
        '(LOWER(style.name) LIKE LOWER(:query) OR LOWER(style.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      )
      .orderBy('style.id', 'DESC')
      .getMany();
  }

  async create(createStyleDto: CreateStyleDto) {
    const style = this.stylesRepository.create(createStyleDto);
    return await this.stylesRepository.save(style);
  }

  async update(id: number, updateStyleDto: UpdateStyleDto) {
    await this.stylesRepository.update(id, updateStyleDto);
    return await this.findOne(id);
  }

  async toggleActive(id: number) {
    const style = await this.findOne(id);
    if (!style) {
      throw new Error('Style not found');
    }
    style.is_active = !style.is_active;
    return await this.stylesRepository.save(style);
  }

  async remove(id: number) {
    await this.stylesRepository.delete(id);
    return { deleted: true };
  }
}
