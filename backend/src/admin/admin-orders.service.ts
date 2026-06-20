import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminOrdersService {
  constructor(private prisma: PrismaService) {}

  async listOrders(params: {
    status?: string;
    storeId?: number;
    skip?: number;
    limit?: number;
  }) {
    const skip = params.skip ?? 0;
    const limit = Math.min(params.limit ?? 20, 100);

    const orderWhere: Prisma.OrderWhereInput = {};
    if (params.status) {
      orderWhere.status = params.status;
    }
    if (params.storeId != null) {
      orderWhere.storeId = params.storeId;
    }

    const where: Prisma.OrderGroupWhereInput =
      Object.keys(orderWhere).length > 0
        ? { orders: { some: orderWhere } }
        : {};

    const [groups, total] = await Promise.all([
      this.prisma.orderGroup.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          orders: {
            include: {
              store: { select: { id: true, name: true, slug: true } },
              lines: true,
            },
          },
        },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.orderGroup.count({ where }),
    ]);

    return {
      data: groups.map((g) => this.mapOrderGroup(g)),
      meta: { total, skip, limit },
      msg: 'Admin orders',
    };
  }

  async getOrderGroup(id: number) {
    const group = await this.prisma.orderGroup.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        orders: {
          include: {
            store: { select: { id: true, name: true, slug: true } },
            lines: true,
          },
        },
      },
    });
    if (!group) {
      throw new NotFoundException('Order group not found');
    }
    return { data: this.mapOrderGroup(group), msg: 'Order detail' };
  }

  private mapOrderGroup(
    g: Prisma.OrderGroupGetPayload<{
      include: {
        user: { select: { id: true; email: true; name: true } };
        orders: {
          include: {
            store: { select: { id: true; name: true; slug: true } };
            lines: true;
          };
        };
      };
    }>,
  ) {
    return {
      orderGroupId: g.id,
      userId: g.userId,
      user: g.user,
      grandTotal: g.grandTotal,
      paymentStatus: g.paymentStatus,
      addressLine: g.addressLine,
      city: g.city,
      state: g.state,
      postalCode: g.postalCode,
      country: g.country,
      createdAt: g.createdAt.toISOString(),
      orders: g.orders.map((o) => ({
        orderId: o.id,
        storeId: o.storeId,
        store: o.store,
        status: o.status,
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        totalAmount: o.totalAmount,
        items: o.lines.map((line) => ({
          id: line.id,
          productId: line.productId,
          productName: line.productName,
          price: line.price,
          quantity: line.quantity,
        })),
      })),
    };
  }
}
