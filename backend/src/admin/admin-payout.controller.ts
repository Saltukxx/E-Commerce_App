import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { User } from '../auth/decorators/user.decorator';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import { VendorFinanceService } from '../vendor/vendor-finance.service';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Trim } from '../common/transforms';

class UpdatePayoutDto {
  @IsIn(['approved', 'rejected', 'paid'])
  status!: 'approved' | 'rejected' | 'paid';

  @IsOptional()
  @Trim()
  @IsString()
  adminNote?: string;
}

@Controller('admin/payout-requests')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPayoutController {
  constructor(private finance: VendorFinanceService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.finance.listAllPayoutRequests(status);
  }

  @Patch(':id')
  update(
    @User() user: JwtUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayoutDto,
  ) {
    return this.finance.updatePayoutRequest(
      id,
      dto.status,
      dto.adminNote ?? '',
      user.userId,
    );
  }
}
