// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { WorkModule } from '../work/work.module';

import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // 🛠️ Đăng ký chiến lược jwt
    JwtModule.register({
      secret: 'my_super_secret', // Hoặc dùng process.env.JWT_SECRET
      signOptions: { expiresIn: '1d' },
    }),
    UserModule,
    WorkModule,
    MailModule, 
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], // 👈 Thêm JwtStrategy
  exports: [AuthService],
})
export class AuthModule {}
