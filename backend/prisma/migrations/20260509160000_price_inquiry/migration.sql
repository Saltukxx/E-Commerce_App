-- CreateTable
CREATE TABLE "PriceInquiry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceInquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PriceInquiry_userId_idx" ON "PriceInquiry"("userId");
CREATE INDEX "PriceInquiry_productId_idx" ON "PriceInquiry"("productId");
CREATE INDEX "PriceInquiry_createdAt_idx" ON "PriceInquiry"("createdAt");

ALTER TABLE "PriceInquiry" ADD CONSTRAINT "PriceInquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceInquiry" ADD CONSTRAINT "PriceInquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
