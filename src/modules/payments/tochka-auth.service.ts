import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class TochkaAuthService {
  getToken(): string {
    const token = process.env.TOCHKA_JWT_TOKEN || '';
    if (!token || !token.startsWith('eyJ')) {
      throw new BadRequestException('TOCHKA_JWT_TOKEN is missing');
    }
    return token;
  }
}
