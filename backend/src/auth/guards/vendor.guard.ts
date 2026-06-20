import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtUser } from '../strategies/jwt.strategy';

@Injectable()
export class VendorGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user: JwtUser }>();
    const userId = req.user?.userId;
    if (userId == null) {
      throw new ForbiddenException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        ownedStore: { select: { id: true, status: true } },
      },
    });
    if (user?.role !== 'vendor' || user.ownedStore == null) {
      throw new ForbiddenException('Vendor only');
    }
    (req as { vendorStoreId?: number; vendorStoreSuspended?: boolean }).vendorStoreId =
      user.ownedStore.id;
    (req as { vendorStoreSuspended?: boolean }).vendorStoreSuspended =
      user.ownedStore.status === 'suspended';
    return true;
  }
}
