import {
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
import { StoreApplicationsService } from '../store-applications/store-applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { User } from '../auth/decorators/user.decorator';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import {
  RejectStoreApplicationDto,
  UpdateStoreDto,
  UpdateStoreStatusDto,
} from '../store-applications/dto/admin-store.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminStoresController {
  constructor(private service: StoreApplicationsService) {}

  @Get('store-applications')
  listApplications(@Query('status') status?: string) {
    return this.service.listPending(status);
  }

  @Post('store-applications/:id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @User() user: JwtUser,
  ) {
    return this.service.approve(id, user.userId);
  }

  @Post('store-applications/:id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @User() user: JwtUser,
    @Body() dto: RejectStoreApplicationDto,
  ) {
    return this.service.reject(id, user.userId, dto.rejectionReason);
  }

  @Get('stores')
  listStores() {
    return this.service.listAllStores();
  }

  @Get('stores/:id')
  getStore(@Param('id', ParseIntPipe) id: number) {
    return this.service.getStoreDetail(id);
  }

  @Patch('stores/:id')
  updateStore(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.service.updateStore(id, dto);
  }

  @Patch('stores/:id/status')
  updateStoreStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStoreStatusDto,
  ) {
    return this.service.updateStoreStatus(id, dto.status);
  }
}
