import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { validateTelegramWebAppData } from '../telegram.utils';
  import { UsersService } from '../../users/users.service';
  
  @Injectable()
  export class TelegramAuthGuard implements CanActivate {
    constructor(
      private configService: ConfigService,
      private usersService: UsersService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const initData = request.headers['x-telegram-init-data'] || request.headers['authorization']?.replace('tma ', '');
  
      if (!initData) {
        throw new UnauthorizedException('Telegram init data not provided');
      }
  
      const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      
      if (!botToken) {
        throw new UnauthorizedException('Bot token not configured');
      }
  
      const validatedData = validateTelegramWebAppData(initData, botToken);
  
      if (!validatedData || !validatedData.user) {
        throw new UnauthorizedException('Invalid Telegram init data');
      }
  
      const user = await this.usersService.findOrCreateByTelegramId(
        validatedData.user.id.toString(),
        validatedData.user.username,
        validatedData.user.first_name,
      );
  
      request.user = user;
      return true;
    }
  }
  