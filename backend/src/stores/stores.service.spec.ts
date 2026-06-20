import { StoresService } from './stores.service';
import { PRODUCT_STATUS } from '../common/marketplace';

const createdAt = new Date('2026-01-01T00:00:00.000Z');

const store = {
  id: 1,
  name: 'DRC-Kältetechnik',
  slug: 'drc-kaltetechnik',
  logo: '',
  banner: '',
  description: 'HVAC',
  deliveryArea: 'Deutschland',
  city: 'Hamburg',
  website: '',
  certifications: ['F-Gas zertifiziert'],
  status: 'active',
  contactEmail: 'shop@example.com',
  phone: '+49',
  isFeatured: true,
  stripeAccountId: null,
  stripeOnboardingComplete: true,
  payoutsEnabled: true,
  ownerUserId: null,
  createdAt,
  updatedAt: createdAt,
};

describe('StoresService', () => {
  it('returns store detail with categories and featured products', async () => {
    const category = {
      id: 3,
      name: 'Compressors',
      slug: 'compressors',
      image: '',
      createdAt,
      updatedAt: createdAt,
    };
    const productRow = {
      id: 10,
      title: 'Compressor A',
      slug: 'compressor-a',
      description: '',
      price: 1000,
      stockQty: 1,
      images: [],
      status: PRODUCT_STATUS.ACTIVE,
      categoryId: 3,
      storeId: 1,
      createdAt,
      updatedAt: createdAt,
      category,
      store,
    };

    const prisma = {
      store: {
        findFirst: jest.fn().mockResolvedValue(store),
      },
      product: {
        count: jest.fn().mockResolvedValue(5),
        groupBy: jest.fn().mockResolvedValue([{ categoryId: 3, _count: { _all: 5 } }]),
      },
      category: {
        findMany: jest.fn().mockResolvedValue([category]),
      },
      storeFeaturedProduct: {
        findMany: jest.fn().mockResolvedValue([
          { product: productRow, sortOrder: 0 },
        ]),
      },
      priceInquiry: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const productsService = { findAll: jest.fn() };
    const service = new StoresService(prisma as never, productsService as never);

    const result = await service.findBySlug('drc-kaltetechnik');

    expect(result.data.productCount).toBe(5);
    expect(result.data.categories).toHaveLength(1);
    expect(result.data.featuredProducts).toHaveLength(1);
    expect(result.data.paymentsReady).toBe(true);
    expect(result.data.certifications).toEqual(['F-Gas zertifiziert']);
  });
});
