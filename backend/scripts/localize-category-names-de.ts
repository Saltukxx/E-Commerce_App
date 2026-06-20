/**
 * Updates category display names to German (fixes Turkish / ASCII leftovers in DB).
 *
 * Usage (from backend/):
 *   npx tsx scripts/localize-category-names-de.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GERMAN_NAMES_BY_SLUG: Record<string, string> = {
  panel: 'Panel',
  kaeltemittel: 'Kältemittel',
  'kuehlschraenke-vitrinen': 'Kühlschränke & Vitrinen',
  elektromaterial: 'Elektromaterial',
  'isolierte-rohre': 'Isolierte Rohre',
  kuehlaggregate: 'Kühlanlagen',
  'verdichter-scroll': 'Scroll-Verdichter',
  verfluessigereinheiten: 'Verflüssigereinheiten',
  klimasysteme: 'Klimasysteme',
  verdampfer: 'Verdampfer',
  'kuehlraum-zubehoer': 'Kühlraum-Zubehör',
  kuehlraumtueren: 'Kühlraumtüren',
  verdichter: 'Verdichter',
  kuehloele: 'Kühlöle',
  'isolierung-klebebaender': 'Isolierung & Klebebänder',
  'elektronische-regler': 'Elektronische Regler',
  'pumpen-entwaesserung': 'Pumpen & Entwässerung',
  'filter-trockner': 'Filter & Trockner',
  'ventile-regler': 'Ventile & Regler',
  leitungszubehoer: 'Leitungszubehör',
  ventilatormotoren: 'Ventilatormotoren',
  'sammler-fluessigkeitsbehaelter': 'Sammler (Flüssigkeitsbehälter)',
  'kuehltechnik-zubehoer': 'Kühltechnik-Zubehör',
  'bakir-borular': 'Kupferrohre',
  'klima-yedek-parcalari': 'Klima-Ersatzteile',
  'termostat-ve-termometreler': 'Thermostate & Thermometer',
  'kaynak-telleri': 'Lötdrähte',
};

async function main() {
  let updated = 0;
  for (const [slug, nameDe] of Object.entries(GERMAN_NAMES_BY_SLUG)) {
    const result = await prisma.category.updateMany({
      where: { slug },
      data: { name: nameDe },
    });
    if (result.count > 0) {
      console.log(`  ✓ ${slug} → ${nameDe}`);
      updated += result.count;
    }
  }
  console.log(`\nUpdated ${updated} category row(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
