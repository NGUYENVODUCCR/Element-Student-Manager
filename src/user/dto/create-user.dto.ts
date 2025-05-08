// src/user/dto/create-user.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  ValidateIf,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../user.entity';
import { CreateWorkDto } from '../../work/dto/create-work.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @ValidateIf(o => o.role === UserRole.WORK)
  @ValidateNested()
  @Type(() => CreateWorkDto)
  @IsOptional()
  work?: CreateWorkDto;
}