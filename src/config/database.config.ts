import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL || configService.get('DATABASE_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };
};
