import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapCartItem } from '../common/mappers';
import { AddCartDto } from './dto/add-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private cartResponse(data: ReturnType<typeof mapCartItem>[], msg: string) {
    return { data, msg };
  }

  async getCart(userId: number) {
    const lines = await this.prisma.cartLine.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });
    return this.cartResponse(
      lines.map((l) => mapCartItem(l)),
      'Cart',
    );
  }

  async add(userId: number, dto: AddCartDto) {
    if (dto.userId !== userId) {
      throw new BadRequestException('userId mismatch');
    }
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const imageUrl = product.images[0] ?? null;
    await this.prisma.cartLine.upsert({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
      update: {
        quantity: { increment: dto.quantity },
        productName: product.title,
        price: product.price,
        imageUrl,
      },
      create: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
        productName: product.title,
        price: product.price,
        imageUrl,
        name: '',
      },
    });
    return this.getCart(userId);
  }

  async updateQuantity(
    userId: number,
    cartItemId: number,
    dto: AddCartDto,
  ) {
    if (dto.userId !== userId) {
      throw new BadRequestException('userId mismatch');
    }
    const line = await this.prisma.cartLine.findFirst({
      where: { id: cartItemId, userId },
      include: { product: true },
    });
    if (!line) {
      throw new NotFoundException('Cart line not found');
    }
    const imageUrl = line.product.images[0] ?? null;
    await this.prisma.cartLine.update({
      where: { id: line.id },
      data: {
        quantity: dto.quantity,
        productName: line.product.title,
        price: line.product.price,
        imageUrl,
      },
    });
    return this.getCart(userId);
  }

  async deleteLine(userId: number, cartItemId: number) {
    const line = await this.prisma.cartLine.findFirst({
      where: { id: cartItemId, userId },
    });
    if (!line) {
      throw new NotFoundException('Cart line not found');
    }
    await this.prisma.cartLine.delete({ where: { id: line.id } });
    return this.getCart(userId);
  }

  async summary(userId: number) {
    const lines = await this.prisma.cartLine.findMany({ where: { userId } });
    const items = lines.map((l) => mapCartItem(l));
    const subtotal = lines.reduce(
      (sum, l) => sum + l.price * l.quantity,
      0,
    );
    const shipping = lines.length === 0 ? 0 : 5.0;
    const tax = Math.round(subtotal * 0.19 * 100) / 100;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;
    return {
      data: {
        discount,
        items,
        shipping,
        subtotal,
        tax,
        total,
      },
      msg: 'Checkout Summary',
    };
  }
}
