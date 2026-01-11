import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('styles')
export class Style {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'category_id', type: 'int' })
  category_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'preview_image', type: 'text', nullable: true })
  preview_image: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;
}
