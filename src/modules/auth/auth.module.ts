import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TelegramAuthGuard } from './guards/telegram-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [UsersModule],
  providers: [TelegramAuthGuard, AdminGuard],
  exports: [TelegramAuthGuard, AdminGuard],
})
export class AuthModule {}
