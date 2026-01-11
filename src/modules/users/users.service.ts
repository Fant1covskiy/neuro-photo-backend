import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOrCreateByTelegramId(
    telegramId: string,
    username?: string,
    firstName?: string,
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { telegram_id: telegramId },
    });

    if (!user) {
      user = this.userRepository.create({
        telegram_id: telegramId,
        username,
        first_name: firstName,
      });
      await this.userRepository.save(user);
    } else {
      let needsUpdate = false;
      
      if (user.username !== username) {
        user.username = username || null;
        needsUpdate = true;
      }
      
      if (user.first_name !== firstName) {
        user.first_name = firstName || null;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await this.userRepository.save(user);
      }
    }

    return user;
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { telegram_id: telegramId },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }
}
