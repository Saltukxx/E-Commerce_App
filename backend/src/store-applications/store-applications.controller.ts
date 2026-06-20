import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { StoreApplicationsService } from './store-applications.service';
import { CreateStoreApplicationDto } from './dto/create-store-application.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { JwtUser } from '../auth/strategies/jwt.strategy';

@Controller('store-applications')
export class StoreApplicationsController {
  constructor(private service: StoreApplicationsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(
    @Body() dto: CreateStoreApplicationDto,
    @Req() req: { user?: JwtUser },
  ) {
    return this.service.create(dto, req.user?.userId);
  }
}
