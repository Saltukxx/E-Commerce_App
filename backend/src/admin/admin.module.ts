import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminPayoutController } from './admin-payout.controller';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [AuthModule, VendorModule],
  controllers: [AdminDashboardController, AdminOrdersController, AdminPayoutController],
  providers: [
    AdminDashboardService,
    AdminOrdersService,
    AdminGuard,
  ],
})
export class AdminModule {}
