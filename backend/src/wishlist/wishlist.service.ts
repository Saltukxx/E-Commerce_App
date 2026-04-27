import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapProduct } from '../common/mappers';
import { Category, Product } from '@prisma/client';

type ProductWithCategory = Product & { category: Category };

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: number) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
      orderBy: { id: 'asc' },
    });
    return {
      data: items.map((i) => mapProduct(i.product as ProductWithCategory)),
      msg: 'Wishlist',
    };
  }

  async add(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {},
      create: { userId, productId },
    });
    return this.getWishlist(userId);
  }

  async remove(userId: number, productId: number) {
    await this.prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
    return this.getWishlist(userId);
  }
}
