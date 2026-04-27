import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

const MAX_PAGE_SIZE = 500;

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  findAll(
    @Query('categoryId') categoryIdStr?: string,
    @Query('limit') limitStr?: string,
    @Query('skip') skipStr?: string,
  ) {
    let categoryId: number | undefined;
    if (categoryIdStr !== undefined && categoryIdStr !== '') {
      categoryId = parseInt(categoryIdStr, 10);
      if (Number.isNaN(categoryId) || categoryId < 1) {
        throw new BadRequestException('categoryId must be a positive integer');
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

    return this.products.findAll(categoryId, limit, skip);
  }
}
