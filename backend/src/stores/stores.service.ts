import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapCategory, mapProduct, mapStore } from '../common/mappers';
import { computeStoreResponseStats } from '../common/store-trust';
import { sellableProductWhere, PRODUCT_STATUS } from '../common/marketplace';
import { ProductsService } from '../products/products.service';

const MAX_FEATURED = 8;

@Injectable()
export class StoresService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  private async enrichStoreTrust(storeId: number) {
    return computeStoreResponseStats(this.prisma, storeId);
  }

  async listActiveSummary() {
    const stores = await this.prisma.store.findMany({
      where: { status: 'active' },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isFeatured: true,
      },
    });
    return { data: stores, msg: 'Store summaries' };
  }

  async listActive() {
    const stores = await this.prisma.store.findMany({
      where: { status: 'active' },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            products: { where: { status: PRODUCT_STATUS.ACTIVE } },
          },
        },
      },
    });

    const data = await Promise.all(
      stores.map(async (store) => {
        const trust = await this.enrichStoreTrust(store.id);
        return {
          ...mapStore(store, trust),
          productCount: store._count.products,
        };
      }),
    );

    return { data, msg: 'Stores' };
  }

  async findBySlug(slug: string) {
    const store = await this.prisma.store.findFirst({
      where: { slug, status: 'active' },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const [productCount, categories, featuredProducts, trust] = await Promise.all([
      this.prisma.product.count({
        where: { storeId: store.id, status: PRODUCT_STATUS.ACTIVE },
      }),
      this.getStoreCategories(store.id),
      this.getFeaturedProducts(store.id),
      this.enrichStoreTrust(store.id),
    ]);

    return {
      data: {
        ...mapStore(store, trust),
        productCount,
        categories,
        featuredProducts,
      },
      msg: 'Store',
    };
  }

  private async getStoreCategories(storeId: number) {
    const groups = await this.prisma.product.groupBy({
      by: ['categoryId'],
      where: { storeId, status: PRODUCT_STATUS.ACTIVE },
      _count: { _all: true },
      orderBy: { _count: { categoryId: 'desc' } },
    });

    if (groups.length === 0) return [];

    const categoryIds = groups.map((g) => g.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const byId = new Map(categories.map((c) => [c.id, c]));

    return groups
      .map((g) => {
        const category = byId.get(g.categoryId);
        if (!category) return null;
        return mapCategory(category, g._count._all);
      })
      .filter((c): c is NonNullable<typeof c> => c != null);
  }

  private async getFeaturedProducts(storeId: number) {
    const rows = await this.prisma.storeFeaturedProduct.findMany({
      where: { storeId },
      orderBy: { sortOrder: 'asc' },
      take: MAX_FEATURED,
      include: {
        product: { include: { category: true, store: true } },
      },
    });

    return rows
      .map((row) => row.product)
      .filter((p) => p.status === 'active')
      .map(mapProduct);
  }

  async listProducts(
    slug: string,
    categoryId?: number,
    limit?: number,
    skip?: number,
    q?: string,
  ) {
    const store = await this.prisma.store.findFirst({
      where: { slug, status: 'active' },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    const products = await this.productsService.findAll(
      categoryId,
      limit,
      skip,
      q,
      store.id,
    );
    return { data: products, msg: 'Products' };
  }
}
