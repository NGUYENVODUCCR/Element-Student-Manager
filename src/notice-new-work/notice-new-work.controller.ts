import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  Render,
} from '@nestjs/common';
import { Response } from 'express';
import { NoticeNewWorkService } from './notice-new-work.service';
import { NoticeNewWork } from './notice-new-work.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';

@Controller('notice-new-work')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticeNewWorkController {
  constructor(private readonly noticeService: NoticeNewWorkService) {}

  // ✅ Đăng bài mới (chỉ ADMIN hoặc WORK)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.WORK)
  async create(
    @Body() data: Partial<NoticeNewWork>,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      await this.noticeService.create(data, req.user.userId);
      return res.status(200).json({ message: 'Công việc đã được thêm thành công' });
    } catch (error) {
      console.error('Lỗi khi thêm công việc:', error);
      return res.status(500).json({ message: 'Thêm công việc thất bại' });
    }
  }

  // ✅ Lấy danh sách bài đăng
  @Get()
  @Roles(UserRole.ADMIN, UserRole.WORK, UserRole.USER)
  @Render('notice-new-work')
  async findAll(@Req() req) {
    const jobs = (req.user.role === UserRole.USER)
      ? await this.noticeService.findPublicNotices()
      : await this.noticeService.findAll();

    return {
      user: req.user,
      jobs,
    };
  }


// ✅ Xem chi tiết 1 bài đăng
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WORK, UserRole.USER)
  async findOne(
    @Param('id') id: string,
    @Req() req,
  ): Promise<NoticeNewWork | Partial<NoticeNewWork>> {
    const notice = await this.noticeService.findOne(+id);

    // Trả thông tin đầy đủ cho tất cả người dùng
    return notice;
  }
  // ✅ Cập nhật bài đăng
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.WORK)
  async update(
    @Param('id') id: string,
    @Body() data: Partial<NoticeNewWork>,
    @Req() req,
  ) {
    return this.noticeService.update(+id, data, req.user.userId);
  }

// ✅ Xoá bài đăng (admin hoặc người tạo)
@Delete(':id')
@Roles(UserRole.ADMIN, UserRole.WORK)
async remove(@Param('id') id: string, @Req() req) {
  const userId = req.user.userId;
  const role = req.user.role;
  return this.noticeService.remove(+id, userId, role);
}

  // ✅ Nhận việc (chỉ USER được nhận)
  @Post(':id/accept')
  @Roles(UserRole.USER)
  async acceptWork(
    @Param('id') id: string,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const result = await this.noticeService.acceptWork(+id, req.user.userId, req.user.role);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error('Lỗi nhận việc:', error);
      return res.status(500).json({ message: 'Không thể nhận công việc' });
    }
  }
}
