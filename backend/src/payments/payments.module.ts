import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserIdMatchGuard } from '../auth/guards/user-id-match.guard';
import { CheckoutService } from './checkout.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe-webhook.controller';
import { PaymentsAdminService } from './payments-admin.service';
import { PaymentsAdminController } from './payments-admin.controller';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => VendorModule)],
  controllers: [
    PaymentsController,
    StripeWebhookController,
    PaymentsAdminController,
  ],
  providers: [
    StripeService,
    CheckoutService,
    PaymentsAdminService,
    AdminGuard,
    UserIdMatchGuard,
  ],
  exports: [CheckoutService, StripeService, PaymentsAdminService],
})
export class PaymentsModule {}
