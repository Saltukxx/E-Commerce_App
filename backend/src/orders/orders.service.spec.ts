import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const address = {
    addressLine: 'Street 1',
    city: 'Berlin',
    state: 'BE',
    postalCode: '10115',
    country: 'DE',
  };

  function serviceWith(prisma: Record<string, unknown>) {
    return new OrdersService(prisma as never);
  }

  it('creates orders from cart rows inside a transaction and deletes only selected rows', async () => {
    const lines = [
      {
        id: 1,
        userId: 7,
        productId: 11,
        productName: 'Product',
        price: 100,
        quantity: 2,
      },
    ];
    const tx = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue(lines),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        create: jest.fn().mockResolvedValue({ id: 99 }),
      },
      orderLine: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      $transaction: jest.fn((cb: (client: typeof tx) => Promise<unknown>) =>
        cb(tx),
      ),
    };

    await serviceWith(prisma).placeOrder(7, address);

    expect(tx.order.create.mock.invocationCallOrder[0]).toBeLessThan(
      tx.cartLine.deleteMany.mock.invocationCallOrder[0],
    );
    expect(tx.orderLine.create.mock.invocationCallOrder[0]).toBeLessThan(
      tx.cartLine.deleteMany.mock.invocationCallOrder[0],
    );
    expect(tx.cartLine.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [1] }, userId: 7 },
    });
    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: 243,
        }),
      }),
    );
    expect(tx.orderLine.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          productName: 'Product',
          price: 100,
          quantity: 2,
        }),
      }),
    );
  });

  it('rejects checkout when cart rows changed before deletion', async () => {
    const tx = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            userId: 7,
            productId: 11,
            productName: 'Product',
            price: 100,
            quantity: 1,
          },
        ]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      order: { create: jest.fn().mockResolvedValue({ id: 99 }) },
      orderLine: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: jest.fn((cb: (client: typeof tx) => Promise<unknown>) =>
        cb(tx),
      ),
    };

    await expect(serviceWith(prisma).placeOrder(7, address)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tx.order.create).toHaveBeenCalled();
  });
});
