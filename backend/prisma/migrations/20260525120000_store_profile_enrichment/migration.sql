-- Store profile enrichment + featured products + inquiry response tracking
ALTER TABLE "Store" ADD COLUMN "banner" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Store" ADD COLUMN "deliveryArea" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Store" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Store" ADD COLUMN "website" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Store" ADD COLUMN "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "PriceInquiry" ADD COLUMN "quotedAt" TIMESTAMP(3);

CREATE TABLE "StoreFeaturedProduct" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoreFeaturedProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoreFeaturedProduct_storeId_productId_key" ON "StoreFeaturedProduct"("storeId", "productId");
CREATE INDEX "StoreFeaturedProduct_storeId_sortOrder_idx" ON "StoreFeaturedProduct"("storeId", "sortOrder");

ALTER TABLE "StoreFeaturedProduct" ADD CONSTRAINT "StoreFeaturedProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreFeaturedProduct" ADD CONSTRAINT "StoreFeaturedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill quotedAt for existing quoted inquiries
UPDATE "PriceInquiry" SET "quotedAt" = "createdAt" WHERE "status" = 'quoted' AND "quotedAt" IS NULL;
