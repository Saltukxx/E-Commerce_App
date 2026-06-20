-- Price inquiry workflow status
ALTER TABLE "PriceInquiry" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "PriceInquiry" ADD COLUMN IF NOT EXISTS "quoteCents" INTEGER;
ALTER TABLE "PriceInquiry" ADD COLUMN IF NOT EXISTS "adminNote" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "PriceInquiry_status_idx" ON "PriceInquiry"("status");

-- Optional stock tracking (null = not tracked)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stockQty" INTEGER;
