import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorGuard } from '../auth/guards/vendor.guard';
import { User } from '../auth/decorators/user.decorator';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import { ProductsAdminService } from './products-admin.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { VendorService } from '../vendor/vendor.service';
import { VendorProductImportService } from '../vendor/vendor-product-import.service';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

class BulkProductDto {
  @IsArray()
  @IsInt({ each: true })
  ids!: number[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;
}

class ImportExecuteDto {
  @IsOptional()
  @IsString()
  mode?: 'upsert' | 'create_only';
}

@Controller('vendor/products')
@UseGuards(JwtAuthGuard, VendorGuard)
export class VendorProductsController {
  constructor(
    private products: ProductsAdminService,
    private vendor: VendorService,
    private importer: VendorProductImportService,
  ) {}

  @Get('import/template')
  getTemplate(@Res() res: Response) {
    const csv = this.importer.getTemplateCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=product-import-template.csv');
    res.send(csv);
  }

  @Post('import/preview')
  @UseInterceptors(FileInterceptor('file'))
  async importPreview(
    @User() user: JwtUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('File required');
    }
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.importer.preview(storeId, file.buffer, file.originalname);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExecute(
    @User() user: JwtUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportExecuteDto,
  ) {
    await this.vendor.ensureStoreWritable(user.userId);
    if (!file?.buffer) {
      throw new BadRequestException('File required');
    }
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.importer.execute(
      storeId,
      file.buffer,
      file.originalname,
      dto.mode ?? 'upsert',
    );
  }

  @Patch('bulk')
  async bulkUpdate(@User() user: JwtUser, @Body() dto: BulkProductDto) {
    await this.vendor.ensureStoreWritable(user.userId);
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.products.bulkUpdate(storeId, dto.ids, {
      status: dto.status,
      categoryId: dto.categoryId,
    });
  }

  @Delete('bulk')
  async bulkRemove(@User() user: JwtUser, @Body() dto: BulkProductDto) {
    await this.vendor.ensureStoreWritable(user.userId);
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.products.bulkRemove(storeId, dto.ids);
  }

  @Get()
  async list(
    @User() user: JwtUser,
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('priceType') priceType?: string,
    @Query('lowStock') lowStock?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.products.listForAdmin({
      storeId,
      q,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      status,
      priceType,
      lowStock: lowStock === '1' || lowStock === 'true',
      skip: skip ? parseInt(skip, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post(':id/duplicate')
  async duplicate(@User() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    await this.vendor.ensureStoreWritable(user.userId);
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.products.duplicate(id, storeId);
  }

  @Get(':id')
  async getOne(@User() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    const storeId = await this.vendor.getStoreId(user.userId);
    const result = await this.products.getById(id);
    if (result.data.store.id !== storeId) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }

  @Post()
  async create(@User() user: JwtUser, @Body() dto: CreateProductDto) {
    await this.vendor.ensureStoreWritable(user.userId);
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.products.create({ ...dto, storeId });
  }

  @Patch(':id')
  async update(
    @User() user: JwtUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    await this.vendor.ensureStoreWritable(user.userId);
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.products.update(id, dto, storeId);
  }

  @Delete(':id')
  async remove(@User() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    await this.vendor.ensureStoreWritable(user.userId);
    const storeId = await this.vendor.getStoreId(user.userId);
    return this.products.remove(id, storeId);
  }
}
