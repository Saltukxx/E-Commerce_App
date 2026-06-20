import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserIdMatchGuard } from '../auth/guards/user-id-match.guard';
import { StripeService } from './stripe.service';

@Controller('checkout')
export class PaymentsController {
  constructor(
    private checkoutService: CheckoutService,
    private stripeService: StripeService,
  ) {}

  @Get('config')
  config() {
    return {
      data: {
        paymentsEnabled: this.stripeService.isConfigured(),
        publishableKey: this.stripeService.getPublishableKey() ?? null,
        multiVendorEnabled: this.stripeService.isMultiVendorEnabled(),
      },
      msg: 'Checkout config',
    };
  }

  @Post(':userId/session')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  createSession(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.checkoutService.createSession(userId, dto);
  }

  @Get(':userId/:checkoutId/status')
  @UseGuards(JwtAuthGuard, UserIdMatchGuard)
  status(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('checkoutId', ParseIntPipe) checkoutId: number,
  ) {
    return this.checkoutService.getStatus(userId, checkoutId);
  }
}
