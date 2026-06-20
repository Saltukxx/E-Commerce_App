import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CategoriesController } from './categories.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoriesService, AdminGuard],
  exports: [CategoriesService],
})
export class CategoriesModule {}
