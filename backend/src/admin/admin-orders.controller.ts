import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminOrdersService } from './admin-orders.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminOrdersController {
  constructor(private orders: AdminOrdersService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('storeId') storeId?: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orders.listOrders({
      status: status?.trim() || undefined,
      storeId: storeId ? parseInt(storeId, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.orders.getOrderGroup(id);
  }
}
