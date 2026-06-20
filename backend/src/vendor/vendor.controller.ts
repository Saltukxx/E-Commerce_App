import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorGuard } from '../auth/guards/vendor.guard';
import { User } from '../auth/decorators/user.decorator';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import { VendorService } from './vendor.service';
import { VendorDashboardService } from './vendor-dashboard.service';
import { VendorFinanceService } from './vendor-finance.service';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { Trim } from '../common/transforms';
import { UpdateVendorStoreDto } from './dto/update-vendor-store.dto';
import { VendorUpdatePriceInquiryDto } from './dto/vendor-update-price-inquiry.dto';

class UpdateOrderStatusDto {
  @Trim()
  @IsString()
  status!: string;
}

class CreatePayoutDto {
  @IsInt()
  @Min(1000)
  amountCents!: number;

  @Trim()
  @IsString()
  bankIban!: string;

  @Trim()
  @IsString()
  bankHolder!: string;
}

@Controller('vendor')
@UseGuards(JwtAuthGuard, VendorGuard)
export class VendorController {
  constructor(
    private vendorService: VendorService,
    private dashboard: VendorDashboardService,
    private finance: VendorFinanceService,
  ) {}

  @Get('store')
  getStore(@User() user: JwtUser) {
    return this.vendorService.getStore(user.userId);
  }

  @Patch('store')
  updateStore(@User() user: JwtUser, @Body() dto: UpdateVendorStoreDto) {
    return this.vendorService.updateStore(user.userId, dto);
  }

  @Get('categories')
  async listCategories(@User() user: JwtUser) {
    const storeId = await this.vendorService.getStoreId(user.userId);
    return this.vendorService.listCategoriesForStore(storeId);
  }

  @Get('dashboard/stats')
  async dashboardStats(
    @User() user: JwtUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const storeId = await this.vendorService.getStoreId(user.userId);
    return this.dashboard.getStats(
      storeId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('finance/summary')
  async financeSummary(@User() user: JwtUser) {
    const storeId = await this.vendorService.getStoreId(user.userId);
    return this.finance.getSummary(storeId);
  }

  @Get('finance/ledger')
  async financeLedger(
    @User() user: JwtUser,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    const storeId = await this.vendorService.getStoreId(user.userId);
    return this.finance.listLedger(
      storeId,
      skip ? parseInt(skip, 10) : 0,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('finance/payout-requests')
  async payoutRequests(@User() user: JwtUser) {
    const storeId = await this.vendorService.getStoreId(user.userId);
    return this.finance.listPayoutRequests(storeId);
  }

  @Post('finance/payout-requests')
  async createPayout(@User() user: JwtUser, @Body() dto: CreatePayoutDto) {
    await this.vendorService.ensureStoreWritable(user.userId);
    const storeId = await this.vendorService.getStoreId(user.userId);
    return this.finance.createPayoutRequest(
      storeId,
      dto.amountCents,
      dto.bankIban,
      dto.bankHolder,
    );
  }

  @Get('orders')
  listOrders(
    @User() user: JwtUser,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    return this.vendorService.listOrders(
      user.userId,
      status,
      skip ? parseInt(skip, 10) : 0,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('orders/:id')
  getOrder(@User() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    return this.vendorService.getOrder(user.userId, id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @User() user: JwtUser,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.vendorService.updateOrderStatus(
      user.userId,
      orderId,
      dto.status,
    );
  }

  @Get('price-inquiries')
  listPriceInquiries(@User() user: JwtUser) {
    return this.vendorService.listPriceInquiries(user.userId);
  }

  @Patch('price-inquiries/:id')
  updatePriceInquiry(
    @User() user: JwtUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VendorUpdatePriceInquiryDto,
  ) {
    return this.vendorService.updatePriceInquiry(
      user.userId,
      id,
      dto.status,
      dto.quoteCents,
      dto.adminNote,
    );
  }
}
