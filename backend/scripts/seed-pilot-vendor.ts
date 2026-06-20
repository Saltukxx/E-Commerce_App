/**
 * Seeds a pilot vendor store with sample products for mixed-vendor checkout testing.
 *
 * Usage:
 *   cd backend
 *   npx ts-node --transpile-only scripts/seed-pilot-vendor.ts
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const durmusbaba = await prisma.store.findUnique({ where: { slug: 'drc-kaltetechnik' } });
  if (!dumrusbabaMissing(durmusbaba)) {
    throw new Error('Run migrations and seed DRC-Kältetechnik store first.');
  }

  const vendorEmail = 'vendor@coolair.de';
  const passwordHash = await bcrypt.hash('vendor123', 10);

  const vendorUser = await prisma.user.upsert({
    where: { email: vendorEmail },
    update: { role: 'vendor' },
    create: {
      email: vendorEmail,
      passwordHash,
      name: 'CoolAir Vendor',
      role: 'vendor',
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: 'coolair-gmbh' },
    update: {
      status: 'active',
      ownerUserId: vendorUser.id,
    },
    create: {
      name: 'CoolAir GmbH',
      slug: 'coolair-gmbh',
      description: 'Pilot HVAC vendor for marketplace testing',
      status: 'active',
      contactEmail: vendorEmail,
      phone: '+49 40 000000',
      ownerUserId: vendorUser.id,
    },
  });

  const category =
    (await prisma.category.findFirst()) ??
    (await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        image: 'https://placehold.co/400x300?text=Test',
      },
    }));

  await prisma.product.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'pilot-fan-motor' } },
    update: {
      title: 'Pilot Fan Motor 120W',
      price: 4500,
      status: 'active',
    },
    create: {
      title: 'Pilot Fan Motor 120W',
      slug: 'pilot-fan-motor',
      description: 'Pilot vendor product for marketplace E2E',
      price: 4500,
      images: [],
      categoryId: category.id,
      storeId: store.id,
      status: 'active',
    },
  });

  console.log('Pilot vendor ready:');
  console.log(`  Store: ${store.slug} (id=${store.id})`);
  console.log(`  Login: ${vendorEmail} / vendor123`);
  await prisma.$disconnect();
}

function dumrusbabaMissing(
  store: { id: number } | null,
): store is { id: number } {
  return store != null;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
