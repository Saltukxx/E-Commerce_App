import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/strategies/jwt.strategy';
import { CreatePriceInquiryDto } from './dto/create-price-inquiry.dto';
import { PriceInquiriesService } from './price-inquiries.service';

type AuthedRequest = Request & { user: JwtUser };

@Controller('price-inquiries')
export class PriceInquiriesController {
  constructor(private inquiries: PriceInquiriesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  listMine(@Req() req: AuthedRequest) {
    return this.inquiries.listForUser(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Req() req: AuthedRequest, @Body() dto: CreatePriceInquiryDto) {
    return this.inquiries.create(req.user.userId, dto.productId);
  }
}
