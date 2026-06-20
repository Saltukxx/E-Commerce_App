import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string | undefined;
  private readonly publishableKey: string | undefined;
  private readonly platformFeePercent: number;
  private readonly multiVendorEnabled: boolean;

  constructor(private config: ConfigService) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    this.publishableKey = this.config.get<string>('STRIPE_PUBLISHABLE_KEY');
    this.platformFeePercent = Number(
      this.config.get<string>('PLATFORM_FEE_PERCENT') ?? '0',
    );
    this.multiVendorEnabled =
      this.config.get<string>('STRIPE_MULTI_VENDOR') === 'true';
    this.stripe = secret ? new Stripe(secret) : null;
  }

  isConfigured(): boolean {
    return this.stripe != null;
  }

  getPublishableKey(): string | undefined {
    return this.publishableKey;
  }

  getPlatformFeePercent(): number {
    return this.platformFeePercent;
  }

  isMultiVendorEnabled(): boolean {
    return this.multiVendorEnabled;
  }

  requireClient(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Card payments are not configured');
    }
    return this.stripe;
  }

  constructWebhookEvent(rawBody: Buffer, signature: string | string[] | undefined) {
    const stripe = this.requireClient();
    if (!this.webhookSecret) {
      throw new ServiceUnavailableException('Stripe webhook is not configured');
    }
    if (!signature || Array.isArray(signature)) {
      throw new BadRequestException('Missing Stripe signature');
    }
    return stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }

  async createPaymentIntent(params: {
    amountCents: number;
    orderGroupId: number;
    userId: number;
  }) {
    const stripe = this.requireClient();
    return stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: 'eur',
      metadata: {
        orderGroupId: String(params.orderGroupId),
        userId: String(params.userId),
      },
      automatic_payment_methods: { enabled: true },
    });
  }

  async createExpressAccount(params: {
    email: string;
    businessName: string;
  }) {
    const stripe = this.requireClient();
    return stripe.accounts.create({
      type: 'express',
      email: params.email,
      business_profile: { name: params.businessName },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  async createAccountOnboardingLink(accountId: string, refreshUrl: string, returnUrl: string) {
    const stripe = this.requireClient();
    return stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  async syncAccountStatus(accountId: string) {
    const stripe = this.requireClient();
    const account = await stripe.accounts.retrieve(accountId);
    return {
      stripeOnboardingComplete: account.details_submitted ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
    };
  }

  async createVendorTransfer(params: {
    amountCents: number;
    destinationAccountId: string;
    orderGroupId: number;
    orderId: number;
  }) {
    const stripe = this.requireClient();
    return stripe.transfers.create({
      amount: params.amountCents,
      currency: 'eur',
      destination: params.destinationAccountId,
      transfer_group: `order_group_${params.orderGroupId}`,
      metadata: {
        orderGroupId: String(params.orderGroupId),
        orderId: String(params.orderId),
      },
    });
  }
}
