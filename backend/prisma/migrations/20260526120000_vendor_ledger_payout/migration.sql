-- AlterTable
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "payoutBankIban" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "payoutBankHolder" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE IF NOT EXISTS "PayoutRequest" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "bankIban" TEXT NOT NULL DEFAULT '',
    "bankHolder" TEXT NOT NULL DEFAULT '',
    "adminNote" TEXT NOT NULL DEFAULT '',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processedByAdminId" INTEGER,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VendorLedgerEntry" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "orderId" INTEGER,
    "payoutRequestId" INTEGER,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutRequest_storeId_idx" ON "PayoutRequest"("storeId");
CREATE INDEX IF NOT EXISTS "PayoutRequest_status_idx" ON "PayoutRequest"("status");
CREATE INDEX IF NOT EXISTS "VendorLedgerEntry_storeId_idx" ON "VendorLedgerEntry"("storeId");
CREATE INDEX IF NOT EXISTS "VendorLedgerEntry_createdAt_idx" ON "VendorLedgerEntry"("createdAt");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "VendorLedgerEntry" ADD CONSTRAINT "VendorLedgerEntry_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "VendorLedgerEntry" ADD CONSTRAINT "VendorLedgerEntry_payoutRequestId_fkey" FOREIGN KEY ("payoutRequestId") REFERENCES "PayoutRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
