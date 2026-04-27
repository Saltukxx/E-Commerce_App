import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressOrderDto } from './dto/address-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async placeOrder(userId: number, address: AddressOrderDto) {
    const order = await this.prisma.$transaction(async (tx) => {
      const lines = await tx.cartLine.findMany({
        where: { userId },
        orderBy: { id: 'asc' },
      });
      if (lines.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      const lineIds = lines.map((line) => line.id);
      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
      const shipping = 5.0;
      const tax = Math.round(subtotal * 0.19 * 100) / 100;
      const totalAmount = subtotal + shipping + tax;
      const o = await tx.order.create({
        data: {
          userId,
          status: 'Pending',
          totalAmount,
          addressLine: address.addressLine,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
      });
      for (const l of lines) {
        await tx.orderLine.create({
          data: {
            orderId: o.id,
            productId: l.productId,
            productName: l.productName,
            price: l.price,
            quantity: l.quantity,
            userId,
          },
        });
      }
      const deleted = await tx.cartLine.deleteMany({
        where: { id: { in: lineIds }, userId },
      });
      if (deleted.count !== lines.length) {
        throw new BadRequestException('Cart changed during checkout');
      }
      return o;
    });
    return {
      data: { id: order.id },
      msg: 'Order placed',
    };
  }

  async listOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { lines: true },
      orderBy: { id: 'desc' },
    });
    const data = orders.map((o) => ({
      id: o.id,
      orderDate: o.orderDate.toISOString().slice(0, 10),
      status: o.status,
      totalAmount: o.totalAmount,
      userId: o.userId,
      items: o.lines.map((line) => ({
        id: line.id,
        orderId: o.id,
        price: line.price,
        productId: line.productId,
        productName: line.productName,
        quantity: line.quantity,
        userId: line.userId,
      })),
    }));
    return {
      data,
      msg: 'OrderList',
    };
  }
}
