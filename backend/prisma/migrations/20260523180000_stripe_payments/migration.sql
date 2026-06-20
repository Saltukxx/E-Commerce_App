-- Stripe Connect + checkout payment fields
ALTER TABLE "Store" ADD COLUMN "stripeAccountId" TEXT;
ALTER TABLE "Store" ADD COLUMN "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Store" ADD COLUMN "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "OrderGroup" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE "OrderGroup" ADD COLUMN "stripePaymentIntentId" TEXT;
ALTER TABLE "OrderGroup" ADD COLUMN "paidAt" TIMESTAMP(3);

ALTER TABLE "Order" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE "Order" ADD COLUMN "stripeTransferId" TEXT;

CREATE UNIQUE INDEX "OrderGroup_stripePaymentIntentId_key" ON "OrderGroup"("stripePaymentIntentId");
