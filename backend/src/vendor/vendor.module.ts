import { Module, forwardRef } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { VendorGuard } from '../auth/guards/vendor.guard';
import { AuthModule } from '../auth/auth.module';
import { PriceInquiriesModule } from '../price-inquiries/price-inquiries.module';
import { VendorDashboardService } from './vendor-dashboard.service';
import { VendorFinanceService } from './vendor-finance.service';
import { VendorLedgerService } from './vendor-ledger.service';
import { VendorProductImportService } from './vendor-product-import.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [AuthModule, PriceInquiriesModule, forwardRef(() => ProductsModule)],
  controllers: [VendorController],
  providers: [
    VendorService,
    VendorGuard,
    VendorDashboardService,
    VendorFinanceService,
    VendorLedgerService,
    VendorProductImportService,
  ],
  exports: [
    VendorService,
    VendorFinanceService,
    VendorLedgerService,
    VendorProductImportService,
  ],
})
export class VendorModule {}
