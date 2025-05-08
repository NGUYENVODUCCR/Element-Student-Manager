import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { MailModule } from '../mail/mail.module';
import { NoticeNewWorkModule } from '../notice-new-work/notice-new-work.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MailModule,
    NoticeNewWorkModule,
    UserModule,
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
