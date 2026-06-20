import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PAYMENT_STATUS } from '../payments/payments.constants';

describe('OrdersService', () => {
  const address = {
    addressLine: 'Street 1',
    city: 'Berlin',
    state: 'BE',
    postalCode: '10115',
    country: 'DE',
  };

  function cartLine(
    id: number,
    storeId: number,
    storeName: string,
    priceCents: number,
    quantity: number,
  ) {
    return {
      id,
      userId: 7,
      productId: 10 + id,
      storeId,
      storeName,
      productName: `Product ${id}`,
      price: priceCents,
      quantity,
      product: {
        price: priceCents,
        status: 'active',
        store: { status: 'active', name: storeName },
      },
    };
  }

  function serviceWith(
    prisma: Record<string, unknown>,
    checkout?: Record<string, unknown>,
    stripe?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) {
    const checkoutService = checkout ?? {
      persistOrders: jest.fn().mockResolvedValue([
        {
          orderId: 99,
          storeId: 1,
          storeName: 'Durmusbaba Store',
          totalAmount: 7.38,
          status: 'Pending',
        },
      ]),
    };
    const stripeService = stripe ?? {
      isConfigured: jest.fn().mockReturnValue(false),
    };
    const configService = config ?? {
      get: jest.fn().mockReturnValue('true'),
    };
    return new OrdersService(
      prisma as never,
      checkoutService as never,
      stripeService as never,
      configService as never,
    );
  }

  it('creates one order group and one order for a single-vendor cart', async () => {
    const lines = [cartLine(1, 1, 'Durmusbaba Store', 100, 2)];
    const checkoutService = {
      persistOrders: jest.fn().mockResolvedValue([
        {
          orderId: 99,
          storeId: 1,
          storeName: 'Durmusbaba Store',
          totalAmount: 7.38,
          status: 'Pending',
        },
      ]),
    };
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue(lines),
      },
      orderGroup: {
        create: jest.fn().mockResolvedValue({ id: 42 }),
      },
    };

    const result = await serviceWith(prisma, checkoutService).placeOrder(7, address);

    expect(prisma.orderGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 7,
          grandTotal: 7.38,
          paymentStatus: PAYMENT_STATUS.UNPAID,
        }),
      }),
    );
    expect(checkoutService.persistOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        orderGroupId: 42,
        paymentStatus: PAYMENT_STATUS.UNPAID,
      }),
    );
    expect(result.data.orderGroupId).toBe(42);
    expect(result.data.orders).toHaveLength(1);
  });

  it('creates separate orders per vendor in one checkout', async () => {
    const lines = [
      cartLine(1, 1, 'Durmusbaba Store', 100, 1),
      cartLine(2, 2, 'CoolAir GmbH', 200, 1),
    ];
    const checkoutService = {
      persistOrders: jest.fn().mockResolvedValue([
        { orderId: 101, storeId: 1, storeName: 'Durmusbaba Store', totalAmount: 6.19, status: 'Pending' },
        { orderId: 102, storeId: 2, storeName: 'CoolAir GmbH', totalAmount: 7.38, status: 'Pending' },
      ]),
    };
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue(lines),
      },
      orderGroup: {
        create: jest.fn().mockResolvedValue({ id: 50 }),
      },
    };

    const result = await serviceWith(prisma, checkoutService).placeOrder(7, address);

    expect(checkoutService.persistOrders).toHaveBeenCalled();
    expect(result.data.orders).toHaveLength(2);
    expect(result.data.grandTotal).toBeCloseTo(6.19 + 7.38, 2);
  });

  it('rejects checkout when a store is suspended', async () => {
    const lines = [
      {
        ...cartLine(1, 2, 'CoolAir GmbH', 100, 1),
        product: { price: 100, status: 'active', store: { status: 'suspended', name: 'CoolAir GmbH' } },
      },
    ];
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue(lines),
      },
    };

    await expect(serviceWith(prisma).placeOrder(7, address)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects checkout when a product has zero price', async () => {
    const lines = [
      {
        ...cartLine(1, 1, 'Durmusbaba Store', 0, 1),
        product: { price: 0, status: 'active', store: { status: 'active', name: 'Durmusbaba Store' } },
      },
    ];
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue(lines),
      },
    };

    await expect(serviceWith(prisma).placeOrder(7, address)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects unpaid checkout when Stripe is enabled and ALLOW_UNPAID_ORDERS is false', async () => {
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue([cartLine(1, 1, 'Durmusbaba Store', 100, 1)]),
      },
    };
    const stripe = { isConfigured: jest.fn().mockReturnValue(true) };
    const config = { get: jest.fn().mockReturnValue('false') };

    await expect(serviceWith(prisma, undefined, stripe, config).placeOrder(7, address)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
