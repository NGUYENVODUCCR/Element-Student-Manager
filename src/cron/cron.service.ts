import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NoticeNewWorkService } from '../notice-new-work/notice-new-work.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly noticeService: NoticeNewWorkService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  // ⏱ Gửi mỗi 2 tiếng các công việc chưa gửi (isNotified = false)
  @Cron('*/2 * * * *')
  async notifyNewJobs() {
    this.logger.log('Đang gửi email công việc mới...');
    const newJobs = await this.noticeService.findUnnotified();
    const users = await this.userService.findAll();

    if (newJobs.length > 0) {
      for (const user of users) {
        await this.mailService.sendNewJobNotification(user.email, newJobs);
      }
      await this.noticeService.markAsNotified(newJobs.map(j => j.id));
      this.logger.log(`Đã gửi ${newJobs.length} công việc mới đến ${users.length} người dùng.`);
    }
  }

  // ⏱ Gửi mỗi sáng thứ 7 lúc 8 giờ
  @Cron('01 05 * * 4')
  async sendWeeklyThanks() {
    this.logger.log('Đang gửi email cảm ơn cuối tuần...');
    const users = await this.userService.findAll();
    for (const user of users) {
      await this.mailService.sendWeeklyThanks(user.email);
    }
    this.logger.log(`Đã gửi email cảm ơn đến ${users.length} người dùng.`);
  }
}
