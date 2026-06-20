import {

  BadRequestException,

  Controller,

  Headers,

  Post,

  RawBodyRequest,

  Req,

} from '@nestjs/common';

import type { Request } from 'express';

import { SkipThrottle } from '@nestjs/throttler';

import { CheckoutService } from './checkout.service';

import { StripeService } from './stripe.service';

import { PAYMENT_STATUS } from './payments.constants';

import { PrismaService } from '../prisma/prisma.service';



@Controller('stripe')

export class StripeWebhookController {

  constructor(

    private stripeService: StripeService,

    private checkoutService: CheckoutService,

    private prisma: PrismaService,

  ) {}



  @SkipThrottle()

  @Post('webhook')

  async handleWebhook(

    @Req() req: RawBodyRequest<Request>,

    @Headers('stripe-signature') signature: string | undefined,

  ) {

    const rawBody = req.rawBody;

    if (!rawBody) {

      throw new BadRequestException('Missing raw body for Stripe webhook');

    }



    const event = this.stripeService.constructWebhookEvent(rawBody, signature);



    switch (event.type) {

      case 'payment_intent.succeeded':

        await this.checkoutService.handlePaymentIntentSucceeded(event.data.object.id);

        break;

      case 'payment_intent.payment_failed': {

        const paymentIntent = event.data.object;

        await this.prisma.orderGroup.updateMany({

          where: { stripePaymentIntentId: paymentIntent.id },

          data: { paymentStatus: PAYMENT_STATUS.FAILED },

        });

        break;

      }

      case 'account.updated': {

        const account = event.data.object;

        const status = {

          stripeOnboardingComplete: account.details_submitted ?? false,

          payoutsEnabled: account.payouts_enabled ?? false,

        };

        await this.prisma.store.updateMany({

          where: { stripeAccountId: account.id },

          data: status,

        });

        break;

      }

      default:

        break;

    }



    return { received: true };

  }

}


