import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  
  @Injectable()
  export class AdminGuard implements CanActivate {
    constructor(private configService: ConfigService) {}
  
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
  
      const adminWhitelist = this.configService
        .get<string>('ADMIN_WHITELIST')
        ?.split(',')
        .map((id) => id.trim()) || [];
  
      if (!adminWhitelist.includes(user.telegram_id)) {
        throw new ForbiddenException('Access denied: Admin only');
      }
  
      return true;
    }
  }
  