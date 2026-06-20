import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaymentsAdminService } from './payments-admin.service';

@Controller('admin/stores')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PaymentsAdminController {
  constructor(private adminService: PaymentsAdminService) {}

  @Post(':id/stripe-onboard')
  stripeOnboard(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.createStripeOnboardingLink(id);
  }

  @Post(':id/stripe-sync')
  stripeSync(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.syncStripeAccountStatus(id);
  }
}
