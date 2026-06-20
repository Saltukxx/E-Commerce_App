import { ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  it('allows admin users', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ role: 'admin' }),
      },
    };
    const guard = new AdminGuard(prisma as never);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 1 } }),
      }),
    };

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
  });

  it('rejects non-admin users', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ role: 'customer' }),
      },
    };
    const guard = new AdminGuard(prisma as never);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 2 } }),
      }),
    };

    await expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
