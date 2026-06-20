import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentsAdminService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private config: ConfigService,
  ) {}

  async createStripeOnboardingLink(storeId: number) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    let accountId = store.stripeAccountId;
    if (!accountId) {
      const account = await this.stripeService.createExpressAccount({
        email: store.contactEmail || `store-${store.id}@durmusbaba.local`,
        businessName: store.name,
      });
      accountId = account.id;
      await this.prisma.store.update({
        where: { id: storeId },
        data: { stripeAccountId: accountId },
      });
    }

    const refreshUrl =
      this.config.get<string>('STRIPE_ONBOARD_REFRESH_URL') ??
      'https://durmusbaba.com/admin/stripe/refresh';
    const returnUrl =
      this.config.get<string>('STRIPE_ONBOARD_RETURN_URL') ??
      'https://durmusbaba.com/admin/stripe/return';

    const link = await this.stripeService.createAccountOnboardingLink(
      accountId,
      refreshUrl,
      returnUrl,
    );

    return {
      data: {
        storeId,
        stripeAccountId: accountId,
        onboardingUrl: link.url,
      },
      msg: 'Stripe onboarding link created',
    };
  }

  async syncStripeAccountStatus(storeId: number) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store?.stripeAccountId) {
      throw new BadRequestException('Store has no Stripe account');
    }

    const status = await this.stripeService.syncAccountStatus(store.stripeAccountId);
    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: status,
    });

    return {
      data: {
        storeId: updated.id,
        stripeAccountId: updated.stripeAccountId,
        stripeOnboardingComplete: updated.stripeOnboardingComplete,
        payoutsEnabled: updated.payoutsEnabled,
      },
      msg: 'Stripe account synced',
    };
  }
}
