import { CartService } from './cart.service';

describe('CartService', () => {
  const product = {
    id: 10,
    title: 'Server Product',
    price: 599,
    images: ['https://example.com/p.jpg'],
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
        }),
        create: expect.objectContaining({
          productName: product.title,
          price: product.price,
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
      },
    });
  });
});
