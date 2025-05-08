// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global pipes cho validation và transform DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Bật CORS (nếu dùng frontend khác domain)
  app.enableCors();

  // Cho phép WebSocket adapter (socket.io)
  app.useWebSocketAdapter(new IoAdapter(app));

  // Middleware để đọc cookie
  app.use(cookieParser());

  // Phục vụ static files: CSS, JS, hình ảnh...
  app.use('/css', express.static(join(__dirname, '..', 'views/css')));
  app.use('/chat', express.static(join(__dirname, '..', 'src/chat')));

  // Cấu hình thư mục EJS views và view engine
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // Chạy server
  await app.listen(3000);
}
bootstrap();
