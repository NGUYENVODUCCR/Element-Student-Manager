import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dokyha2004@gmail.com',
        pass: 'pampznihqhewotyw', 
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: '"Hệ thống Việc Làm" <dokyha2004@gmail.com>',
        to: email,
        subject: '🎉 Chào mừng bạn đến với hệ thống của chúng tôi!',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #2d8cf0;">👋 Xin chào ${name}!</h2>
            <p>Cảm ơn bạn đã đăng ký và trở thành một phần của <strong>cộng đồng việc làm</strong> của chúng tôi! 🌟</p>
            <hr style="margin: 20px 0;" />
            <p>Chúc bạn một ngày tuyệt vời và nhiều thành công! 💼</p>
            <p style="margin-top: 20px;">Trân trọng,<br/><strong>Đội ngũ Hệ thống Việc Làm</strong></p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email đã gửi thành công!');
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
    }
  }

  async sendNewJobNotification(email: string, jobs: any[]): Promise<void> {
    try {
      const jobItems = jobs.map(job => `<li>${job.name} - ${job.address}</li>`).join('');
      const mailOptions = {
        from: '"Hệ thống Việc Làm" <dokyha2004@gmail.com>',
        to: email,
        subject: '🆕 Việc làm mới dành cho bạn!',
        html: `
          <h3>Xin chào!</h3>
          <p>Dưới đây là một số công việc mới bạn có thể quan tâm:</p>
          <ul>${jobItems}</ul>
          <p>Hãy truy cập hệ thống để biết thêm chi tiết!</p>
        `,
      };
      await this.transporter.sendMail(mailOptions);
      console.log(`Đã gửi danh sách công việc mới tới ${email}`);
    } catch (error) {
      console.error('Lỗi khi gửi email việc làm mới:', error);
    }
  }

  async sendWeeklyThanks(email: string): Promise<void> {
    try {
      const mailOptions = {
        from: '"Hệ thống Việc Làm" <dokyha2004@gmail.com>',
        to: email,
        subject: '🙏 Cảm ơn bạn đã đồng hành!',
        html: `
          <p>Chúng tôi rất biết ơn sự đồng hành của bạn trong tuần vừa qua.</p>
          <p>Hẹn gặp lại bạn vào những tuần tới với nhiều cơ hội việc làm hấp dẫn!</p>
          <p><strong>Hệ thống Việc Làm</strong></p>
        `,
      };
      await this.transporter.sendMail(mailOptions);
      console.log(`Đã gửi thư cảm ơn tới ${email}`);
    } catch (error) {
      console.error('Lỗi khi gửi thư cảm ơn hàng tuần:', error);
    }
  }
}
