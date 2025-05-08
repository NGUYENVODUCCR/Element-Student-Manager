import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Render,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** GET: Trang đăng nhập */
  @Get('login')
  @Render('login')
  getLoginPage() {
    return {};
  }

  /** POST: Xử lý đăng nhập (Web) */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async loginWeb(@Req() req: Request, @Res() res: Response) {
    const { access_token } = await this.authService.login(req.user);
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: false, // Bật true nếu chạy HTTPS
      maxAge: 3600000, // 1 giờ
    });
    return res.redirect('/notice-new-work'); // Hoặc chuyển hướng tùy vai trò
  }

  /** POST: Đăng nhập dạng API */
  @Post('login/api')
  @UseGuards(LocalAuthGuard)
  async loginApi(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  /** POST: Đăng xuất */
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.redirect('/auth/login');
  }

  /** GET: Trang đăng ký */
  @Get('register/users')
  @Render('register')
  showRegisterPage() {
    return {};
  }

  /** POST: Xử lý đăng ký */
  @Post('register/users')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    const { password, confirmPassword } = createUserDto;

    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      throw new BadRequestException('Mật khẩu và xác nhận không khớp');
    }

    // Gọi service để tạo user (và tạo work nếu là doanh nghiệp)
    await this.authService.registerUser(createUserDto);

    // Chuyển hướng về trang đăng nhập
    return res.redirect('/auth/login');
  }
}
