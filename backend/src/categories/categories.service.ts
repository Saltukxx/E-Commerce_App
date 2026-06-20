import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapCategory } from '../common/mappers';
import { PRODUCT_STATUS, slugify } from '../common/marketplace';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { StorefrontRevalidateService } from '../common/storefront-revalidate.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private revalidate: StorefrontRevalidateService,
  ) {}

  async findAll() {
    const rows = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: { where: { status: PRODUCT_STATUS.ACTIVE } },
          },
        },
      },
    });
    return {
      data: rows.map((row) => mapCategory(row, row._count.products)),
      msg: 'Categories',
    };
  }

  async create(dto: CreateCategoryDto) {
    const baseSlug = slugify(dto.slug ?? dto.name) || 'category';
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const row = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        image: dto.image ?? '',
      },
    });
    void this.revalidate.revalidate(['/', '/katalog']);
    return { data: mapCategory(row, 0), msg: 'Category created' };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }
    let slug = existing.slug;
    if (dto.slug != null && dto.slug.trim()) {
      slug = slugify(dto.slug) || slug;
    } else if (dto.name != null && dto.name !== existing.name) {
      slug = slugify(dto.name) || slug;
    }
    if (slug !== existing.slug) {
      const taken = await this.prisma.category.findUnique({ where: { slug } });
      if (taken && taken.id !== id) {
        throw new ConflictException('Slug already in use');
      }
    }
    const row = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        slug,
        image: dto.image ?? existing.image,
      },
      include: {
        _count: {
          select: { products: { where: { status: PRODUCT_STATUS.ACTIVE } } },
        },
      },
    });
    void this.revalidate.revalidate(['/', '/katalog']);
    return {
      data: mapCategory(row, row._count.products),
      msg: 'Category updated',
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }
    if (existing._count.products > 0) {
      throw new ConflictException(
        'Category has products — reassign or delete products first',
      );
    }
    await this.prisma.category.delete({ where: { id } });
    void this.revalidate.revalidate(['/', '/katalog']);
    return { data: { id }, msg: 'Category deleted' };
  }
}
