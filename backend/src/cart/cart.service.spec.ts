import { CartService } from './cart.service';
import { computeVendorTotals } from '../common/marketplace';

describe('CartService', () => {
  const product = {
    id: 10,
    title: 'Server Product',
    price: 599,
    status: 'active',
    storeId: 1,
    stockQty: null,
    images: ['https://example.com/p.jpg'],
    store: { id: 1, name: 'Durmusbaba Store', status: 'active' },
  };

  function serviceWith(prisma: Record<string, unknown>) {
    return new CartService(prisma as never);
  }

  it('uses canonical product values when adding to cart', async () => {
    const prisma = {
      product: {
        findUnique: jest.fn().mockResolvedValue(product),
      },
      cartLine: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    await serviceWith(prisma).add(1, {
      userId: 1,
      productId: product.id,
      productName: 'Tampered',
      price: 0,
      quantity: 2,
    });

    expect(prisma.cartLine.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          productName: product.title,
          price: product.price,
          storeId: 1,
          storeName: 'Durmusbaba Store',
        }),
        create: expect.objectContaining({
          productName: product.title,
          price: product.price,
          storeId: 1,
          storeName: 'Durmusbaba Store',
        }),
      }),
    );
  });

  it('uses canonical product values when updating quantity', async () => {
    const prisma = {
      cartLine: {
        findFirst: jest.fn().mockResolvedValue({
          id: 20,
          userId: 1,
          productId: product.id,
          product,
        }),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    await serviceWith(prisma).updateQuantity(1, 20, {
      userId: 1,
      productId: product.id,
      productName: 'Tampered',
      price: 0,
      quantity: 5,
    });

    expect(prisma.cartLine.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: {
        quantity: 5,
        productName: product.title,
        price: product.price,
        imageUrl: product.images[0],
        storeId: 1,
        storeName: 'Durmusbaba Store',
      },
    });
  });

  it('returns grouped cart summary with per-vendor shipping', async () => {
    const makeLine = (overrides: Record<string, unknown>) => ({
      id: 1,
      userId: 1,
      productId: 10,
      storeId: 1,
      storeName: 'Durmusbaba Store',
      quantity: 1,
      productName: 'A',
      price: 1000,
      imageUrl: null,
      name: '',
      product: {
        status: 'active',
        price: 1000,
        store: { status: 'active' },
      },
      ...overrides,
    });
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue([
          makeLine({ id: 1, productId: 10, storeId: 1, price: 1000, product: { status: 'active', price: 1000, store: { status: 'active' } } }),
          makeLine({
            id: 2,
            productId: 11,
            storeId: 2,
            storeName: 'CoolAir GmbH',
            price: 2000,
            product: { status: 'active', price: 2000, store: { status: 'active' } },
          }),
        ]),
      },
    };

    const result = await serviceWith(prisma).summary(1);

    expect(result.data.groups).toHaveLength(2);
    expect(result.data.grandShipping).toBe(10);
    expect(result.data.grandTotal).toBeCloseTo(
      computeVendorTotals(1000).total + computeVendorTotals(2000).total,
      2,
    );
  });

  it('excludes invalid lines from summary and returns warnings', async () => {
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            userId: 1,
            productId: 10,
            storeId: 1,
            storeName: 'Durmusbaba Store',
            quantity: 1,
            productName: 'Good',
            price: 1000,
            imageUrl: null,
            name: '',
            product: {
              status: 'active',
              price: 1000,
              store: { status: 'active' },
            },
          },
          {
            id: 2,
            userId: 1,
            productId: 11,
            storeId: 2,
            storeName: 'Suspended Seller',
            quantity: 1,
            productName: 'Bad',
            price: 500,
            imageUrl: null,
            name: '',
            product: {
              status: 'active',
              price: 500,
              store: { status: 'suspended' },
            },
          },
        ]),
      },
    };

    const result = await serviceWith(prisma).summary(1);

    expect(result.data.groups).toHaveLength(1);
    expect(result.data.warnings).toHaveLength(1);
    expect(result.data.warnings[0]).toContain('Suspended Seller');
  });
});
