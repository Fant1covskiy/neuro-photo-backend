import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  NEW = 'new',
  WAITING = 'waiting',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  telegram_user_id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ type: 'jsonb' })
  styles: any[];

  @Column({ type: 'jsonb', default: '[]' })
  photos: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  result_photos: string[];

  @Column({ nullable: true })
  tochka_qr_id: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.NEW,
  })
  payment_status: PaymentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
