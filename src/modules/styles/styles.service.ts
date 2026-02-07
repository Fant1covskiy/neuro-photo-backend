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
      relations: ['category'],
    };

    if (filters?.limit) {
      options.take = filters.limit;
    }

    return this.stylesRepository.find(options);
  }

  async findAllAdmin() {
    return this.stylesRepository.find({
      order: { id: 'DESC' },
      relations: ['category'],
    });
  }

  async findOne(id: number) {
    return this.stylesRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async search(query: string) {
    return this.stylesRepository
      .createQueryBuilder('style')
      .leftJoinAndSelect('style.category', 'category')
      .where('style.is_active = :isActive', { isActive: true })
      .andWhere(
        '(LOWER(style.name) LIKE LOWER(:query) OR LOWER(style.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      )
      .orderBy('style.id', 'DESC')
      .getMany();
  }

  async create(createStyleDto: CreateStyleDto) {
    const style = this.stylesRepository.create({
      ...createStyleDto,
      preview_image: createStyleDto.preview_image ?? [],
    } as any);
    return this.stylesRepository.save(style as any);
  }

  async update(id: number, updateStyleDto: UpdateStyleDto) {
    if (updateStyleDto.preview_image && updateStyleDto.preview_image.length > 5) {
      updateStyleDto.preview_image = updateStyleDto.preview_image.slice(0, 5);
    }
    await this.stylesRepository.update(id, updateStyleDto as any);
    return this.findOne(id);
  }

  async addPreviewImage(id: number, url: string) {
    const style = await this.findOne(id);
    if (!style) {
      throw new Error('Style not found');
    }
    const current = Array.isArray(style.preview_image)
      ? style.preview_image
      : style.preview_image
      ? [style.preview_image as any]
      : [];
    if (current.length >= 5) {
      return style;
    }
    style.preview_image = [...current, url] as any;
    return this.stylesRepository.save(style as any);
  }

  async removePreviewImage(id: number, url: string) {
    const style = await this.findOne(id);
    if (!style) {
      throw new Error('Style not found');
    }
    const current = Array.isArray(style.preview_image)
      ? style.preview_image
      : [];
    style.preview_image = current.filter((img) => img !== url) as any;
    return this.stylesRepository.save(style as any);
  }

  async toggleActive(id: number) {
    const style = await this.findOne(id);
    if (!style) {
      throw new Error('Style not found');
    }
    style.is_active = !style.is_active;
    return this.stylesRepository.save(style);
  }

  async remove(id: number) {
    await this.stylesRepository.delete(id);
    return { deleted: true };
  }
}
