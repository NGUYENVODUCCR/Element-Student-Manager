import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  Put,
  Delete,
  ForbiddenException,
  Render,
  Query,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/user.entity';
import { Work } from './work.entity';

@Controller('works')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  private async checkUserPermission(workId: number, userId: number) {
    const work = await this.workService.findOne(workId);
    if (work.createdBy?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WORK, UserRole.USER)
  @Render('works')
  async getAllWorks(@Req() req) {
    let jobs: (Work | Partial<Work>)[] = [];

    if (req.user.role === UserRole.WORK) {
      jobs = await this.workService.findByOwner(req.user.userId);
    } else if (req.user.role === UserRole.USER) {
      jobs = await this.workService.findPublicWorks();
    } else {
      jobs = await this.workService.findAll();
    }

    return { user: req.user, jobs };
  }

  @Get('new')
  @Roles(UserRole.ADMIN, UserRole.WORK)
  @Render('create-work')
  getCreateForm() {
    return {};
  }

  @Post()
@Roles(UserRole.ADMIN, UserRole.WORK)
async createWork(
  @Body() createWorkDto: CreateWorkDto,
  @Req() req,
  @Res() res: Response,
) {
  try {
    // Gán createdBy từ JWT
    createWorkDto.createdBy = req.user.userId;
    await this.workService.create(createWorkDto); // chỉ truyền 1 đối số ✅
    return res.status(HttpStatus.CREATED).redirect('/works');
  } catch (error) {
    console.error('Error creating work:', error);
    return res.status(HttpStatus.BAD_REQUEST).render('create-work', {
      error: 'Có lỗi xảy ra khi tạo công việc',
      user: req.user,
    });
  }
}


  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WORK, UserRole.USER)
  async findOne(@Param('id') id: string, @Req() req) {
    const work = await this.workService.findOne(+id);

    if (req.user.role === UserRole.WORK) {
      await this.checkUserPermission(+id, req.user.userId);
    }

    if (req.user.role === UserRole.USER) {
      return this.workService.sanitizeWork(work);
    }

    return work;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.WORK)
  async update(@Param('id') id: string, @Body() dto: UpdateWorkDto, @Req() req) {
    const work = await this.workService.findOne(+id);

    if (req.user.role === UserRole.WORK) {
      await this.checkUserPermission(+id, req.user.userId);
    }

    return this.workService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.WORK)
  async remove(@Param('id') id: string, @Req() req) {
    const work = await this.workService.findOne(+id);

    if (req.user.role === UserRole.WORK) {
      await this.checkUserPermission(+id, req.user.userId);
    }

    return this.workService.remove(+id);
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.WORK, UserRole.USER)
  @Render('works')
  async searchWorks(@Query('keyword') keyword: string, @Req() req) {
    const jobs = await this.workService.searchWorksByKeyword(keyword);
    return { user: req.user, jobs };
  }
}