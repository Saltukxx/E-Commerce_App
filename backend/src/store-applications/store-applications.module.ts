import { Module } from '@nestjs/common';
import { StoreApplicationsController } from './store-applications.controller';
import { AdminStoresController } from './admin-stores.controller';
import { StoreApplicationsService } from './store-applications.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StoreApplicationsController, AdminStoresController],
  providers: [StoreApplicationsService, AdminGuard],
  exports: [StoreApplicationsService],
})
export class StoreApplicationsModule {}
