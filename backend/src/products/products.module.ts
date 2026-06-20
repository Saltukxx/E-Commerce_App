import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VendorModule } from '../vendor/vendor.module';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { VendorProductsController } from './vendor-products.controller';
import { ProductsService } from './products.service';
import { ProductsAdminService } from './products-admin.service';

@Module({
  imports: [AuthModule, forwardRef(() => VendorModule)],
  controllers: [ProductsController, AdminProductsController, VendorProductsController],
  providers: [ProductsService, ProductsAdminService, AdminGuard],
  exports: [ProductsService, ProductsAdminService],
})
export class ProductsModule {}
