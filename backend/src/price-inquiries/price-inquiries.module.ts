import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminPriceInquiriesController } from './admin-price-inquiries.controller';
import { PriceInquiriesController } from './price-inquiries.controller';
import { PriceInquiriesService } from './price-inquiries.service';

@Module({
  imports: [PrismaModule],
  controllers: [PriceInquiriesController, AdminPriceInquiriesController],
  providers: [PriceInquiriesService, AdminGuard],
  exports: [PriceInquiriesService],
})
export class PriceInquiriesModule {}
