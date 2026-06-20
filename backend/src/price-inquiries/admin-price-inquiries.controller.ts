import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PriceInquiriesService } from './price-inquiries.service';
import { UpdatePriceInquiryDto } from './dto/update-price-inquiry.dto';

@Controller('admin/price-inquiries')
export class AdminPriceInquiriesController {
  constructor(private inquiries: PriceInquiriesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  list() {
    return this.inquiries.listForAdmin();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePriceInquiryDto,
  ) {
    return this.inquiries.updateStatus(id, dto.status, dto.quoteCents, dto.adminNote);
  }
}
