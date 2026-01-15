import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('styles')
export class Style {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  category_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('text', { nullable: true })
  preview_image: string | null;

  @Column({ default: true })
  is_active: boolean;
}
