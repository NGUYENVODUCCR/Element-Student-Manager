import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeNewWork } from './notice-new-work.entity';
import { UserRole } from '../user/user.entity';

@Injectable()
export class NoticeNewWorkService {
  constructor(
    @InjectRepository(NoticeNewWork)
    private readonly noticeRepository: Repository<NoticeNewWork>,
  ) {}

  async create(
    data: Partial<NoticeNewWork>,
    userId: number,
  ): Promise<NoticeNewWork> {
    const notice = this.noticeRepository.create({
      ...data,
      maxAccepted: data.maxAccepted, 
      acceptedCount: 0,
      createdBy: { id: userId },
    });
    return this.noticeRepository.save(notice);
  }

  async findUnnotified(): Promise<NoticeNewWork[]> {
    return this.noticeRepository.find({
      where: { isNotified: false },
      relations: ['createdBy'],
    });
  }
  
  async markAsNotified(ids: number[]): Promise<void> {
    await this.noticeRepository.update(ids, { isNotified: true });
  }
  // ✅ Lấy tất cả công việc
  async findAll(): Promise<NoticeNewWork[]> {
    return this.noticeRepository.find({ relations: ['createdBy', 'acceptedBy'] });
  }

  // ✅ Lấy các công việc của người tạo
  async findByOwner(userId: number): Promise<NoticeNewWork[]> {
    return this.noticeRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy', 'acceptedBy'],
    });
  }

  // ✅ Lọc công việc công khai
  async findPublicNotices(): Promise<Partial<NoticeNewWork>[]> {
    const notices = await this.noticeRepository.find({ relations: ['createdBy', 'acceptedBy'] });
    return notices.map(n => this.sanitizeNotice(n));
  }

  sanitizeNotice(notice: NoticeNewWork): any {
    return {
      id: notice.id,
      name: notice.name,
      description: notice.description,
      address: notice.address,
      salary: notice.salary,
      createdById: notice.createdBy?.id,
      createdByUsername: notice.createdBy?.username,
      updated_at: notice.updated_at,
    };
  }

  // ✅ Tìm công việc theo ID
  async findOne(id: number): Promise<NoticeNewWork> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['createdBy', 'acceptedBy'],
    });
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  // ✅ Cập nhật công việc
  async update(id: number, data: Partial<NoticeNewWork>, userId: number): Promise<NoticeNewWork> {
    const notice = await this.findOne(id);
    if (notice.createdBy?.id !== userId) {
      throw new ForbiddenException('Not allowed to edit this resource');
    }
    await this.noticeRepository.update(id, data);
    return this.findOne(id);
  }

// ✅ Xoá công việc (admin hoặc chính chủ mới được xoá)
async remove(id: number, userId: number, role: UserRole): Promise<void> {
  const notice = await this.findOne(id);

  const isOwner = notice.createdBy?.id === userId;
  const isAdmin = role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new ForbiddenException('Bạn không có quyền xóa công việc này');
  }

  await this.noticeRepository.remove(notice);
}
  // ✅ Người dùng nhận việc
  async acceptWork(
    noticeId: number,
    userId: number,
    userRole: UserRole,
  ): Promise<{ success: boolean; message: string }> {
    if (userRole !== UserRole.USER) {
      throw new ForbiddenException('Chỉ người dùng (USER) mới được nhận công việc');
    }

    const notice = await this.noticeRepository.findOne({
      where: { id: noticeId },
      relations: ['acceptedBy'],
    });

    if (!notice) {
      throw new NotFoundException('Công việc không tồn tại');
    }

    if (notice.acceptedCount >= notice.maxAccepted) {
      return { success: false, message: 'Công việc đã đủ số người nhận' };
    }

    const alreadyAccepted = notice.acceptedBy.some(user => user.id === userId);
    if (alreadyAccepted) {
      return { success: false, message: 'Bạn đã nhận công việc này rồi' };
    }

    const user = { id: userId } as any;

    notice.acceptedBy.push(user);
    notice.acceptedCount += 1;

    await this.noticeRepository.save(notice);
    return { success: true, message: 'Bạn đã nhận công việc thành công' };
  }

  // ✅ Lấy các công việc user đã nhận
  async findAcceptedByUser(userId: number): Promise<NoticeNewWork[]> {
    return this.noticeRepository.find({
      where: { acceptedBy: { id: userId } },
      relations: ['createdBy', 'acceptedBy'],
    });
  }
}
