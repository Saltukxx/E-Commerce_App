/**
 * Seeds homepage showcase stores (official DRC vendor + partner placeholders).
 *
 * Usage (from backend/):
 *   npx tsx scripts/seed-showcase-stores.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SHOWCASE_STORES = [
  {
    slug: 'drc-kaltetechnik',
    name: 'DRC-Kältetechnik',
    description: 'Offizieller DRC-Kältetechnik Großhandel auf dem DurmusBaba Marktplatz',
    contactEmail: 'info@drc-kaltetechnik.de',
    isFeatured: true,
  },
  {
    slug: 'kaeltekontor-hamburg',
    name: 'Kältekontor Hamburg',
    description: 'Kälte- und Klimatechnik für Installateure in Norddeutschland',
    contactEmail: 'kontakt@kaeltekontor-hamburg.de',
    isFeatured: true,
  },
  {
    slug: 'nordklima-technik',
    name: 'NordKlima Technik',
    description: 'Großhandel für Verdichter, Kältemittel und Kältekomponenten',
    contactEmail: 'info@nordklima-technik.de',
    isFeatured: true,
  },
] as const;

async function main() {
  for (const store of SHOWCASE_STORES) {
    const row = await prisma.store.upsert({
      where: { slug: store.slug },
      update: {
        name: store.name,
        description: store.description,
        contactEmail: store.contactEmail,
        status: 'active',
        isFeatured: store.isFeatured,
      },
      create: {
        slug: store.slug,
        name: store.name,
        description: store.description,
        contactEmail: store.contactEmail,
        status: 'active',
        isFeatured: store.isFeatured,
      },
    });
    console.log(`  ✓ ${row.slug} (id=${row.id})`);
  }

  const legacy = await prisma.store.findUnique({ where: { slug: 'durmusbaba' } });
  if (legacy) {
    await prisma.store.update({
      where: { id: legacy.id },
      data: { ownerUserId: null, isFeatured: false },
    });
    await prisma.store.delete({ where: { id: legacy.id } });
    console.log('  ✗ removed legacy durmusbaba store');
  }

  console.log('\nShowcase stores ready.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
