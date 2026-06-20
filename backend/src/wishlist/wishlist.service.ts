import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapProduct } from '../common/mappers';
import { sellableProductWhere } from '../common/marketplace';
import { Category, Product, Store } from '@prisma/client';

type ProductWithRelations = Product & { category: Category; store: Store };

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: number) {
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        userId,
        product: sellableProductWhere,
      },
      include: { product: { include: { category: true, store: true } } },
      orderBy: { id: 'asc' },
    });
    return {
      data: items.map((i) => mapProduct(i.product as ProductWithRelations)),
      msg: 'Wishlist',
    };
  }

  async add(userId: number, productId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, ...sellableProductWhere },
      include: { category: true, store: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found or not available');
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
