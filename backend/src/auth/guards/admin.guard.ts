import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtUser } from '../strategies/jwt.strategy';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user: JwtUser }>();
    const userId = req.user?.userId;
    if (userId == null) {
      throw new ForbiddenException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role !== 'admin') {
      throw new ForbiddenException('Admin only');
    }
    return true;
  }
}
