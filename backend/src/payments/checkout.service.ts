import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressOrderDto } from '../orders/dto/address-order.dto';
import {
  eurosToStripeCents,
  prepareCheckout,
  type PreparedCheckout,
  type VendorCheckoutGroup,
} from '../common/checkout-cart';
import { StripeService } from './stripe.service';
import { PAYMENT_STATUS } from './payments.constants';
import { VendorLedgerService } from '../vendor/vendor-ledger.service';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private ledger: VendorLedgerService,
  ) {}

  async createSession(userId: number, address: AddressOrderDto) {
    if (!this.stripeService.isConfigured()) {
      throw new BadRequestException('PAYMENTS_DISABLED');
    }

    const prepared = await prepareCheckout(this.prisma, userId);
    await this.assertVendorsReadyForPayment(prepared);

    const orderGroup = await this.prisma.orderGroup.create({
      data: {
        userId,
        grandTotal: prepared.grandTotal,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        paymentStatus: PAYMENT_STATUS.AWAITING_PAYMENT,
      },
    });

    const paymentIntent = await this.stripeService.createPaymentIntent({
      amountCents: eurosToStripeCents(prepared.grandTotal),
      orderGroupId: orderGroup.id,
      userId,
    });

    await this.prisma.orderGroup.update({
      where: { id: orderGroup.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return {
      data: {
        checkoutId: orderGroup.id,
        clientSecret: paymentIntent.client_secret,
        publishableKey: this.stripeService.getPublishableKey(),
        grandTotal: prepared.grandTotal,
      },
      msg: 'Checkout session created',
    };
  }

  async getStatus(userId: number, checkoutId: number) {
    const group = await this.prisma.orderGroup.findFirst({
      where: { id: checkoutId, userId },
      include: {
        orders: {
          include: { store: true },
        },
      },
    });
    if (!group) {
      throw new NotFoundException('Checkout not found');
    }

    return {
      data: {
        checkoutId: group.id,
        paymentStatus: group.paymentStatus,
        grandTotal: group.grandTotal,
        paidAt: group.paidAt?.toISOString() ?? null,
        orders:
          group.paymentStatus === PAYMENT_STATUS.PAID
            ? group.orders.map((o) => ({
                orderId: o.id,
                storeId: o.storeId,
                storeName: o.store.name,
                totalAmount: o.totalAmount,
                status: o.status,
              }))
            : [],
      },
      msg: 'Checkout status',
    };
  }

  async handlePaymentIntentSucceeded(paymentIntentId: string) {
    const group = await this.prisma.orderGroup.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!group) {
      return;
    }
    if (group.paymentStatus === PAYMENT_STATUS.PAID) {
      return;
    }

    await this.fulfillPaidOrderGroup(group.id, group.userId);
  }

  async fulfillPaidOrderGroup(orderGroupId: number, userId: number) {
    const group = await this.prisma.orderGroup.findFirst({
      where: { id: orderGroupId, userId },
    });
    if (!group) {
      throw new NotFoundException('Checkout not found');
    }
    if (group.paymentStatus === PAYMENT_STATUS.PAID) {
      return this.buildFulfillmentResponse(orderGroupId);
    }

    const prepared = await prepareCheckout(this.prisma, userId);
    if (Math.abs(prepared.grandTotal - group.grandTotal) > 0.01) {
      throw new BadRequestException('Cart total changed since checkout started');
    }

    const createdOrders = await this.persistOrders({
      userId,
      orderGroupId,
      address: {
        addressLine: group.addressLine,
        city: group.city,
        state: group.state,
        postalCode: group.postalCode,
        country: group.country,
      },
      prepared,
      paymentStatus: PAYMENT_STATUS.PAID,
    });

    await this.createVendorTransfers(orderGroupId, createdOrders);
    if (this.ledger.isPlatformLedgerMode()) {
      for (const order of createdOrders) {
        await this.ledger.creditFromOrder({
          id: order.orderId,
          storeId: order.storeId,
          totalAmount: order.totalAmount,
        });
      }
    }

    return this.buildFulfillmentResponse(orderGroupId);
  }

  async persistOrders(params: {
    userId: number;
    orderGroupId: number;
    address: AddressOrderDto;
    prepared: PreparedCheckout;
    paymentStatus: string;
  }) {
    const { userId, orderGroupId, address, prepared, paymentStatus } = params;

    return this.prisma.$transaction(async (tx) => {
      const createdOrders: {
        orderId: number;
        storeId: number;
        storeName: string;
        totalAmount: number;
        status: string;
        stripeTransferId?: string;
      }[] = [];

      for (const group of prepared.vendorGroups) {
        const o = await tx.order.create({
          data: {
            userId,
            storeId: group.storeId,
            orderGroupId,
            status: 'Pending',
            paymentStatus,
            subtotal: group.totals.subtotal,
            shipping: group.totals.shipping,
            tax: group.totals.tax,
            totalAmount: group.totals.total,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
        });

        for (const l of group.lines) {
          await tx.orderLine.create({
            data: {
              orderId: o.id,
              productId: l.productId,
              storeId: l.storeId,
              productName: l.productName,
              price: l.product.price,
              quantity: l.quantity,
              userId,
            },
          });
        }

        createdOrders.push({
          orderId: o.id,
          storeId: group.storeId,
          storeName: group.storeName,
          totalAmount: group.totals.total,
          status: o.status,
        });
      }

      const deleted = await tx.cartLine.deleteMany({
        where: { id: { in: prepared.lineIds }, userId },
      });
      if (deleted.count !== prepared.lines.length) {
        throw new BadRequestException('Cart changed during checkout');
      }

      await tx.orderGroup.update({
        where: { id: orderGroupId },
        data: {
          paymentStatus:
            paymentStatus === PAYMENT_STATUS.PAID
              ? PAYMENT_STATUS.PAID
              : PAYMENT_STATUS.UNPAID,
          paidAt: paymentStatus === PAYMENT_STATUS.PAID ? new Date() : null,
        },
      });

      return createdOrders;
    });
  }

  private async createVendorTransfers(
    orderGroupId: number,
    createdOrders: {
      orderId: number;
      storeId: number;
      totalAmount: number;
    }[],
  ) {
    if (this.ledger.isPlatformLedgerMode()) {
      return;
    }
    if (!this.stripeService.isConfigured()) {
      return;
    }

    const feePercent = this.stripeService.getPlatformFeePercent();

    for (const order of createdOrders) {
      const store = await this.prisma.store.findUnique({
        where: { id: order.storeId },
      });
      if (!store?.stripeAccountId || !store.payoutsEnabled) {
        continue;
      }

      const vendorShareEur = order.totalAmount * (1 - feePercent / 100);
      const transfer = await this.stripeService.createVendorTransfer({
        amountCents: eurosToStripeCents(vendorShareEur),
        destinationAccountId: store.stripeAccountId,
        orderGroupId,
        orderId: order.orderId,
      });

      await this.prisma.order.update({
        where: { id: order.orderId },
        data: { stripeTransferId: transfer.id },
      });
    }
  }

  private async buildFulfillmentResponse(orderGroupId: number) {
    const group = await this.prisma.orderGroup.findUnique({
      where: { id: orderGroupId },
      include: { orders: { include: { store: true } } },
    });
    if (!group) {
      throw new NotFoundException('Checkout not found');
    }

    return {
      data: {
        orderGroupId: group.id,
        grandTotal: group.grandTotal,
        orders: group.orders.map((o) => ({
          orderId: o.id,
          storeId: o.storeId,
          storeName: o.store.name,
          totalAmount: o.totalAmount,
          status: o.status,
        })),
      },
      msg: 'Order placed',
    };
  }

  private async assertVendorsReadyForPayment(prepared: PreparedCheckout) {
    if (
      prepared.vendorGroups.length > 1 &&
      !this.stripeService.isMultiVendorEnabled()
    ) {
      throw new BadRequestException(
        'Multi-vendor card checkout is not enabled yet — checkout one seller at a time',
      );
    }

    for (const group of prepared.vendorGroups) {
      await this.assertStoreCanAcceptPayments(group);
    }
  }

  private async assertStoreCanAcceptPayments(group: VendorCheckoutGroup) {
    const store = await this.prisma.store.findUnique({
      where: { id: group.storeId },
    });
    if (!store) {
      throw new BadRequestException(`Store "${group.storeName}" not found`);
    }
    if (this.ledger.isPlatformLedgerMode()) {
      if (store.status !== 'active') {
        throw new BadRequestException(
          `Seller "${group.storeName}" is not active`,
        );
      }
      return;
    }
    if (!store.stripeAccountId || !store.payoutsEnabled) {
      throw new BadRequestException(
        `Seller "${group.storeName}" is not ready to accept card payments`,
      );
    }
  }
}
