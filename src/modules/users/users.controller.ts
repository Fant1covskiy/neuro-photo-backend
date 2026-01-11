import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramAuthGuard } from '../auth/guards/telegram-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(TelegramAuthGuard)
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }
}
