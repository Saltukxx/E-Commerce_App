import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapProduct } from '../common/mappers';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: number, limit?: number, skip?: number) {
    const list = await this.prisma.product.findMany({
      where: categoryId != null ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { id: 'asc' },
      ...(limit != null ? { take: limit, skip: skip ?? 0 } : {}),
    });
    return list.map(mapProduct);
  }
}
