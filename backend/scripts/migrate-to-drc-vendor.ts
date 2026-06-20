/**
 * Makes DRC-Kältetechnik the sole official vendor store and removes the durmusbaba store.
 * Durmusbaba remains the marketplace brand only (not a Store row).
 *
 * Usage:
 *   cd backend
 *   npx ts-node --transpile-only scripts/migrate-to-drc-vendor.ts
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export const OFFICIAL_STORE_SLUG = 'drc-kaltetechnik';
export const OFFICIAL_STORE_NAME = 'DRC-Kältetechnik';
export const LEGACY_STORE_SLUG = 'durmusbaba';
export const VENDOR_EMAIL = 'vendor@drc-kaltetechnik.de';
export const VENDOR_PASSWORD = 'vendor123';
export const DRC_STORE_LOGO = '/uploads/stores/drc-kaltetechnik-logo.png';
export const DRC_STORE_BANNER = '/uploads/stores/drc-kaltetechnik-banner.png';

async function main() {
  const prisma = new PrismaClient();
  const legacy = await prisma.store.findUnique({ where: { slug: LEGACY_STORE_SLUG } });

  const passwordHash = await bcrypt.hash(VENDOR_PASSWORD, 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: VENDOR_EMAIL },
    update: { role: 'vendor', passwordHash },
    create: {
      email: VENDOR_EMAIL,
      passwordHash,
      name: 'DRC-Kältetechnik',
      role: 'vendor',
    },
  });

  let drcStore = await prisma.store.findUnique({ where: { slug: OFFICIAL_STORE_SLUG } });
  if (drcStore?.ownerUserId != null && drcStore.ownerUserId !== vendorUser.id) {
    await prisma.store.update({
      where: { id: drcStore.id },
      data: { ownerUserId: null },
    });
  }

  drcStore = await prisma.store.upsert({
    where: { slug: OFFICIAL_STORE_SLUG },
    update: {
      name: OFFICIAL_STORE_NAME,
      description: 'Offizieller DRC-Kältetechnik Großhandel auf dem DurmusBaba Marktplatz',
      status: 'active',
      isFeatured: true,
      contactEmail: 'info@drc-kaltetechnik.de',
      ownerUserId: vendorUser.id,
      logo: DRC_STORE_LOGO,
      banner: DRC_STORE_BANNER,
    },
    create: {
      name: OFFICIAL_STORE_NAME,
      slug: OFFICIAL_STORE_SLUG,
      description: 'Offizieller DRC-Kältetechnik Großhandel auf dem DurmusBaba Marktplatz',
      status: 'active',
      isFeatured: true,
      contactEmail: 'info@drc-kaltetechnik.de',
      ownerUserId: vendorUser.id,
      logo: DRC_STORE_LOGO,
      banner: DRC_STORE_BANNER,
    },
  });

  if (legacy && legacy.id !== drcStore.id) {
    const legacyId = legacy.id;
    const drcId = drcStore.id;

    const moved = await prisma.$transaction(async (tx) => {
      const productCount = await tx.product.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.cartLine.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.order.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.orderLine.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.priceInquiry.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.vendorLedgerEntry.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.payoutRequest.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.storeFeaturedProduct.updateMany({
        where: { storeId: legacyId },
        data: { storeId: drcId },
      });
      await tx.store.update({
        where: { id: legacyId },
        data: { ownerUserId: null, isFeatured: false },
      });
      await tx.store.delete({ where: { id: legacyId } });
      return productCount.count;
    });

    console.log(`Moved ${moved} products from ${LEGACY_STORE_SLUG} to ${OFFICIAL_STORE_SLUG}`);
  } else if (!legacy) {
    console.log(`No legacy ${LEGACY_STORE_SLUG} store found — skipped product move.`);
  }

  const totalProducts = await prisma.product.count({ where: { storeId: drcStore.id } });
  console.log('\nOfficial vendor ready:');
  console.log(`  Store: ${drcStore.slug} (id=${drcStore.id})`);
  console.log(`  Products: ${totalProducts}`);
  console.log(`  Vendor login: ${VENDOR_EMAIL} / ${VENDOR_PASSWORD}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
