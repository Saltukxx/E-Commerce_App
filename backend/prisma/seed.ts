import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('changeme', 10);
  await prisma.user.upsert({
    where: { email: 'john@mail.com' },
    update: {},
    create: {
      email: 'john@mail.com',
      passwordHash,
      name: 'Jhon',
      role: 'customer',
      avatar: 'https://i.imgur.com/LDOO4Qs.jpg',
    },
  });

  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@durmusbaba.com' },
    update: { role: 'admin' },
    create: {
      email: 'admin@durmusbaba.com',
      passwordHash: adminHash,
      name: 'Platform Admin',
      role: 'admin',
      avatar: '',
    },
  });

  const vendorHash = await bcrypt.hash('vendor123', 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@drc-kaltetechnik.de' },
    update: { role: 'vendor', passwordHash: vendorHash },
    create: {
      email: 'vendor@drc-kaltetechnik.de',
      passwordHash: vendorHash,
      name: 'DRC-Kältetechnik',
      role: 'vendor',
    },
  });

  await prisma.store.upsert({
    where: { slug: 'drc-kaltetechnik' },
    update: {
      name: 'DRC-Kältetechnik',
      status: 'active',
      isFeatured: true,
      ownerUserId: vendorUser.id,
      logo: '/uploads/stores/drc-kaltetechnik-logo.png',
      banner: '/uploads/stores/drc-kaltetechnik-banner.png',
    },
    create: {
      name: 'DRC-Kältetechnik',
      slug: 'drc-kaltetechnik',
      description: 'Offizieller DRC-Kältetechnik Großhandel auf dem DurmusBaba Marktplatz',
      status: 'active',
      isFeatured: true,
      contactEmail: 'info@drc-kaltetechnik.de',
      ownerUserId: vendorUser.id,
      logo: '/uploads/stores/drc-kaltetechnik-logo.png',
      banner: '/uploads/stores/drc-kaltetechnik-banner.png',
    },
  });

  const legacyStore = await prisma.store.findUnique({ where: { slug: 'durmusbaba' } });
  const drcStore = await prisma.store.findUnique({ where: { slug: 'drc-kaltetechnik' } });
  if (legacyStore && drcStore && legacyStore.id !== drcStore.id) {
    await prisma.product.updateMany({
      where: { storeId: legacyStore.id },
      data: { storeId: drcStore.id },
    });
    await prisma.store.update({
      where: { id: legacyStore.id },
      data: { ownerUserId: null, isFeatured: false },
    });
    await prisma.store.delete({ where: { id: legacyStore.id } });
  } else if (legacyStore && !drcStore) {
    await prisma.store.update({
      where: { id: legacyStore.id },
      data: { ownerUserId: null, isFeatured: false },
    });
    await prisma.store.delete({ where: { id: legacyStore.id } });
  }

  const legacyProductSlugs = [
    'klima-split-12',
    'lueftung-stern',
    'wp-8kw',
    'heizkoerper-flach',
    'filter-set-3',
  ];
  const legacyCategorySlugs = ['lueftung', 'heizung', 'zubehoer'];

  await prisma.product.deleteMany({
    where: { slug: { in: legacyProductSlugs } },
  });
  await prisma.category.deleteMany({
    where: { slug: { in: legacyCategorySlugs } },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    return prisma.$disconnect();
  });
