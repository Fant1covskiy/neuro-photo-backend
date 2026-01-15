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

    return this.stylesRepository.find(options);
  }

  async findAllAdmin() {
    return this.stylesRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.stylesRepository.findOne({
      where: { id },
    });
  }

  async search(query: string) {
    return this.stylesRepository
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
    const preview_images =
      createStyleDto.preview_images?.slice(0, 5) || [];
    const style = this.stylesRepository.create({
      ...createStyleDto,
      preview_images,
    });
    return this.stylesRepository.save(style);
  }

  async update(id: number, updateStyleDto: UpdateStyleDto) {
    if (updateStyleDto.preview_images) {
      updateStyleDto.preview_images =
        updateStyleDto.preview_images.slice(0, 5);
    }
    await this.stylesRepository.update(id, updateStyleDto);
    return this.findOne(id);
  }

  async updatePreviewImage(id: number, url: string) {
    const style = await this.findOne(id);
    if (!style) {
      throw new Error('Style not found');
    }
    style.preview_images = style.preview_images || [];
    if (!style.preview_images.length) {
      style.preview_images = [url];
    } else {
      style.preview_images[0] = url;
    }
    style.preview_images = style.preview_images.slice(0, 5);
    return this.stylesRepository.save(style);
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
