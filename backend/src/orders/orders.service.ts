import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';

import { AddressOrderDto } from './dto/address-order.dto';

import { prepareCheckout } from '../common/checkout-cart';

import { CheckoutService } from '../payments/checkout.service';
import { StripeService } from '../payments/stripe.service';

import { PAYMENT_STATUS } from '../payments/payments.constants';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private checkoutService: CheckoutService,
    private stripeService: StripeService,
    private config: ConfigService,
  ) {}

  async placeOrder(userId: number, address: AddressOrderDto) {
    const allowUnpaid =
      this.config.get<string>('ALLOW_UNPAID_ORDERS') !== 'false';
    if (!allowUnpaid && this.stripeService.isConfigured()) {
      throw new ForbiddenException(
        'Unpaid checkout is disabled. Use card payment checkout instead.',
      );
    }

    const prepared = await prepareCheckout(this.prisma, userId);

    const orderGroup = await this.prisma.orderGroup.create({
      data: {
        userId,
        grandTotal: prepared.grandTotal,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        paymentStatus: PAYMENT_STATUS.UNPAID,
      },
    });

    const createdOrders = await this.checkoutService.persistOrders({
      userId,
      orderGroupId: orderGroup.id,
      address,
      prepared,
      paymentStatus: PAYMENT_STATUS.UNPAID,
    });

    return {
      data: {
        orderGroupId: orderGroup.id,
        orders: createdOrders,
        grandTotal: prepared.grandTotal,
      },
      msg: 'Order placed',
    };
  }

  async listOrders(userId: number) {
    const groups = await this.prisma.orderGroup.findMany({
      where: { userId },

      include: {
        orders: {
          include: {
            lines: true,

            store: true,
          },
        },
      },

      orderBy: { id: 'desc' },
    });

    const groupedData = groups.map((g) => ({
      orderGroupId: g.id,

      orderDate: g.createdAt.toISOString().slice(0, 10),

      grandTotal: g.grandTotal,

      orders: g.orders.map((o) => ({
        orderId: o.id,

        storeId: o.storeId,

        storeName: o.store.name,

        status: o.status,

        subtotal: o.subtotal,

        shipping: o.shipping,

        tax: o.tax,

        totalAmount: o.totalAmount,

        items: o.lines.map((line) => ({
          id: line.id,

          orderId: o.id,

          price: line.price,

          productId: line.productId,

          productName: line.productName,

          quantity: line.quantity,

          userId: line.userId,
        })),
      })),
    }));

    const legacyOrders = await this.prisma.order.findMany({
      where: { userId, orderGroupId: null },

      include: { lines: true, store: true },

      orderBy: { id: 'desc' },
    });

    const legacyGrouped = legacyOrders.map((o) => ({
      orderGroupId: null as number | null,

      orderDate: o.orderDate.toISOString().slice(0, 10),

      grandTotal: o.totalAmount,

      orders: [
        {
          orderId: o.id,

          storeId: o.storeId,

          storeName: o.store.name,

          status: o.status,

          subtotal: o.subtotal,

          shipping: o.shipping,

          tax: o.tax,

          totalAmount: o.totalAmount,

          items: o.lines.map((line) => ({
            id: line.id,

            orderId: o.id,

            price: line.price,

            productId: line.productId,

            productName: line.productName,

            quantity: line.quantity,

            userId: line.userId,
          })),
        },
      ],
    }));

    const data = [...groupedData, ...legacyGrouped].sort((a, b) =>
      b.orderDate.localeCompare(a.orderDate),
    );

    return {
      data,

      msg: 'OrderList',
    };
  }
}
