import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Không yêu cầu role cụ thể
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User not authenticated');
    }

    // Nếu là ADMIN thì luôn pass
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Nếu không thuộc roles được yêu cầu thì chặn và gửi thông báo lỗi
    if (!requiredRoles.includes(user.role)) {
      request.permissionDenied = 'Bạn không có quyền truy cập vào chức năng này'; // Lưu thông báo vào request
      throw new ForbiddenException('You do not have permission');
    }

    return true;
  }
}
