import { ProductsService } from './products.service';

import { sellableProductWhere } from '../common/marketplace';

const createdAt = new Date('2026-01-01T00:00:00.000Z');

const category = {
  id: 1,
  name: 'Compressors',
  slug: 'compressors',
  image: '',
  createdAt,
  updatedAt: createdAt,
};

const store = {
  id: 1,
  name: 'DRC-Kältetechnik',
  slug: 'drc-kaltetechnik',
  logo: '',
  banner: '',
  description: '',
  deliveryArea: '',
  city: '',
  website: '',
  certifications: [],
  status: 'active',
  contactEmail: '',
  phone: '',
  isFeatured: true,
  stripeAccountId: null,
  stripeOnboardingComplete: false,
  payoutsEnabled: false,
  ownerUserId: null,
  createdAt,
  updatedAt: createdAt,
};

function product(id: number, price: number) {
  return {
    id,
    title: `Product ${id}`,
    slug: `product-${id}`,
    description: '',
    price,
    status: 'active',
    images: ['img.jpg'],
    categoryId: category.id,
    storeId: store.id,
    createdAt,
    updatedAt: createdAt,
    category,
    store,
  };
}

describe('ProductsService', () => {
  it('returns priced products before inquiry products in a single query', async () => {
    const prisma = {
      product: {
        findMany: jest
          .fn()
          .mockResolvedValue([product(2, 2500), product(4, 900), product(1, 0)]),
        count: jest.fn().mockResolvedValue(42),
      },
    };
    const service = new ProductsService(prisma as never);

    const result = await service.findAll(undefined, 3, 0, undefined, undefined, undefined, 'default');

    expect(result).toEqual({
      data: expect.arrayContaining([
        expect.objectContaining({ id: 2 }),
        expect.objectContaining({ id: 4 }),
        expect.objectContaining({ id: 1 }),
      ]),
      meta: { total: 42, skip: 0, limit: 3 },
    });
    expect((result as { data: { id: number }[] }).data.map((p) => p.id)).toEqual([2, 4, 1]);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: sellableProductWhere,
        take: 3,
        skip: 0,
        orderBy: [{ price: 'desc' }, { id: 'asc' }],
      }),
    );
  });

  it('returns card view payload without description', async () => {
    const prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([product(2, 2500)]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    const service = new ProductsService(prisma as never);

    const result = await service.findAll(undefined, 1, 0, undefined, undefined, undefined, 'default', 'card');

    expect((result as { data: unknown[] }).data[0]).toEqual({
      id: 2,
      title: 'Product 2',
      slug: 'product-2',
      price: 2500,
      images: ['img.jpg'],
      store: { id: 1, name: 'DRC-Kältetechnik', slug: 'drc-kaltetechnik', logo: '' },
    });
  });

  it('orders newest products with priced-first ordering', async () => {
    const prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([product(5, 1200), product(1, 0)]),
        count: jest.fn().mockResolvedValue(2),
      },
      orderLine: {
        groupBy: jest.fn(),
      },
    };
    const service = new ProductsService(prisma as never);

    const result = await service.findAll(undefined, 2, 0, undefined, undefined, undefined, 'newest');

    expect((result as { data: { id: number }[] }).data.map((p) => p.id)).toEqual([5, 1]);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ price: 'desc' }, { createdAt: 'desc' }],
      }),
    );
  });

  it('falls back to newest products when no order history exists for bestselling', async () => {
    const prisma = {
      product: {
        findMany: jest.fn().mockResolvedValueOnce([product(9, 1500)]),
        count: jest.fn().mockResolvedValue(1),
      },
      orderLine: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
    };
    const service = new ProductsService(prisma as never);

    const result = await service.findAll(undefined, 1, 0, undefined, undefined, undefined, 'bestselling');

    expect((result as { data: { id: number }[] }).data.map((p) => p.id)).toEqual([9]);
    expect(prisma.orderLine.groupBy).toHaveBeenCalled();
  });

  it('returns alternate offers for the same slug excluding current store', async () => {
    const otherStore = { ...store, id: 2, name: 'Other', slug: 'other' };
    const prisma = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          { ...product(10, 1800), store: otherStore },
        ]),
      },
    };
    const service = new ProductsService(prisma as never);

    const result = await service.findOffersBySlug('product-1', 'drc-kaltetechnik');

    expect(result).toHaveLength(1);
    expect(result[0].store.slug).toBe('other');
  });
});
