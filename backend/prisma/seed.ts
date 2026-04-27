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
