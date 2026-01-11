import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'bigint' })
  telegram_id: string;

  @Column({ nullable: true, type: 'varchar' })
  username: string | null;

  @Column({ nullable: true, type: 'varchar' })
  first_name: string | null;

  @CreateDateColumn()
  created_at: Date;
}
