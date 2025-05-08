// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { WorkService } from '../work/work.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateWorkDto } from '../work/dto/create-work.dto';
import { User } from '../user/user.entity';
import { Work } from '../work/work.entity';
import { UserRole } from '../user/user.entity';
import { MailService } from '../mail/mail.service'; // Gộp thêm MailService

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly workService: WorkService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService, // Inject MailService
  ) {}

  /** Xác thực người dùng (cho LocalAuthGuard) */
  async validateUser(username: string, password: string): Promise<any> {
    const user: User | null = await this.userService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
  }

  /** Đăng nhập -> tạo JWT */
  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role || UserRole.USER,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /** Đăng ký tài khoản người dùng (web hoặc API) */
  async registerUser(dto: CreateUserDto): Promise<User> {
    const { username, email, name, password, confirmPassword, role, work } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Mật khẩu và xác nhận không khớp');
    }

    if (await this.userService.findByUsername(username)) {
      throw new BadRequestException('Username đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role ?? UserRole.USER;

    const user = await this.userService.create({
      username,
      email,
      name,
      password: hashedPassword,
      role: assignedRole,
    });

    // Nếu là doanh nghiệp -> tạo Work
    if (assignedRole === UserRole.WORK && work) {
      work.createdBy = user.id;
      await this.workService.create(work);
    }

    // Gửi mail xác nhận đăng ký thành công
    await this.mailService.sendWelcomeEmail(email, name);

    return user;
  }

  /** Đăng ký Work riêng (qua API riêng nếu cần) */
  async registerWork(createWorkDto: CreateWorkDto, userId: number): Promise<Work> {
    createWorkDto.createdBy = userId;
    return this.workService.create(createWorkDto);
  }
}
