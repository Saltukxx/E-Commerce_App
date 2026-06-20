import { BadRequestException, ConflictException } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';

describe('StoreApplicationsService', () => {
  function serviceWith(prisma: Record<string, unknown>) {
    return new StoreApplicationsService(prisma as never);
  }

  it('approve is idempotent when application already approved', async () => {
    const store = {
      id: 5,
      name: 'CoolAir',
      slug: 'coolair',
      logo: '',
      description: '',
      status: 'active',
      contactEmail: '',
      phone: '',
      isFeatured: false,
      ownerUserId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const prisma = {
      storeApplication: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          status: 'approved',
          createdStoreId: 5,
          contactEmail: 'vendor@example.com',
        }),
      },
      store: {
        findUnique: jest.fn().mockResolvedValue(store),
      },
    };

    const result = await serviceWith(prisma).approve(1, 99);
    expect(result.msg).toBe('Already approved');
    expect(result.data && 'slug' in result.data ? result.data.slug : null).toBe('coolair');
  });

  it('approve rejects when contact email already owns a store', async () => {
    const prisma = {
      storeApplication: {
        findUnique: jest.fn().mockResolvedValue({
          id: 2,
          status: 'pending',
          contactEmail: 'vendor@example.com',
          businessName: 'Test',
          contactName: 'Test',
          phone: '',
          message: '',
        }),
      },
      store: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn(async (fn) => {
        const tx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({
              id: 3,
              ownedStore: { id: 9 },
            }),
            create: jest.fn(),
            update: jest.fn(),
          },
          store: { create: jest.fn() },
          storeApplication: { update: jest.fn() },
        };
        return fn(tx);
      }),
    };

    await expect(serviceWith(prisma).approve(2, 99)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('reject fails when application is not pending', async () => {
    const prisma = {
      storeApplication: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          status: 'rejected',
        }),
      },
    };

    await expect(serviceWith(prisma).reject(1, 99)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
