import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  telegram_user_id: string; // ✅ Изменили на string

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ type: 'jsonb' })
  styles: any[];

  @Column({ type: 'jsonb' })
  photos: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  result_photos: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
