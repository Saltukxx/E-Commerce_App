import { BadRequestException, Controller, Get, Header, NotFoundException, Param, Query } from '@nestjs/common';

import { ProductsService, ProductView } from './products.service';

const MAX_PAGE_SIZE = 500;

const MIN_SEARCH_LEN = 2;

const MAX_SEARCH_LEN = 100;

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  findAll(
    @Query('categoryId') categoryIdStr?: string,
    @Query('storeId') storeIdStr?: string,
    @Query('storeSlug') storeSlug?: string,
    @Query('limit') limitStr?: string,
    @Query('skip') skipStr?: string,
    @Query('q') qRaw?: string,
    @Query('sort') sortRaw?: string,
    @Query('view') viewRaw?: string,
  ) {
    let categoryId: number | undefined;
    if (categoryIdStr !== undefined && categoryIdStr !== '') {
      categoryId = parseInt(categoryIdStr, 10);
      if (Number.isNaN(categoryId) || categoryId < 1) {
        throw new BadRequestException('categoryId must be a positive integer');
      }
    }

    let storeId: number | undefined;
    if (storeIdStr !== undefined && storeIdStr !== '') {
      storeId = parseInt(storeIdStr, 10);
      if (Number.isNaN(storeId) || storeId < 1) {
        throw new BadRequestException('storeId must be a positive integer');
      }
    }

    let limit: number | undefined;
    if (limitStr !== undefined && limitStr !== '') {
      limit = parseInt(limitStr, 10);
      if (Number.isNaN(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
        throw new BadRequestException(
          `limit must be between 1 and ${MAX_PAGE_SIZE}`,
        );
      }
    }

    let skip = 0;
    if (skipStr !== undefined && skipStr !== '') {
      skip = parseInt(skipStr, 10);
      if (Number.isNaN(skip) || skip < 0) {
        throw new BadRequestException('skip must be a non-negative integer');
      }
    }

    if (limit == null && skipStr !== undefined && skipStr !== '' && skip > 0) {
      throw new BadRequestException('skip requires limit');
    }

    const q = qRaw?.trim() ?? '';
    if (q.length > 0) {
      if (q.length < MIN_SEARCH_LEN || q.length > MAX_SEARCH_LEN) {
        throw new BadRequestException(
          `q must be between ${MIN_SEARCH_LEN} and ${MAX_SEARCH_LEN} characters`,
        );
      }
      if (limit == null) {
        throw new BadRequestException('limit is required when searching');
      }
    }

    const sort =
      sortRaw === 'newest' || sortRaw === 'bestselling' ? sortRaw : 'default';
    const view: ProductView = viewRaw === 'card' ? 'card' : 'full';

    return this.products.findAll(
      categoryId,
      limit,
      skip,
      q.length > 0 ? q : undefined,
      storeId,
      storeSlug?.trim() || undefined,
      sort,
      view,
    );
  }

  @Get('slug/:slug/offers')
  findOffers(
    @Param('slug') slug: string,
    @Query('excludeStoreSlug') excludeStoreSlug?: string,
  ) {
    return this.products
      .findOffersBySlug(slug, excludeStoreSlug)
      .then((offers) => ({ data: offers, msg: 'Offers' }));
  }

  @Get('slug/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('storeSlug') storeSlug?: string,
  ) {
    return this.products.findBySlug(slug, storeSlug).then((product) => {
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return { data: product, msg: 'Product' };
    });
  }
}
