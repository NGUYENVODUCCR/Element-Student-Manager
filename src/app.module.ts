import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkModule } from './work/work.module';
import { UserModule } from './user/user.module';
import { NoticeNewWorkModule } from './notice-new-work/notice-new-work.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'job-portal',
      autoLoadEntities: true,
      synchronize: true,
      driver: require('mysql2'),
    }),
    AuthModule,
    WorkModule,
    UserModule,
    NoticeNewWorkModule,
    ScheduleModule.forRoot(),
    CronModule,
    MailModule,
    ChatModule,
  ],
})
export class AppModule {}
