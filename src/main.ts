import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Разрешаем ВСЕ origins (для разработки)
  app.enableCors({
    origin: '*',  // Разрешить всё
    credentials: false,
  });

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}
bootstrap();
console.log('TOCHKA_MERCHANT_ID=', JSON.stringify(process.env.TOCHKA_MERCHANT_ID));
console.log('TOCHKA_ACCOUNT_ID=', JSON.stringify(process.env.TOCHKA_ACCOUNT_ID));
console.log('TOCHKA_BANK_CODE=', JSON.stringify(process.env.TOCHKA_BANK_CODE));
