import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ProductsAdminService } from './products-admin.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminProductsController {
  constructor(private products: ProductsAdminService) {}

  @Get()
  list(
    @Query('storeId') storeId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('q') q?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    return this.products.listForAdmin({
      storeId: storeId ? parseInt(storeId, 10) : undefined,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      q,
      skip: skip ? parseInt(skip, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.products.getById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.products.remove(id);
  }
}
