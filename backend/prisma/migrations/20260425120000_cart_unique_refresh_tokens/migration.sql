-- Consolidate duplicate cart lines before enforcing one row per product per user.
WITH grouped AS (
    SELECT
        "userId",
        "productId",
        MIN("id") AS keep_id,
        SUM("quantity") AS total_quantity
    FROM "CartLine"
    GROUP BY "userId", "productId"
    HAVING COUNT(*) > 1
)
UPDATE "CartLine" c
SET "quantity" = grouped.total_quantity
FROM grouped
WHERE c."id" = grouped.keep_id;

WITH grouped AS (
    SELECT
        "userId",
        "productId",
        MIN("id") AS keep_id
    FROM "CartLine"
    GROUP BY "userId", "productId"
    HAVING COUNT(*) > 1
)
DELETE FROM "CartLine" c
USING grouped
WHERE c."userId" = grouped."userId"
  AND c."productId" = grouped."productId"
  AND c."id" <> grouped.keep_id;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartLine_userId_productId_key" ON "CartLine"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
