import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../user/user.entity';

export class CreateWorkDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên công việc không được bỏ trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả công việc không được bỏ trống' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Loại công việc không được bỏ trống' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống' })
  address: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'ID người tạo phải là số nguyên' })
  createdBy?: number; // Bỏ bắt buộc, backend sẽ set

  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  role?: UserRole;

  @Type(() => Number)
  @IsInt({ message: 'Số người tối đa phải là số nguyên' })
  @Min(1, { message: 'Số người tối đa phải lớn hơn hoặc bằng 1' })
  @IsNotEmpty({ message: 'Vui lòng nhập số người tối đa' })
  maxReceiver: number;
}
