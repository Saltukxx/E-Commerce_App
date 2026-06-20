-- Marketplace: Store, StoreApplication, OrderGroup + store scoping

CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "ownerUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreApplication" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "applicantUserId" INTEGER,
    "reviewedByAdminId" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "createdStoreId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderGroup" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");
CREATE UNIQUE INDEX "Store_ownerUserId_key" ON "Store"("ownerUserId");
CREATE INDEX "Store_status_idx" ON "Store"("status");
CREATE INDEX "Store_isFeatured_idx" ON "Store"("isFeatured");
CREATE INDEX "StoreApplication_status_idx" ON "StoreApplication"("status");
CREATE INDEX "StoreApplication_contactEmail_idx" ON "StoreApplication"("contactEmail");
CREATE INDEX "OrderGroup_userId_idx" ON "OrderGroup"("userId");

-- Seed Durmusbaba flagship store
INSERT INTO "Store" ("name", "slug", "description", "status", "isFeatured", "updatedAt")
VALUES ('Durmusbaba Store', 'durmusbaba', 'Official Durmusbaba HVAC catalog', 'active', true, CURRENT_TIMESTAMP);

-- Product: add storeId + status, migrate slug uniqueness
ALTER TABLE "Product" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Product" ADD COLUMN "storeId" INTEGER;

UPDATE "Product" SET "storeId" = (SELECT "id" FROM "Store" WHERE "slug" = 'durmusbaba');

ALTER TABLE "Product" ALTER COLUMN "storeId" SET NOT NULL;

DROP INDEX IF EXISTS "Product_slug_key";
CREATE UNIQUE INDEX "Product_storeId_slug_key" ON "Product"("storeId", "slug");
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");
CREATE INDEX "Product_status_idx" ON "Product"("status");

ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CartLine
ALTER TABLE "CartLine" ADD COLUMN "storeId" INTEGER;
ALTER TABLE "CartLine" ADD COLUMN "storeName" TEXT NOT NULL DEFAULT '';

UPDATE "CartLine" cl
SET "storeId" = p."storeId",
    "storeName" = s."name"
FROM "Product" p
JOIN "Store" s ON s."id" = p."storeId"
WHERE cl."productId" = p."id";

UPDATE "CartLine" SET "storeId" = (SELECT "id" FROM "Store" WHERE "slug" = 'durmusbaba')
WHERE "storeId" IS NULL;

ALTER TABLE "CartLine" ALTER COLUMN "storeId" SET NOT NULL;

ALTER TABLE "CartLine" ADD CONSTRAINT "CartLine_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order
ALTER TABLE "Order" ADD COLUMN "storeId" INTEGER;
ALTER TABLE "Order" ADD COLUMN "orderGroupId" INTEGER;
ALTER TABLE "Order" ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "tax" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Order" SET "storeId" = (SELECT "id" FROM "Store" WHERE "slug" = 'durmusbaba');

ALTER TABLE "Order" ALTER COLUMN "storeId" SET NOT NULL;

CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");
CREATE INDEX "Order_orderGroupId_idx" ON "Order"("orderGroupId");

ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderGroupId_fkey"
    FOREIGN KEY ("orderGroupId") REFERENCES "OrderGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- OrderLine: price Float -> Int (cents), add storeId
ALTER TABLE "OrderLine" ADD COLUMN "storeId" INTEGER;

UPDATE "OrderLine" ol
SET "storeId" = o."storeId"
FROM "Order" o
WHERE ol."orderId" = o."id";

UPDATE "OrderLine" SET "storeId" = (SELECT "id" FROM "Store" WHERE "slug" = 'durmusbaba')
WHERE "storeId" IS NULL;

ALTER TABLE "OrderLine" ALTER COLUMN "storeId" SET NOT NULL;

ALTER TABLE "OrderLine" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price")::INTEGER;

CREATE INDEX "OrderLine_storeId_idx" ON "OrderLine"("storeId");

ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PriceInquiry
ALTER TABLE "PriceInquiry" ADD COLUMN "storeId" INTEGER;

UPDATE "PriceInquiry" pi
SET "storeId" = p."storeId"
FROM "Product" p
WHERE pi."productId" = p."id";

UPDATE "PriceInquiry" SET "storeId" = (SELECT "id" FROM "Store" WHERE "slug" = 'durmusbaba')
WHERE "storeId" IS NULL;

ALTER TABLE "PriceInquiry" ALTER COLUMN "storeId" SET NOT NULL;
CREATE INDEX "PriceInquiry_storeId_idx" ON "PriceInquiry"("storeId");

ALTER TABLE "PriceInquiry" ADD CONSTRAINT "PriceInquiry_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- StoreApplication FKs
ALTER TABLE "StoreApplication" ADD CONSTRAINT "StoreApplication_applicantUserId_fkey"
    FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreApplication" ADD CONSTRAINT "StoreApplication_reviewedByAdminId_fkey"
    FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreApplication" ADD CONSTRAINT "StoreApplication_createdStoreId_fkey"
    FOREIGN KEY ("createdStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- OrderGroup FK
ALTER TABLE "OrderGroup" ADD CONSTRAINT "OrderGroup_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Store owner FK
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
