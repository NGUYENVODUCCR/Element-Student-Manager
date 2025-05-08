import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Render,
  Res,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userData: CreateUserDto): Promise<User> {
    const { password, confirmPassword, ...rest } = userData;

    if (password !== confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    return this.userService.create({ ...rest, password });
  }

  @Get()
  @Render('users')
  async findAll(@Req() req: Request) {
    const users = await this.userService.findAll();
    return {
      users,
      currentUser: req.user, // ✅ Truyền currentUser vào EJS
    };
  }

  @Get('edit/:id')
  @Render('edit-user')
  async editForm(@Param('id') id: string) {
    const user = await this.userService.findOne(Number(id));
    return { user };
  }

  @Post('edit/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: Partial<User>,
    @Res() res: Response,
  ) {
    await this.userService.update(Number(id), data);
    return res.redirect('/users');
  }

  @Post('delete/:id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    await this.userService.remove(Number(id));
    return res.redirect('/users');
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(Number(id));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
  ): Promise<User> {
    return this.userService.update(Number(id), userData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(Number(id));
  }
}
