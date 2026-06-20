import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { mapProduct } from '../common/mappers';
import { PRODUCT_STATUS, slugify } from '../common/marketplace';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StorefrontRevalidateService } from '../common/storefront-revalidate.service';

@Injectable()
export class ProductsAdminService {
  constructor(
    private prisma: PrismaService,
    private revalidate: StorefrontRevalidateService,
  ) {}

  async listForAdmin(params: {
    storeId?: number;
    categoryId?: number;
    status?: string;
    priceType?: string;
    lowStock?: boolean;
    q?: string;
    skip?: number;
    limit?: number;
  }) {
    const skip = params.skip ?? 0;
    const limit = Math.min(params.limit ?? 20, 100);
    const filters: Prisma.ProductWhereInput[] = [];

    if (params.storeId != null) {
      filters.push({ storeId: params.storeId });
    }
    if (params.categoryId != null) {
      filters.push({ categoryId: params.categoryId });
    }
    if (params.status?.trim()) {
      filters.push({ status: params.status.trim() });
    }
    if (params.priceType === 'quote') {
      filters.push({ price: 0 });
    } else if (params.priceType === 'fixed') {
      filters.push({ price: { gt: 0 } });
    }
    if (params.lowStock) {
      filters.push({ stockQty: { lte: 5 } });
    }
    const q = params.q?.trim();
    if (q) {
      filters.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, store: true },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: rows.map(mapProduct),
      meta: { total, skip, limit },
      msg: 'Products',
    };
  }

  async getById(id: number) {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, store: true },
    });
    if (!row) {
      throw new NotFoundException('Product not found');
    }
    return { data: mapProduct(row), msg: 'Product' };
  }

  async create(dto: CreateProductDto) {
    if (dto.storeId == null) {
      throw new BadRequestException('storeId is required');
    }
    await this.assertStoreAndCategory(dto.storeId, dto.categoryId);
    const slug = await this.resolveSlug(dto.storeId, dto.slug ?? dto.title);

    const row = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        price: dto.price,
        stockQty: dto.stockQty ?? null,
        categoryId: dto.categoryId,
        storeId: dto.storeId,
        images: dto.images ?? [],
        status: dto.status ?? PRODUCT_STATUS.ACTIVE,
      },
      include: { category: true, store: true },
    });
    this.bumpStorefront();
    return { data: mapProduct(row), msg: 'Product created' };
  }

  private bumpStorefront() {
    void this.revalidate.revalidate(['/', '/katalog']);
  }

  async update(id: number, dto: UpdateProductDto, storeId?: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    if (storeId != null && existing.storeId !== storeId) {
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId != null) {
      await this.assertCategory(dto.categoryId);
    }

    let slug = dto.slug;
    if (slug != null) {
      slug = await this.resolveSlug(existing.storeId, slug, id);
    }

    const row = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.title != null ? { title: dto.title } : {}),
        ...(slug != null ? { slug } : {}),
        ...(dto.description != null ? { description: dto.description } : {}),
        ...(dto.price != null ? { price: dto.price } : {}),
        ...(dto.stockQty !== undefined ? { stockQty: dto.stockQty } : {}),
        ...(dto.categoryId != null ? { categoryId: dto.categoryId } : {}),
        ...(dto.images != null ? { images: dto.images } : {}),
        ...(dto.status != null ? { status: dto.status } : {}),
      },
      include: { category: true, store: true },
    });
    this.bumpStorefront();
    return { data: mapProduct(row), msg: 'Product updated' };
  }

  async remove(id: number, storeId?: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    if (storeId != null && existing.storeId !== storeId) {
      throw new NotFoundException('Product not found');
    }
    await this.prisma.product.delete({ where: { id } });
    this.bumpStorefront();
    return { data: { id }, msg: 'Product deleted' };
  }

  async duplicate(id: number, storeId: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || existing.storeId !== storeId) {
      throw new NotFoundException('Product not found');
    }
    const slug = await this.resolveSlug(storeId, `${existing.slug}-copy`);
    const row = await this.prisma.product.create({
      data: {
        title: `${existing.title} (Kopie)`,
        slug,
        description: existing.description,
        price: existing.price,
        stockQty: existing.stockQty,
        categoryId: existing.categoryId,
        storeId: existing.storeId,
        images: [...existing.images],
        status: PRODUCT_STATUS.DRAFT,
      },
      include: { category: true, store: true },
    });
    this.bumpStorefront();
    return { data: mapProduct(row), msg: 'Product duplicated' };
  }

  async bulkUpdate(
    storeId: number,
    ids: number[],
    data: { status?: string; categoryId?: number },
  ) {
    if (ids.length === 0) {
      throw new BadRequestException('No product ids');
    }
    if (data.categoryId != null) {
      await this.assertCategory(data.categoryId);
    }
    const result = await this.prisma.product.updateMany({
      where: { storeId, id: { in: ids } },
      data: {
        ...(data.status != null ? { status: data.status } : {}),
        ...(data.categoryId != null ? { categoryId: data.categoryId } : {}),
      },
    });
    this.bumpStorefront();
    return { data: { updated: result.count }, msg: 'Bulk updated' };
  }

  async bulkRemove(storeId: number, ids: number[]) {
    if (ids.length === 0) {
      throw new BadRequestException('No product ids');
    }
    const result = await this.prisma.product.deleteMany({
      where: { storeId, id: { in: ids } },
    });
    this.bumpStorefront();
    return { data: { deleted: result.count }, msg: 'Bulk deleted' };
  }

  async appendImage(id: number, imagePath: string, storeId?: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    if (storeId != null && existing.storeId !== storeId) {
      throw new NotFoundException('Product not found');
    }
    const images = [...existing.images, imagePath];
    const row = await this.prisma.product.update({
      where: { id },
      data: { images },
      include: { category: true, store: true },
    });
    this.bumpStorefront();
    return { data: mapProduct(row), msg: 'Image added' };
  }

  private async assertStoreAndCategory(storeId: number, categoryId: number) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new BadRequestException('Store not found');
    }
    await this.assertCategory(categoryId);
  }

  private async assertCategory(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
  }

  private async resolveSlug(
    storeId: number,
    input: string,
    excludeId?: number,
  ): Promise<string> {
    const base = slugify(input) || 'product';
    let slug = base;
    let suffix = 1;
    while (true) {
      const existing = await this.prisma.product.findFirst({
        where: {
          storeId,
          slug,
          ...(excludeId != null ? { NOT: { id: excludeId } } : {}),
        },
      });
      if (!existing) return slug;
      slug = `${base}-${suffix++}`;
      if (suffix > 100) {
        throw new ConflictException('Could not generate unique slug');
      }
    }
  }
}
