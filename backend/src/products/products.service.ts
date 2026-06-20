import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { mapProduct, mapProductCard } from '../common/mappers';

import { sellableProductWhere } from '../common/marketplace';

export type ProductSort = 'default' | 'newest' | 'bestselling';
export type ProductView = 'full' | 'card';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    categoryId?: number,
    limit?: number,
    skip?: number,
    q?: string,
    storeId?: number,
    storeSlug?: string,
    sort: ProductSort = 'default',
    view: ProductView = 'full',
  ) {
    const trimmed = q?.trim();
    const searchActive = trimmed != null && trimmed.length > 0;

    const filters: Prisma.ProductWhereInput[] = [sellableProductWhere];

    if (categoryId != null) {
      filters.push({ categoryId });
    }
    if (storeId != null) {
      filters.push({ storeId });
    }
    if (storeSlug != null && storeSlug.length > 0) {
      filters.push({ store: { slug: storeSlug, status: 'active' } });
    }
    if (searchActive) {
      filters.push({
        OR: [
          { title: { contains: trimmed, mode: 'insensitive' as const } },
          { description: { contains: trimmed, mode: 'insensitive' as const } },
          { slug: { contains: trimmed, mode: 'insensitive' as const } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput =
      filters.length === 1 ? filters[0] : { AND: filters };

    const skipVal = skip ?? 0;

    const fetchList = async () => {
      if (sort === 'bestselling') {
        return this.findBestselling(where, limit, skipVal);
      }
      if (sort === 'newest') {
        return this.findProductsWithPricedFirst(where, limit, skipVal, {
          createdAt: 'desc',
        });
      }
      return this.findProductsWithPricedFirst(where, limit, skipVal, {
        id: 'asc',
      });
    };

    const mapper = view === 'card' ? mapProductCard : mapProduct;

    if (limit != null) {
      const [list, total] = await Promise.all([
        fetchList(),
        this.prisma.product.count({ where }),
      ]);
      return {
        data: list.map(mapper),
        meta: { total, skip: skipVal, limit },
      };
    }

    const list = await fetchList();
    return list.map(mapper);
  }

  private async findBestselling(
    where: Prisma.ProductWhereInput,
    limit: number | undefined,
    skip: number,
  ) {
    const take = limit ?? 50;
    const include = { category: true, store: true };

    const groups = await this.prisma.orderLine.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: take + skip + 100,
    });

    if (groups.length === 0) {
      return this.findProductsWithPricedFirst(where, limit, skip, {
        createdAt: 'desc',
      });
    }

    const rankedIds = groups.map((g) => g.productId);
    const products = await this.prisma.product.findMany({
      where: { AND: [where, { id: { in: rankedIds } }] },
      include,
    });

    const byId = new Map(products.map((p) => [p.id, p]));
    const ordered = rankedIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => p != null);

    const sliced = ordered.slice(skip, skip + take);

    if (sliced.length >= take || limit == null) {
      return sliced;
    }

    const usedIds = new Set(sliced.map((p) => p.id));
    const fallback = await this.findProductsWithPricedFirst(
      { AND: [where, { id: { notIn: [...usedIds] } }] },
      take - sliced.length,
      0,
      { createdAt: 'desc' },
    );

    return [...sliced, ...fallback];
  }

  private async findProductsWithPricedFirst(
    where: Prisma.ProductWhereInput,
    limit: number | undefined,
    skip: number,
    orderBy: Prisma.ProductOrderByWithRelationInput,
  ) {
    const include = { category: true, store: true };
    const orderByClause: Prisma.ProductOrderByWithRelationInput[] = [
      { price: 'desc' },
      orderBy,
    ];

    return this.prisma.product.findMany({
      where,
      include,
      orderBy: orderByClause,
      ...(limit != null ? { take: limit, skip } : {}),
    });
  }

  private andWhere(
    base: Prisma.ProductWhereInput,
    extra: Prisma.ProductWhereInput,
  ): Prisma.ProductWhereInput {
    return { AND: [base, extra] };
  }

  async findBySlug(slug: string, storeSlug?: string) {
    const trimmed = slug.trim();
    if (!trimmed) {
      return null;
    }

    const where: Prisma.ProductWhereInput = {
      AND: [
        sellableProductWhere,
        { slug: trimmed },
        ...(storeSlug?.trim()
          ? [{ store: { slug: storeSlug.trim(), status: 'active' } }]
          : []),
      ],
    };

    const row = await this.prisma.product.findFirst({
      where,
      include: { category: true, store: true },
    });

    return row ? mapProduct(row) : null;
  }

  async findOffersBySlug(slug: string, excludeStoreSlug?: string) {
    const trimmed = slug.trim();
    if (!trimmed) return [];

    const where: Prisma.ProductWhereInput = {
      AND: [
        sellableProductWhere,
        { slug: trimmed },
        ...(excludeStoreSlug?.trim()
          ? [{ store: { slug: { not: excludeStoreSlug.trim() } } }]
          : []),
      ],
    };

    const rows = await this.prisma.product.findMany({
      where,
      include: { category: true, store: true },
      orderBy: [{ price: 'asc' }, { id: 'asc' }],
    });

    return rows.map(mapProduct);
  }
}
