import { BadRequestException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { PAYMENT_STATUS } from './payments.constants';

describe('CheckoutService', () => {
  const ledger = {
    isPlatformLedgerMode: () => false,
    creditFromOrder: jest.fn(),
  };

  const address = {
    addressLine: 'Street 1',
    city: 'Berlin',
    state: 'BE',
    postalCode: '10115',
    country: 'DE',
  };

  function cartLine(id: number, storeId: number, priceCents: number) {
    return {
      id,
      userId: 7,
      productId: 10 + id,
      storeId,
      storeName: 'Durmusbaba Store',
      productName: `Product ${id}`,
      price: priceCents,
      quantity: 1,
      product: {
        price: priceCents,
        status: 'active',
        store: { status: 'active', name: 'Durmusbaba Store', id: storeId },
      },
    };
  }

  it('rejects checkout session when payments are disabled', async () => {
    const service = new CheckoutService({} as never, {
      isConfigured: () => false,
    } as never, ledger as never);

    await expect(service.createSession(7, address)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects checkout when vendor is not onboarded to Stripe', async () => {
    const lines = [cartLine(1, 1, 100)];
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue(lines),
      },
      store: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          stripeAccountId: null,
          payoutsEnabled: false,
        }),
      },
    };
    const stripeService = {
      isConfigured: () => true,
      isMultiVendorEnabled: () => false,
      createPaymentIntent: jest.fn(),
      getPublishableKey: () => 'pk_test',
    };
    const service = new CheckoutService(prisma as never, stripeService as never, ledger as never);

    await expect(service.createSession(7, address)).rejects.toThrow(
      'not ready to accept card payments',
    );
  });

  it('creates checkout session for onboarded single-vendor cart', async () => {
    const lines = [cartLine(1, 1, 100)];
    const prisma = {
      cartLine: {
        findMany: jest.fn().mockResolvedValue(lines),
      },
      store: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          stripeAccountId: 'acct_123',
          payoutsEnabled: true,
        }),
      },
      orderGroup: {
        create: jest.fn().mockResolvedValue({ id: 88, grandTotal: 6.19 }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const stripeService = {
      isConfigured: () => true,
      isMultiVendorEnabled: () => false,
      getPublishableKey: () => 'pk_test',
      createPaymentIntent: jest.fn().mockResolvedValue({
        id: 'pi_123',
        client_secret: 'sec_123',
      }),
    };
    const service = new CheckoutService(prisma as never, stripeService as never, ledger as never);

    const result = await service.createSession(7, address);

    expect(result.data.checkoutId).toBe(88);
    expect(result.data.clientSecret).toBe('sec_123');
    expect(prisma.orderGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentStatus: PAYMENT_STATUS.AWAITING_PAYMENT,
        }),
      }),
    );
  });
});
