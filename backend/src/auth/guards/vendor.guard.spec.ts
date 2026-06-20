import { ForbiddenException } from '@nestjs/common';
import { VendorGuard } from './vendor.guard';

describe('VendorGuard', () => {
  it('allows active vendor owners and exposes store flags', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          role: 'vendor',
          ownedStore: { id: 5, status: 'active' },
        }),
      },
    };
    const guard = new VendorGuard(prisma as never);
    const request: { user?: { userId: number }; vendorStoreId?: number; vendorStoreSuspended?: boolean } =
      { user: { userId: 3 } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(request.vendorStoreId).toBe(5);
    expect(request.vendorStoreSuspended).toBe(false);
  });

  it('marks suspended stores on the request', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          role: 'vendor',
          ownedStore: { id: 6, status: 'suspended' },
        }),
      },
    };
    const guard = new VendorGuard(prisma as never);
    const request: { user?: { userId: number }; vendorStoreSuspended?: boolean } =
      { user: { userId: 4 } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(request.vendorStoreSuspended).toBe(true);
  });

  it('rejects users without a vendor store', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          role: 'customer',
          ownedStore: null,
        }),
      },
    };
    const guard = new VendorGuard(prisma as never);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 8 } }),
      }),
    };

    await expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
