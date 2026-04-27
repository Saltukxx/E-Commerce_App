import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const MANUAL_IMAGE_OVERRIDES: Record<string, string> = {
  // The scraper did not return an image for L30HL; use the matching Cubigel L-series compressor image.
  '3070371':
    'https://www.amifrigo.com/media/catalog/product/cache/1/image/650x/040ec09b1e35df139433887a97daa66f/l/-/l-compressor_1_1_2_1.png',
};

interface ScrapedImageResult {
  repaItCode: string;
  imageUrl: string | null;
  status: 'found' | 'not_found' | 'error';
}

async function applyScrapedProductImages() {
  const resultsPath = path.resolve(__dirname, '../scripts/image-results.json');
  if (!fs.existsSync(resultsPath)) {
    console.log('Product image map not found; seeded placeholder images only.');
    return;
  }

  const results: ScrapedImageResult[] = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const found = results.filter(
    (result) => (result.status === 'found' && result.imageUrl) || MANUAL_IMAGE_OVERRIDES[result.repaItCode],
  );

  let updated = 0;
  for (const result of found) {
    const imageUrl = MANUAL_IMAGE_OVERRIDES[result.repaItCode] ?? result.imageUrl;
    const products = await prisma.product.findMany({
      where: {
        description: { contains: `REPA IT: ${result.repaItCode}` },
      },
      select: { id: true, images: true },
    });

    if (!imageUrl) continue;

    for (const product of products) {
      if (product.images.length === 1 && product.images[0] === imageUrl) continue;

      await prisma.product.update({
        where: { id: product.id },
        data: { images: [imageUrl] },
      });
      updated++;
    }
  }

  console.log(`Product images applied: ${updated}`);
}

async function main() {
  console.log('Seeding refrigeration catalogue...');

  // ── Categories ──────────────────────────────────────────────
  await prisma.category.upsert({
    where: { slug: 'cubigel-compressors' },
    update: { name: `Cubigel compressors`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Cubigel compressors`, slug: 'cubigel-compressors', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'embraco-compressors' },
    update: { name: `Embraco compressors`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Embraco compressors`, slug: 'embraco-compressors', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'secop-compressors' },
    update: { name: `Secop compressors`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Secop compressors`, slug: 'secop-compressors', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'tecumseh-compressors' },
    update: { name: `Tecumseh compressors`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Tecumseh compressors`, slug: 'tecumseh-compressors', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'compressors-accessories' },
    update: { name: `Compressors accessories`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Compressors accessories`, slug: 'compressors-accessories', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'scroll-compressors' },
    update: { name: `Scroll compressors`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Scroll compressors`, slug: 'scroll-compressors', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'danfoss-maneurop-compressors' },
    update: { name: `Danfoss Maneurop compressors`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Danfoss Maneurop compressors`, slug: 'danfoss-maneurop-compressors', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'semihermetic-compressors' },
    update: { name: `Semihermetic compressors`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Semihermetic compressors`, slug: 'semihermetic-compressors', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'refrigeration-units' },
    update: { name: `Refrigeration units`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Refrigeration units`, slug: 'refrigeration-units', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'evaporators-luve-shs' },
    update: { name: `Evaporators Luve SHS`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Evaporators Luve SHS`, slug: 'evaporators-luve-shs', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'evaporators-for-counter' },
    update: { name: `Evaporators for counter`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Evaporators for counter`, slug: 'evaporators-for-counter', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'heating-elements' },
    update: { name: `Heating elements`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Heating elements`, slug: 'heating-elements', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'drip-trays' },
    update: { name: `Drip trays`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Drip trays`, slug: 'drip-trays', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'condensers-counterflow-water-cooled-condensers' },
    update: { name: `Condensers COUNTERFLOW WATER COOLED CONDENSERS`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Condensers COUNTERFLOW WATER COOLED CONDENSERS`, slug: 'condensers-counterflow-water-cooled-condensers', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'condensers-air-cooled-condensers' },
    update: { name: `Condensers AIR COOLED CONDENSERS`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Condensers AIR COOLED CONDENSERS`, slug: 'condensers-air-cooled-condensers', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'axial-motor-fans' },
    update: { name: `Axial motor fans`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Axial motor fans`, slug: 'axial-motor-fans', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'fan-motors' },
    update: { name: `Fan motors`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Fan motors`, slug: 'fan-motors', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'telethermometers-telethermometers-11x62-mm' },
    update: { name: `Telethermometers TELETHERMOMETERS 11x62 mm`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Telethermometers TELETHERMOMETERS 11x62 mm`, slug: 'telethermometers-telethermometers-11x62-mm', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'telethermometers-telethermometers-60-mm' },
    update: { name: `Telethermometers TELETHERMOMETERS ø 60 mm`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Telethermometers TELETHERMOMETERS ø 60 mm`, slug: 'telethermometers-telethermometers-60-mm', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'thermostats-thermostats' },
    update: { name: `Thermostats THERMOSTATS`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Thermostats THERMOSTATS`, slug: 'thermostats-thermostats', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' },
    update: { name: `Thermostats THERMOSTATS RANCO SERIES K VARIFIX`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Thermostats THERMOSTATS RANCO SERIES K VARIFIX`, slug: 'thermostats-thermostats-ranco-series-k-varifix', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'thermostats-thermostats-danfoss-service-kit' },
    update: { name: `Thermostats THERMOSTATS DANFOSS SERVICE KIT`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Thermostats THERMOSTATS DANFOSS SERVICE KIT`, slug: 'thermostats-thermostats-danfoss-service-kit', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'electronic-controllers' },
    update: { name: `Electronic controllers`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Electronic controllers`, slug: 'electronic-controllers', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'probes-humidity-probes' },
    update: { name: `Probes HUMIDITY PROBES`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Probes HUMIDITY PROBES`, slug: 'probes-humidity-probes', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'probes-temperature-probes' },
    update: { name: `Probes TEMPERATURE PROBES`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Probes TEMPERATURE PROBES`, slug: 'probes-temperature-probes', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'potentiometers-speed-regulators-for-fans-dixell' },
    update: { name: `Potentiometers SPEED REGULATORS FOR FANS DIXELL`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Potentiometers SPEED REGULATORS FOR FANS DIXELL`, slug: 'potentiometers-speed-regulators-for-fans-dixell', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'electrical-boards' },
    update: { name: `Electrical boards`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Electrical boards`, slug: 'electrical-boards', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'pressure-switches' },
    update: { name: `Pressure switches`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Pressure switches`, slug: 'pressure-switches', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'solenoid-valves' },
    update: { name: `Solenoid valves`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Solenoid valves`, slug: 'solenoid-valves', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'filters-copper-filters' },
    update: { name: `Filters COPPER FILTERS`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Filters COPPER FILTERS`, slug: 'filters-copper-filters', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'filters-anti-acid-dehydrator-filters-castel' },
    update: { name: `Filters ANTI-ACID DEHYDRATOR FILTERS CASTEL`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Filters ANTI-ACID DEHYDRATOR FILTERS CASTEL`, slug: 'filters-anti-acid-dehydrator-filters-castel', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'filters' },
    update: { name: `Filters`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Filters`, slug: 'filters', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'filters-moisture-indicators-castel' },
    update: { name: `Filters MOISTURE INDICATORS CASTEL`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Filters MOISTURE INDICATORS CASTEL`, slug: 'filters-moisture-indicators-castel', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'filters-humidity-indicators-sanhua' },
    update: { name: `Filters HUMIDITY INDICATORS SANHUA`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Filters HUMIDITY INDICATORS SANHUA`, slug: 'filters-humidity-indicators-sanhua', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'valves-retention-valves-castel' },
    update: { name: `Valves RETENTION VALVES CASTEL`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Valves RETENTION VALVES CASTEL`, slug: 'valves-retention-valves-castel', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'valves' },
    update: { name: `Valves`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Valves`, slug: 'valves', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'valves-nozzles-danfoss' },
    update: { name: `Valves NOZZLES DANFOSS`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Valves NOZZLES DANFOSS`, slug: 'valves-nozzles-danfoss', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'valves-thermostatic-valves-honeywell-amv' },
    update: { name: `Valves THERMOSTATIC VALVES HONEYWELL AMV`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Valves THERMOSTATIC VALVES HONEYWELL AMV`, slug: 'valves-thermostatic-valves-honeywell-amv', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'valves-thermostatic-valves-sanhua' },
    update: { name: `Valves THERMOSTATIC VALVES SANHUA`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Valves THERMOSTATIC VALVES SANHUA`, slug: 'valves-thermostatic-valves-sanhua', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'valves-weld-adapters-sanhua' },
    update: { name: `Valves WELD ADAPTERS SANHUA`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Valves WELD ADAPTERS SANHUA`, slug: 'valves-weld-adapters-sanhua', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'valves-electronic-valves-sanhua' },
    update: { name: `Valves ELECTRONIC VALVES SANHUA`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Valves ELECTRONIC VALVES SANHUA`, slug: 'valves-electronic-valves-sanhua', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'liquid-receivers' },
    update: { name: `Liquid receivers`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Liquid receivers`, slug: 'liquid-receivers', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'gas-taps-and-accessories' },
    update: { name: `Gas taps and accessories`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Gas taps and accessories`, slug: 'gas-taps-and-accessories', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'capillaries-capillaries' },
    update: { name: `Capillaries CAPILLARIES`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Capillaries CAPILLARIES`, slug: 'capillaries-capillaries', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'copper-pipes' },
    update: { name: `Copper pipes`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Copper pipes`, slug: 'copper-pipes', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'vibration-isolators-for-copper-pipes' },
    update: { name: `Vibration isolators for copper pipes`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `Vibration isolators for copper pipes`, slug: 'vibration-isolators-for-copper-pipes', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'insulators-insulation-pipe-2-m-armacell' },
    update: { name: `Insulators INSULATION PIPE 2 m ARMACELL`, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
    create: { name: `Insulators INSULATION PIPE 2 m ARMACELL`, slug: 'insulators-insulation-pipe-2-m-armacell', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'mechanical-microswitches' },
    update: { name: `Mechanical microswitches`, image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
    create: { name: `Mechanical microswitches`, slug: 'mechanical-microswitches', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'compensation-valves' },
    update: { name: `Compensation valves`, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
    create: { name: `Compensation valves`, slug: 'compensation-valves', image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'refrigeration-tools' },
    update: { name: `Refrigeration tools`, image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
    create: { name: `Refrigeration tools`, slug: 'refrigeration-tools', image: 'https://images.unsplash.com/photo-1581092335397-9fa73b34e961?w=600' },
  });
  await prisma.category.upsert({
    where: { slug: 'hvac-hvac' },
    update: { name: `HVAC HVAC`, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
    create: { name: `HVAC HVAC`, slug: 'hvac-hvac', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600' },
  });

  console.log(`Categories seeded: ${51}`);

  // ── Products ────────────────────────────────────────────────
  // Prices default to 0 (update per-product when pricing is available)
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070371-l30hl' },
        update: { title: `L30HL`, description: `REPA IT: 3070371 | REPA DE: LF3070371`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `L30HL`, slug: '3070371-l30hl', description: `REPA IT: 3070371 | REPA DE: LF3070371`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070196-gl60aa' },
        update: { title: `GL60AA`, description: `REPA IT: 3070196 | REPA DE: 605197`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GL60AA`, slug: '3070196-gl60aa', description: `REPA IT: 3070196 | REPA DE: 605197`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070201-gl90aa' },
        update: { title: `GL90AA`, description: `REPA IT: 3070201 | REPA DE: 605185`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GL90AA`, slug: '3070201-gl90aa', description: `REPA IT: 3070201 | REPA DE: 605185`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070368-b35gl' },
        update: { title: `B35GL`, description: `REPA IT: 3070368 | REPA DE: LF3070368`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `B35GL`, slug: '3070368-b35gl', description: `REPA IT: 3070368 | REPA DE: LF3070368`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070011-gu45tg' },
        update: { title: `GU45TG`, description: `REPA IT: 3070011 | REPA DE: 605012`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GU45TG`, slug: '3070011-gu45tg', description: `REPA IT: 3070011 | REPA DE: 605012`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070013-gl80tb' },
        update: { title: `GL80TB`, description: `REPA IT: 3070013 | REPA DE: 605008`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GL80TB`, slug: '3070013-gl80tb', description: `REPA IT: 3070013 | REPA DE: 605008`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070365-gly12raa' },
        update: { title: `GLY12RAa`, description: `REPA IT: 3070365 | REPA DE: 605312`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GLY12RAa`, slug: '3070365-gly12raa', description: `REPA IT: 3070365 | REPA DE: 605312`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070156-gp16tb' },
        update: { title: `GP16TB`, description: `REPA IT: 3070156 | REPA DE: 605170`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GP16TB`, slug: '3070156-gp16tb', description: `REPA IT: 3070156 | REPA DE: 605170`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070084-gx21tb' },
        update: { title: `GX21TB`, description: `REPA IT: 3070084 | REPA DE: LF3070084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GX21TB`, slug: '3070084-gx21tb', description: `REPA IT: 3070084 | REPA DE: LF3070084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070085-gs26tb' },
        update: { title: `GS26TB`, description: `REPA IT: 3070085 | REPA DE: LF3070085`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GS26TB`, slug: '3070085-gs26tb', description: `REPA IT: 3070085 | REPA DE: LF3070085`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070042-ml80fb' },
        update: { title: `ML80FB`, description: `Series: ML/MP MX MS | REPA IT: 3070042 | REPA DE: 605207`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ML80FB`, slug: '3070042-ml80fb', description: `Series: ML/MP MX MS | REPA IT: 3070042 | REPA DE: 605207`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070366-mly90laa' },
        update: { title: `MLY90LAa`, description: `Series: ML/MP MX MS | REPA IT: 3070366 | REPA DE: LF3070366`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MLY90LAa`, slug: '3070366-mly90laa', description: `Series: ML/MP MX MS | REPA IT: 3070366 | REPA DE: LF3070366`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070213-mpt12la' },
        update: { title: `MPT12LA`, description: `Series: ML/MP MX MS | REPA IT: 3070213 | REPA DE: LF3070213`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MPT12LA`, slug: '3070213-mpt12la', description: `Series: ML/MP MX MS | REPA IT: 3070213 | REPA DE: LF3070213`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070228-mpt14la' },
        update: { title: `MPT14LA`, description: `Series: ML/MP MX MS | REPA IT: 3070228 | REPA DE: 605307`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MPT14LA`, slug: '3070228-mpt14la', description: `Series: ML/MP MX MS | REPA IT: 3070228 | REPA DE: 605307`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070033-mx18fba' },
        update: { title: `MX18FBa`, description: `Series: ML/MP MX MS | REPA IT: 3070033 | REPA DE: 605127`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MX18FBa`, slug: '3070033-mx18fba', description: `Series: ML/MP MX MS | REPA IT: 3070033 | REPA DE: 605127`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070072-mx23fba' },
        update: { title: `MX23FBa`, description: `Series: ML/MP MX MS | REPA IT: 3070072 | REPA DE: 605180`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MX23FBa`, slug: '3070072-mx23fba', description: `Series: ML/MP MX MS | REPA IT: 3070072 | REPA DE: 605180`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070066-ms34fb' },
        update: { title: `MS34FB`, description: `Series: ML/MP MX MS | REPA IT: 3070066 | REPA DE: 605195`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MS34FB`, slug: '3070066-ms34fb', description: `Series: ML/MP MX MS | REPA IT: 3070066 | REPA DE: 605195`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070021-ml45tb' },
        update: { title: `ML45TB`, description: `Series: ML/MP MX MS | REPA IT: 3070021 | REPA DE: 605068`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ML45TB`, slug: '3070021-ml45tb', description: `Series: ML/MP MX MS | REPA IT: 3070021 | REPA DE: 605068`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070023-ml80tb' },
        update: { title: `ML80TB`, description: `Series: ML/MP MX MS | REPA IT: 3070023 | REPA DE: 605014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ML80TB`, slug: '3070023-ml80tb', description: `Series: ML/MP MX MS | REPA IT: 3070023 | REPA DE: 605014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070340-mpt12ra' },
        update: { title: `MPT12RA`, description: `Series: ML/MP MX MS | REPA IT: 3070340 | REPA DE: 605310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MPT12RA`, slug: '3070340-mpt12ra', description: `Series: ML/MP MX MS | REPA IT: 3070340 | REPA DE: 605310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070036-mx18tba' },
        update: { title: `MX18TBa`, description: `Series: ML/MP MX MS | REPA IT: 3070036 | REPA DE: 605072`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MX18TBa`, slug: '3070036-mx18tba', description: `Series: ML/MP MX MS | REPA IT: 3070036 | REPA DE: 605072`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070064-ms26tb' },
        update: { title: `MS26TB`, description: `Series: ML/MP MX MS | REPA IT: 3070064 | REPA DE: 605071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MS26TB`, slug: '3070064-ms26tb', description: `Series: ML/MP MX MS | REPA IT: 3070064 | REPA DE: 605071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070396-nut55cac' },
        update: { title: `NUT55CAc`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070396 | REPA DE: 605355`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NUT55CAc`, slug: '3070396-nut55cac', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070396 | REPA DE: 605355`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070514-nuy80laa' },
        update: { title: `NUY80LA_A`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070514 | REPA DE: LF3070514`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NUY80LA_A`, slug: '3070514-nuy80laa', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070514 | REPA DE: LF3070514`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070403-nly12laa' },
        update: { title: `NLY12LAa`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070403 | REPA DE: 605363`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NLY12LAa`, slug: '3070403-nly12laa', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070403 | REPA DE: 605363`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070407-npy14laa' },
        update: { title: `NPY14LAa`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070407 | REPA DE: 605367`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NPY14LAa`, slug: '3070407-npy14laa', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070407 | REPA DE: 605367`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5164642-npt18la' },
        update: { title: `NPT18LA`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 5164642 | REPA DE: LF5164642`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NPT18LA`, slug: '5164642-npt18la', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 5164642 | REPA DE: LF5164642`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070513-nst26nat' },
        update: { title: `NST26NA_T`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070513 | REPA DE: LF3070513`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NST26NA_T`, slug: '3070513-nst26nat', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070513 | REPA DE: LF3070513`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070397-nuy45raa' },
        update: { title: `NUY45RAa`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070397 | REPA DE: 605356`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NUY45RAa`, slug: '3070397-nuy45raa', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070397 | REPA DE: 605356`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070402-nuy80raa' },
        update: { title: `NUY80RAa`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070402 | REPA DE: 605362`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NUY80RAa`, slug: '3070402-nuy80raa', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070402 | REPA DE: 605362`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070400-npy12raa' },
        update: { title: `NPY12RAa`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070400 | REPA DE: 605360`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NPY12RAa`, slug: '3070400-npy12raa', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070400 | REPA DE: 605360`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070510-npt16ra' },
        update: { title: `NPT16RA`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070510 | REPA DE: LF3070510`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NPT16RA`, slug: '3070510-npt16ra', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070510 | REPA DE: LF3070510`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'cubigel-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070511-nx21tba' },
        update: { title: `NX21TBa`, description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070511 | REPA DE: LF3070511`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NX21TBa`, slug: '3070511-nx21tba', description: `Series: COMPRESSORS CUBIGEL R290 LBP | REPA IT: 3070511 | REPA DE: LF3070511`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070375-emy3109z' },
        update: { title: `EMY3109Z`, description: `REPA IT: 3070375 | REPA DE: 605017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMY3109Z`, slug: '3070375-emy3109z', description: `REPA IT: 3070375 | REPA DE: 605017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070376-emy3115z' },
        update: { title: `EMY3115Z`, description: `REPA IT: 3070376 | REPA DE: 605314`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMY3115Z`, slug: '3070376-emy3115z', description: `REPA IT: 3070376 | REPA DE: 605314`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070296-emye70hep' },
        update: { title: `EMYE70HEP`, description: `REPA IT: 3070296 | REPA DE: LF3070296`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMYE70HEP`, slug: '3070296-emye70hep', description: `REPA IT: 3070296 | REPA DE: LF3070296`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070231-nek1118z' },
        update: { title: `NEK1118Z`, description: `REPA IT: 3070231 | REPA DE: LF3070231`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK1118Z`, slug: '3070231-nek1118z', description: `REPA IT: 3070231 | REPA DE: LF3070231`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5063911-ne2130z' },
        update: { title: `NE2130Z`, description: `REPA IT: 5063911 | REPA DE: LF5063911`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NE2130Z`, slug: '5063911-ne2130z', description: `REPA IT: 5063911 | REPA DE: LF5063911`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '7119817-nek2140z' },
        update: { title: `NEK2140Z`, description: `REPA IT: 7119817 | REPA DE: LF7119817`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK2140Z`, slug: '7119817-nek2140z', description: `REPA IT: 7119817 | REPA DE: LF7119817`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070282-em45hhr' },
        update: { title: `EM45HHR`, description: `REPA IT: 3070282 | REPA DE: LF3070282`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EM45HHR`, slug: '3070282-em45hhr', description: `REPA IT: 3070282 | REPA DE: LF3070282`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070162-em65hhr' },
        update: { title: `EM65HHR`, description: `REPA IT: 3070162 | REPA DE: 605016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EM65HHR`, slug: '3070162-em65hhr', description: `REPA IT: 3070162 | REPA DE: 605016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070286-ffi85hak' },
        update: { title: `FFI8.5HAK`, description: `REPA IT: 3070286 | REPA DE: LF3070286`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FFI8.5HAK`, slug: '3070286-ffi85hak', description: `REPA IT: 3070286 | REPA DE: LF3070286`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070288-ffi12hbk' },
        update: { title: `FFI12HBK`, description: `REPA IT: 3070288 | REPA DE: 605244`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FFI12HBK`, slug: '3070288-ffi12hbk', description: `REPA IT: 3070288 | REPA DE: 605244`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070107-emt45hdr' },
        update: { title: `EMT45HDR`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070107 | REPA DE: 605086`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT45HDR`, slug: '3070107-emt45hdr', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070107 | REPA DE: 605086`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070218-emt6144z' },
        update: { title: `EMT6144Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070218 | REPA DE: 605166`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT6144Z`, slug: '3070218-emt6144z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070218 | REPA DE: 605166`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070172-nek6160z' },
        update: { title: `NEK6160Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070172 | REPA DE: 605308`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6160Z`, slug: '3070172-nek6160z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070172 | REPA DE: 605308`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070173-nek6170z' },
        update: { title: `NEK6170Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070173 | REPA DE: 605001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6170Z`, slug: '3070173-nek6170z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070173 | REPA DE: 605001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070175-nek6210z' },
        update: { title: `NEK6210Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070175 | REPA DE: 605208`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6210Z`, slug: '3070175-nek6210z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070175 | REPA DE: 605208`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070176-nek6212z' },
        update: { title: `NEK6212Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070176 | REPA DE: 605210`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6212Z`, slug: '3070176-nek6212z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070176 | REPA DE: 605210`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070177-nek6214z' },
        update: { title: `NEK6214Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070177 | REPA DE: 605237`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6214Z`, slug: '3070177-nek6214z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070177 | REPA DE: 605237`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070178-nt6215z' },
        update: { title: `NT6215Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070178 | REPA DE: 605079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT6215Z`, slug: '3070178-nt6215z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070178 | REPA DE: 605079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070180-nt6220z' },
        update: { title: `NT6220Z`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070180 | REPA DE: LF3070180`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT6220Z`, slug: '3070180-nt6220z', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070180 | REPA DE: LF3070180`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070053-nj6220zx' },
        update: { title: `NJ6220ZX`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070053 | REPA DE: LF3070053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ6220ZX`, slug: '3070053-nj6220zx', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070053 | REPA DE: LF3070053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070054-nj6226zx' },
        update: { title: `NJ6226ZX`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070054 | REPA DE: LF3070054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ6226ZX`, slug: '3070054-nj6226zx', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070054 | REPA DE: LF3070054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070224-emt2121gk' },
        update: { title: `EMT2121GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070224 | REPA DE: 605213`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT2121GK`, slug: '3070224-emt2121gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070224 | REPA DE: 605213`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070225-emt2125gk' },
        update: { title: `EMT2125GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070225 | REPA DE: 605206`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT2125GK`, slug: '3070225-emt2125gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070225 | REPA DE: 605206`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070315-emt2130gk' },
        update: { title: `EMT2130GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070315 | REPA DE: 605264`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT2130GK`, slug: '3070315-emt2130gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070315 | REPA DE: 605264`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070166-nek2134gk' },
        update: { title: `NEK2134GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070166 | REPA DE: 605152`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK2134GK`, slug: '3070166-nek2134gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070166 | REPA DE: 605152`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070120-nek2150gk' },
        update: { title: `NEK2150GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070120 | REPA DE: 605186`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK2150GK`, slug: '3070120-nek2150gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070120 | REPA DE: 605186`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070167-nek2168gk' },
        update: { title: `NEK2168GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070167 | REPA DE: 605144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK2168GK`, slug: '3070167-nek2168gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070167 | REPA DE: 605144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070168-nt2168gk' },
        update: { title: `NT2168GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070168 | REPA DE: 605304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT2168GK`, slug: '3070168-nt2168gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070168 | REPA DE: 605304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070169-nt2178gk' },
        update: { title: `NT2178GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070169 | REPA DE: LF3070169`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT2178GK`, slug: '3070169-nt2178gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070169 | REPA DE: LF3070169`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070171-nt2192gk' },
        update: { title: `NT2192GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070171 | REPA DE: 605260`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT2192GK`, slug: '3070171-nt2192gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070171 | REPA DE: 605260`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070257-nj2192gk-gemini-with-oil-equalization' },
        update: { title: `NJ2192GK Gemini with oil equalization`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070257 | REPA DE: LF3070257`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ2192GK Gemini with oil equalization`, slug: '3070257-nj2192gk-gemini-with-oil-equalization', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070257 | REPA DE: LF3070257`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070045-nj2212gk' },
        update: { title: `NJ2212GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070045 | REPA DE: 605081`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ2212GK`, slug: '3070045-nj2212gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070045 | REPA DE: 605081`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070047-nj2212gs' },
        update: { title: `NJ2212GS`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070047 | REPA DE: LF3070047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ2212GS`, slug: '3070047-nj2212gs', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070047 | REPA DE: LF3070047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070216-emt6152gk' },
        update: { title: `EMT6152GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070216 | REPA DE: 605004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT6152GK`, slug: '3070216-emt6152gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070216 | REPA DE: 605004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070217-emt6165gk' },
        update: { title: `EMT6165GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070217 | REPA DE: 605139`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT6165GK`, slug: '3070217-emt6165gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070217 | REPA DE: 605139`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070183-nek6181gk' },
        update: { title: `NEK6181GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070183 | REPA DE: 605162`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6181GK`, slug: '3070183-nek6181gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070183 | REPA DE: 605162`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070331-neu6212gk' },
        update: { title: `NEU6212GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070331 | REPA DE: LF3070331`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEU6212GK`, slug: '3070331-neu6212gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070331 | REPA DE: LF3070331`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070330-neu6215gk' },
        update: { title: `NEU6215GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070330 | REPA DE: LF3070330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEU6215GK`, slug: '3070330-neu6215gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070330 | REPA DE: LF3070330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070186-nek6217gk' },
        update: { title: `NEK6217GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070186 | REPA DE: 605178`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6217GK`, slug: '3070186-nek6217gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070186 | REPA DE: 605178`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070188-nt6222gk' },
        update: { title: `NT6222GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070188 | REPA DE: 605132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT6222GK`, slug: '3070188-nt6222gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070188 | REPA DE: 605132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070189-nt6226gk' },
        update: { title: `NT6226GK`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070189 | REPA DE: 605165`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT6226GK`, slug: '3070189-nt6226gk', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070189 | REPA DE: 605165`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070020-nj9226gs' },
        update: { title: `NJ9226GS`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070020 | REPA DE: LF3070020`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ9226GS`, slug: '3070020-nj9226gs', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070020 | REPA DE: LF3070020`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070027-nj9232gs' },
        update: { title: `NJ9232GS`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070027 | REPA DE: S0208393`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ9232GS`, slug: '3070027-nj9232gs', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070027 | REPA DE: S0208393`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070028-nj9238gs' },
        update: { title: `NJ9238GS`, description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070028 | REPA DE: LF3070028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NJ9238GS`, slug: '3070028-nj9238gs', description: `Series: EMT NEK/NEU NT NJ | REPA IT: 3070028 | REPA DE: LF3070028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5130990-em2x1121u' },
        update: { title: `EM2X1121U`, description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 5130990 | REPA DE: 605344`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EM2X1121U`, slug: '5130990-em2x1121u', description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 5130990 | REPA DE: 605344`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070267-emt2125u' },
        update: { title: `EMT2125U`, description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070267 | REPA DE: LF3070267`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT2125U`, slug: '3070267-emt2125u', description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070267 | REPA DE: LF3070267`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070268-nek2134u' },
        update: { title: `NEK2134U`, description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070268 | REPA DE: 605274`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK2134U`, slug: '3070268-nek2134u', description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070268 | REPA DE: 605274`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070332-neu2155u' },
        update: { title: `NEU2155U`, description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070332 | REPA DE: 605243`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEU2155U`, slug: '3070332-neu2155u', description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070332 | REPA DE: 605243`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070301-neu2168u' },
        update: { title: `NEU2168U`, description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070301 | REPA DE: LF3070301`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEU2168U`, slug: '3070301-neu2168u', description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070301 | REPA DE: LF3070301`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070271-nt2170u' },
        update: { title: `NT2170U`, description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070271 | REPA DE: 605202`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT2170U`, slug: '3070271-nt2170u', description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070271 | REPA DE: 605202`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070311-nt2210u' },
        update: { title: `NT2210U`, description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070311 | REPA DE: 605203`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT2210U`, slug: '3070311-nt2210u', description: `Series: COMPRESSORS EMBRACO R290 LBP | REPA IT: 3070311 | REPA DE: 605203`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070263-emt6152u' },
        update: { title: `EMT6152U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070263 | REPA DE: 605201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT6152U`, slug: '3070263-emt6152u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070263 | REPA DE: 605201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070264-emt6165u' },
        update: { title: `EMT6165U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070264 | REPA DE: 605198`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMT6165U`, slug: '3070264-emt6165u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070264 | REPA DE: 605198`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070265-nek6181u' },
        update: { title: `NEK6181U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070265 | REPA DE: LF3070265`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6181U`, slug: '3070265-nek6181u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070265 | REPA DE: LF3070265`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070310-neu6210u' },
        update: { title: `NEU6210U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070310 | REPA DE: LF3070310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEU6210U`, slug: '3070310-neu6210u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070310 | REPA DE: LF3070310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070266-nek6213u' },
        update: { title: `NEK6213U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070266 | REPA DE: 605305`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6213U`, slug: '3070266-nek6213u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070266 | REPA DE: 605305`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070303-neu6217u' },
        update: { title: `NEU6217U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070303 | REPA DE: LF3070303`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEU6217U`, slug: '3070303-neu6217u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070303 | REPA DE: LF3070303`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070304-nt6220u' },
        update: { title: `NT6220U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070304 | REPA DE: LF3070304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT6220U`, slug: '3070304-nt6220u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070304 | REPA DE: LF3070304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070306-nt6224u' },
        update: { title: `NT6224U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070306 | REPA DE: LF3070306`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NT6224U`, slug: '3070306-nt6224u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070306 | REPA DE: LF3070306`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070516-ntx6238u' },
        update: { title: `NTX6238U`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070516 | REPA DE: LF3070516`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NTX6238U`, slug: '3070516-ntx6238u', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 3070516 | REPA DE: LF3070516`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5215388-emu5132y' },
        update: { title: `EMU5132Y`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 5215388 | REPA DE: 605085`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMU5132Y`, slug: '5215388-emu5132y', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 5215388 | REPA DE: 605085`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5087248-nek6160y' },
        update: { title: `NEK6160Y`, description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 5087248 | REPA DE: 605248`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NEK6160Y`, slug: '5087248-nek6160y', description: `Series: COMPRESSORS EMBRACO R290 HMBP | REPA IT: 5087248 | REPA DE: 605248`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070378-emx32clc' },
        update: { title: `EMX32CLC`, description: `REPA IT: 3070378 | REPA DE: 605315`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMX32CLC`, slug: '3070378-emx32clc', description: `REPA IT: 3070378 | REPA DE: 605315`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070373-emd46clt' },
        update: { title: `EMD46CLT`, description: `REPA IT: 3070373 | REPA DE: 605257`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMD46CLT`, slug: '3070373-emd46clt', description: `REPA IT: 3070373 | REPA DE: 605257`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'embraco-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5163745-emy3118y' },
        update: { title: `EMY3118Y`, description: `REPA IT: 5163745 | REPA DE: LF5163745`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EMY3118Y`, slug: '5163745-emy3118y', description: `REPA IT: 5163745 | REPA DE: LF5163745`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070077-tl5g' },
        update: { title: `TL5G`, description: `Series: TL/FR NL SC GS | REPA IT: 3070077 | REPA DE: 605052`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TL5G`, slug: '3070077-tl5g', description: `Series: TL/FR NL SC GS | REPA IT: 3070077 | REPA DE: 605052`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070256-fr6g' },
        update: { title: `FR6G`, description: `Series: TL/FR NL SC GS | REPA IT: 3070256 | REPA DE: 605055`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FR6G`, slug: '3070256-fr6g', description: `Series: TL/FR NL SC GS | REPA IT: 3070256 | REPA DE: 605055`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070221-nl73mf' },
        update: { title: `NL7.3MF`, description: `Series: TL/FR NL SC GS | REPA IT: 3070221 | REPA DE: 605063`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NL7.3MF`, slug: '3070221-nl73mf', description: `Series: TL/FR NL SC GS | REPA IT: 3070221 | REPA DE: 605063`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070207-nl84mf' },
        update: { title: `NL8.4MF`, description: `Series: TL/FR NL SC GS | REPA IT: 3070207 | REPA DE: 605089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NL8.4MF`, slug: '3070207-nl84mf', description: `Series: TL/FR NL SC GS | REPA IT: 3070207 | REPA DE: 605089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070154-fr11g' },
        update: { title: `FR11G`, description: `Series: TL/FR NL SC GS | REPA IT: 3070154 | REPA DE: 605205`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FR11G`, slug: '3070154-fr11g', description: `Series: TL/FR NL SC GS | REPA IT: 3070154 | REPA DE: 605205`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070071-sc10g' },
        update: { title: `SC10G`, description: `Series: TL/FR NL SC GS | REPA IT: 3070071 | REPA DE: 605221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC10G`, slug: '3070071-sc10g', description: `Series: TL/FR NL SC GS | REPA IT: 3070071 | REPA DE: 605221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070067-sc12g' },
        update: { title: `SC12G`, description: `Series: TL/FR NL SC GS | REPA IT: 3070067 | REPA DE: 605087`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC12G`, slug: '3070067-sc12g', description: `Series: TL/FR NL SC GS | REPA IT: 3070067 | REPA DE: 605087`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070069-sc18g' },
        update: { title: `SC18G`, description: `Series: TL/FR NL SC GS | REPA IT: 3070069 | REPA DE: 605076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC18G`, slug: '3070069-sc18g', description: `Series: TL/FR NL SC GS | REPA IT: 3070069 | REPA DE: 605076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070155-sc21g' },
        update: { title: `SC21G`, description: `Series: TL/FR NL SC GS | REPA IT: 3070155 | REPA DE: 605194`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC21G`, slug: '3070155-sc21g', description: `Series: TL/FR NL SC GS | REPA IT: 3070155 | REPA DE: 605194`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070358-gs26mfx' },
        update: { title: `GS26MFX`, description: `Series: TL/FR NL SC GS | REPA IT: 3070358 | REPA DE: LF3070358`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GS26MFX`, slug: '3070358-gs26mfx', description: `Series: TL/FR NL SC GS | REPA IT: 3070358 | REPA DE: LF3070358`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070289-tl45clx' },
        update: { title: `TL4.5CLX`, description: `Series: TL/FR NL SC GS | REPA IT: 3070289 | REPA DE: LF3070289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TL4.5CLX`, slug: '3070289-tl45clx', description: `Series: TL/FR NL SC GS | REPA IT: 3070289 | REPA DE: LF3070289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070280-fr75cl' },
        update: { title: `FR7.5CL`, description: `Series: TL/FR NL SC GS | REPA IT: 3070280 | REPA DE: LF3070280`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FR7.5CL`, slug: '3070280-fr75cl', description: `Series: TL/FR NL SC GS | REPA IT: 3070280 | REPA DE: LF3070280`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070082-fr85cl' },
        update: { title: `FR8.5CL`, description: `Series: TL/FR NL SC GS | REPA IT: 3070082 | REPA DE: 605080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FR8.5CL`, slug: '3070082-fr85cl', description: `Series: TL/FR NL SC GS | REPA IT: 3070082 | REPA DE: 605080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070159-sc10cl' },
        update: { title: `SC10CL`, description: `Series: TL/FR NL SC GS | REPA IT: 3070159 | REPA DE: LF3070159`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC10CL`, slug: '3070159-sc10cl', description: `Series: TL/FR NL SC GS | REPA IT: 3070159 | REPA DE: LF3070159`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070073-sc12cl' },
        update: { title: `SC12CL`, description: `Series: TL/FR NL SC GS | REPA IT: 3070073 | REPA DE: 605057`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC12CL`, slug: '3070073-sc12cl', description: `Series: TL/FR NL SC GS | REPA IT: 3070073 | REPA DE: 605057`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070293-sc15clx2' },
        update: { title: `SC15CLX.2`, description: `Series: TL/FR NL SC GS | REPA IT: 3070293 | REPA DE: 605330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC15CLX.2`, slug: '3070293-sc15clx2', description: `Series: TL/FR NL SC GS | REPA IT: 3070293 | REPA DE: 605330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070294-sc18clx2' },
        update: { title: `SC18CLX.2`, description: `Series: TL/FR NL SC GS | REPA IT: 3070294 | REPA DE: 605056`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC18CLX.2`, slug: '3070294-sc18clx2', description: `Series: TL/FR NL SC GS | REPA IT: 3070294 | REPA DE: 605056`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070356-gs26clx' },
        update: { title: `GS26CLX`, description: `Series: TL/FR NL SC GS | REPA IT: 3070356 | REPA DE: LF3070356`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GS26CLX`, slug: '3070356-gs26clx', description: `Series: TL/FR NL SC GS | REPA IT: 3070356 | REPA DE: LF3070356`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070361-nf7mlx' },
        update: { title: `NF7MLX`, description: `Series: TL NL SC GS | REPA IT: 3070361 | REPA DE: LF3070361`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NF7MLX`, slug: '3070361-nf7mlx', description: `Series: TL NL SC GS | REPA IT: 3070361 | REPA DE: LF3070361`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070352-sc12mlx' },
        update: { title: `SC12MLX`, description: `Series: TL NL SC GS | REPA IT: 3070352 | REPA DE: 605336`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC12MLX`, slug: '3070352-sc12mlx', description: `Series: TL NL SC GS | REPA IT: 3070352 | REPA DE: 605336`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070355-sc18mlx' },
        update: { title: `SC18MLX`, description: `Series: TL NL SC GS | REPA IT: 3070355 | REPA DE: LF3070355`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC18MLX`, slug: '3070355-sc18mlx', description: `Series: TL NL SC GS | REPA IT: 3070355 | REPA DE: LF3070355`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070354-gs21mlx' },
        update: { title: `GS21MLX`, description: `Series: TL NL SC GS | REPA IT: 3070354 | REPA DE: LF3070354`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GS21MLX`, slug: '3070354-gs21mlx', description: `Series: TL NL SC GS | REPA IT: 3070354 | REPA DE: LF3070354`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070357-gs34mlx' },
        update: { title: `GS34MLX`, description: `Series: TL NL SC GS | REPA IT: 3070357 | REPA DE: LF3070357`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `GS34MLX`, slug: '3070357-gs34mlx', description: `Series: TL NL SC GS | REPA IT: 3070357 | REPA DE: LF3070357`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070335-nl7cn' },
        update: { title: `NL7CN`, description: `Series: TL NL SC GS | REPA IT: 3070335 | REPA DE: LF3070335`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NL7CN`, slug: '3070335-nl7cn', description: `Series: TL NL SC GS | REPA IT: 3070335 | REPA DE: LF3070335`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070389-nle11cnl' },
        update: { title: `NLE11CNL`, description: `Series: TL NL SC GS | REPA IT: 3070389 | REPA DE: 605349`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NLE11CNL`, slug: '3070389-nle11cnl', description: `Series: TL NL SC GS | REPA IT: 3070389 | REPA DE: 605349`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070339-sc12cnx2' },
        update: { title: `SC12CNX.2`, description: `Series: TL NL SC GS | REPA IT: 3070339 | REPA DE: 605261`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC12CNX.2`, slug: '3070339-sc12cnx2', description: `Series: TL NL SC GS | REPA IT: 3070339 | REPA DE: 605261`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070308-sc18cnx2' },
        update: { title: `SC18CNX.2`, description: `Series: TL NL SC GS | REPA IT: 3070308 | REPA DE: LF3070308`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SC18CNX.2`, slug: '3070308-sc18cnx2', description: `Series: TL NL SC GS | REPA IT: 3070308 | REPA DE: LF3070308`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070385-dle48cn' },
        update: { title: `DLE4.8CN`, description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070385 | REPA DE: 605268`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DLE4.8CN`, slug: '3070385-dle48cn', description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070385 | REPA DE: 605268`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070387-dle65cn' },
        update: { title: `DLE6.5CN`, description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070387 | REPA DE: 605269`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DLE6.5CN`, slug: '3070387-dle65cn', description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070387 | REPA DE: 605269`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070388-nle88cn' },
        update: { title: `NLE8.8CN`, description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070388 | REPA DE: 605348`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `NLE8.8CN`, slug: '3070388-nle88cn', description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070388 | REPA DE: 605348`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070497-secop-dlv57cn' },
        update: { title: `SECOP DLV5.7CN`, description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070497 | REPA DE: LF3070497`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SECOP DLV5.7CN`, slug: '3070497-secop-dlv57cn', description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070497 | REPA DE: LF3070497`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070498-secop-slve18cn' },
        update: { title: `SECOP SLVE18CN`, description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070498 | REPA DE: LF3070498`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SECOP SLVE18CN`, slug: '3070498-secop-slve18cn', description: `Series: COMPRESSORS SECOP R290 MLBP | REPA IT: 3070498 | REPA DE: LF3070498`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5032701' },
        update: { title: `5032701`, description: `REPA IT: 5032701 | REPA DE: LF5032701`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5032701`, slug: '5032701', description: `REPA IT: 5032701 | REPA DE: LF5032701`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5031255' },
        update: { title: `5031255`, description: `REPA IT: 5031255 | REPA DE: 380483`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5031255`, slug: '5031255', description: `REPA IT: 5031255 | REPA DE: 380483`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5059726' },
        update: { title: `5059726`, description: `REPA IT: 5059726 | REPA DE: 380078`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5059726`, slug: '5059726', description: `REPA IT: 5059726 | REPA DE: 380078`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5112516' },
        update: { title: `5112516`, description: `REPA IT: 5112516 | REPA DE: 381548`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5112516`, slug: '5112516', description: `REPA IT: 5112516 | REPA DE: 381548`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5112512' },
        update: { title: `5112512`, description: `REPA IT: 5112512 | REPA DE: 381528`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5112512`, slug: '5112512', description: `REPA IT: 5112512 | REPA DE: 381528`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5112515' },
        update: { title: `5112515`, description: `REPA IT: 5112515 | REPA DE: 381530`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5112515`, slug: '5112515', description: `REPA IT: 5112515 | REPA DE: 381530`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'secop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5036282' },
        update: { title: `5036282`, description: `REPA IT: 5036282 | REPA DE: 365061`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5036282`, slug: '5036282', description: `REPA IT: 5036282 | REPA DE: 365061`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070234-thb4413yfz' },
        update: { title: `THB4413YFZ`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070234 | REPA DE: LF3070234`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `THB4413YFZ`, slug: '3070234-thb4413yfz', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070234 | REPA DE: LF3070234`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070200-thb4419yfz' },
        update: { title: `THB4419YFZ`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070200 | REPA DE: 605184`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `THB4419YFZ`, slug: '3070200-thb4419yfz', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070200 | REPA DE: 605184`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070247-ae4425y' },
        update: { title: `AE4425Y`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070247 | REPA DE: 605249`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4425Y`, slug: '3070247-ae4425y', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070247 | REPA DE: 605249`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070242-ae4440y' },
        update: { title: `AE4440Y`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070242 | REPA DE: 605188`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4440Y`, slug: '3070242-ae4440y', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070242 | REPA DE: 605188`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070244-ae4456y' },
        update: { title: `AE4456Y`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070244 | REPA DE: 605167`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4456Y`, slug: '3070244-ae4456y', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070244 | REPA DE: 605167`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070145-caj4461yr' },
        update: { title: `CAJ4461Y/R`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070145 | REPA DE: 605160`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ4461Y/R`, slug: '3070145-caj4461yr', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070145 | REPA DE: 605160`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070146-caj4476yr' },
        update: { title: `CAJ4476Y/R`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070146 | REPA DE: LF3070146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ4476Y/R`, slug: '3070146-caj4476yr', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070146 | REPA DE: LF3070146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070147-caj4492yr' },
        update: { title: `CAJ4492Y/R`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070147 | REPA DE: 605329`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ4492Y/R`, slug: '3070147-caj4492yr', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070147 | REPA DE: 605329`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070148-caj4511yr' },
        update: { title: `CAJ4511Y/R`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070148 | REPA DE: LF3070148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ4511Y/R`, slug: '3070148-caj4511yr', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070148 | REPA DE: LF3070148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070316-taj4511ys' },
        update: { title: `TAJ4511Y/S`, description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070316 | REPA DE: 605332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAJ4511Y/S`, slug: '3070316-taj4511ys', description: `Series: THB AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070316 | REPA DE: 605332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2101211-fh4518yr' },
        update: { title: `FH4518Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2101211 | REPA DE: LF2101211`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FH4518Y/R`, slug: '2101211-fh4518yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2101211 | REPA DE: LF2101211`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102058-tfh4518yr' },
        update: { title: `TFH4518Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2102058 | REPA DE: LF2102058`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH4518Y/R`, slug: '2102058-tfh4518yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2102058 | REPA DE: LF2102058`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077067-fh4525yr' },
        update: { title: `FH4525Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077067 | REPA DE: LF5077067`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FH4525Y/R`, slug: '5077067-fh4525yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077067 | REPA DE: LF5077067`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077065-tfh4525yr' },
        update: { title: `TFH4525Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077065 | REPA DE: LF5077065`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH4525Y/R`, slug: '5077065-tfh4525yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077065 | REPA DE: LF5077065`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077071-tag4528yr' },
        update: { title: `TAG4528Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077071 | REPA DE: LF5077071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4528Y/R`, slug: '5077071-tag4528yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077071 | REPA DE: LF5077071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077074-tag4534yr' },
        update: { title: `TAG4534Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077074 | REPA DE: LF5077074`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4534Y/R`, slug: '5077074-tag4534yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077074 | REPA DE: LF5077074`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077076-tag4537yr' },
        update: { title: `TAG4537Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077076 | REPA DE: LF5077076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4537Y/R`, slug: '5077076-tag4537yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077076 | REPA DE: LF5077076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077079-tag4543yr' },
        update: { title: `TAG4543Y/R`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077079 | REPA DE: LF5077079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4543Y/R`, slug: '5077079-tag4543yr', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077079 | REPA DE: LF5077079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070382-ae1420z' },
        update: { title: `AE1420Z`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070382 | REPA DE: LF3070382`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE1420Z`, slug: '3070382-ae1420z', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070382 | REPA DE: LF3070382`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070608-ae2430z' },
        update: { title: `AE2430Z`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070608 | REPA DE: 605157`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE2430Z`, slug: '3070608-ae2430z', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070608 | REPA DE: 605157`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070319-caj2432zs' },
        update: { title: `CAJ2432Z/S`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070319 | REPA DE: LF3070319`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ2432Z/S`, slug: '3070319-caj2432zs', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070319 | REPA DE: LF3070319`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070323-caj2440zs' },
        update: { title: `CAJ2440Z/S`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070323 | REPA DE: LF3070323`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ2440Z/S`, slug: '3070323-caj2440zs', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070323 | REPA DE: LF3070323`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070320-caj2446zs' },
        update: { title: `CAJ2446Z/S`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070320 | REPA DE: 605306`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ2446Z/S`, slug: '3070320-caj2446zs', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070320 | REPA DE: 605306`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2101934-caj2464zs' },
        update: { title: `CAJ2464Z/S`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 2101934 | REPA DE: 605320`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ2464Z/S`, slug: '2101934-caj2464zs', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 2101934 | REPA DE: 605320`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070321-taj2446zs' },
        update: { title: `TAJ2446Z/S`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070321 | REPA DE: LF3070321`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAJ2446Z/S`, slug: '3070321-taj2446zs', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070321 | REPA DE: LF3070321`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070322-taj2464zs' },
        update: { title: `TAJ2464Z/S`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070322 | REPA DE: 605187`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAJ2464Z/S`, slug: '3070322-taj2464zs', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070322 | REPA DE: 605187`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102553-tfh2480zs' },
        update: { title: `TFH2480Z/S`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2102553 | REPA DE: LF2102553`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH2480Z/S`, slug: '2102553-tfh2480zs', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2102553 | REPA DE: LF2102553`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077091-fh2511zs' },
        update: { title: `FH2511Z/S`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077091 | REPA DE: LF5077091`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FH2511Z/S`, slug: '5077091-fh2511zs', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5077091 | REPA DE: LF5077091`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2101708-tfh2511zs' },
        update: { title: `TFH2511Z/S`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2101708 | REPA DE: 605335`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH2511Z/S`, slug: '2101708-tfh2511zs', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 2101708 | REPA DE: 605335`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5076948-tag2516zs' },
        update: { title: `TAG2516Z/S`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5076948 | REPA DE: LF5076948`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG2516Z/S`, slug: '5076948-tag2516zs', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5076948 | REPA DE: LF5076948`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5076951-tag2522zs' },
        update: { title: `TAG2522Z/S`, description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5076951 | REPA DE: LF5076951`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG2522Z/S`, slug: '5076951-tag2522zs', description: `Series: FH/S-TFH/S-TAG/S FH/R-TFH/R-TAG/R | REPA IT: 5076951 | REPA DE: LF5076951`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070249-ae4430z' },
        update: { title: `AE4430Z`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070249 | REPA DE: 605025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4430Z`, slug: '3070249-ae4430z', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070249 | REPA DE: 605025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070251-ae4450z' },
        update: { title: `AE4450Z`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070251 | REPA DE: 605023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4450Z`, slug: '3070251-ae4450z', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070251 | REPA DE: 605023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070253-ae4470z' },
        update: { title: `AE4470Z`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070253 | REPA DE: 605158`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4470Z`, slug: '3070253-ae4470z', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070253 | REPA DE: 605158`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070130-caj9480zr' },
        update: { title: `CAJ9480Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070130 | REPA DE: 605325`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ9480Z/R`, slug: '3070130-caj9480zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070130 | REPA DE: 605325`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070131-caj9510zr' },
        update: { title: `CAJ9510Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070131 | REPA DE: 605327`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ9510Z/R`, slug: '3070131-caj9510zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070131 | REPA DE: 605327`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070132-caj9513zr' },
        update: { title: `CAJ9513Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070132 | REPA DE: LF3070132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ9513Z/R`, slug: '3070132-caj9513zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070132 | REPA DE: LF3070132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070133-caj4517zr' },
        update: { title: `CAJ4517Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070133 | REPA DE: 605328`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ4517Z/R`, slug: '3070133-caj4517zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070133 | REPA DE: 605328`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070134-caj4519zr' },
        update: { title: `CAJ4519Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070134 | REPA DE: 605326`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAJ4519Z/R`, slug: '3070134-caj4519zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070134 | REPA DE: 605326`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070136-taj9510zr' },
        update: { title: `TAJ9510Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070136 | REPA DE: LF3070136`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAJ9510Z/R`, slug: '3070136-taj9510zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070136 | REPA DE: LF3070136`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070138-taj4517zr' },
        update: { title: `TAJ4517Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070138 | REPA DE: LF3070138`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAJ4517Z/R`, slug: '3070138-taj4517zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070138 | REPA DE: LF3070138`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070139-taj4519zr' },
        update: { title: `TAJ4519Z/R`, description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070139 | REPA DE: 605277`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAJ4519Z/R`, slug: '3070139-taj4519zr', description: `Series: AE CAJ/S-TAJ/S CAJ/R-TAJ/R | REPA IT: 3070139 | REPA DE: 605277`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070312-fh4522zr' },
        update: { title: `FH4522Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 3070312 | REPA DE: LF3070312`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FH4522Z/R`, slug: '3070312-fh4522zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 3070312 | REPA DE: LF3070312`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077017-tfh4522zr' },
        update: { title: `TFH4522Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077017 | REPA DE: LF5077017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH4522Z/R`, slug: '5077017-tfh4522zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077017 | REPA DE: LF5077017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077026-fh4524r' },
        update: { title: `FH4524/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077026 | REPA DE: LF5077026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FH4524/R`, slug: '5077026-fh4524r', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077026 | REPA DE: LF5077026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102343-tfh4524zr' },
        update: { title: `TFH4524Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 2102343 | REPA DE: LF2102343`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH4524Z/R`, slug: '2102343-tfh4524zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 2102343 | REPA DE: LF2102343`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5039421-fh4531zr' },
        update: { title: `FH4531Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5039421 | REPA DE: LF5039421`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FH4531Z/R`, slug: '5039421-fh4531zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5039421 | REPA DE: LF5039421`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077030-tfh4531zr' },
        update: { title: `TFH4531Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077030 | REPA DE: LF5077030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH4531Z/R`, slug: '5077030-tfh4531zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077030 | REPA DE: LF5077030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5067384-fh4540zr' },
        update: { title: `FH4540Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5067384 | REPA DE: LF5067384`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FH4540Z/R`, slug: '5067384-fh4540zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5067384 | REPA DE: LF5067384`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077034-tfh4540zr' },
        update: { title: `TFH4540Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077034 | REPA DE: LF5077034`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TFH4540Z/R`, slug: '5077034-tfh4540zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077034 | REPA DE: LF5077034`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077035-tag4546zr' },
        update: { title: `TAG4546Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077035 | REPA DE: LF5077035`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4546Z/R`, slug: '5077035-tag4546zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077035 | REPA DE: LF5077035`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077037-tag4553zr' },
        update: { title: `TAG4553Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077037 | REPA DE: LF5077037`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4553Z/R`, slug: '5077037-tag4553zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077037 | REPA DE: LF5077037`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077043-tag4561zr' },
        update: { title: `TAG4561Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077043 | REPA DE: LF5077043`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4561Z/R`, slug: '5077043-tag4561zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077043 | REPA DE: LF5077043`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077045-tag4568zr' },
        update: { title: `TAG4568Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077045 | REPA DE: LF5077045`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4568Z/R`, slug: '5077045-tag4568zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077045 | REPA DE: LF5077045`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5077051-tag4573zr' },
        update: { title: `TAG4573Z/R`, description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077051 | REPA DE: LF5077051`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TAG4573Z/R`, slug: '5077051-tag4573zr', description: `Series: FH/S-TFH/S FH/R-TFH/R | REPA IT: 5077051 | REPA DE: LF5077051`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070518-ae4430u' },
        update: { title: `AE4430U`, description: `Series: COMPRESSORS TECUMSEH R290 HMBP | REPA IT: 3070518 | REPA DE: LF3070518`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4430U`, slug: '3070518-ae4430u', description: `Series: COMPRESSORS TECUMSEH R290 HMBP | REPA IT: 3070518 | REPA DE: LF3070518`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070520-ae4450u' },
        update: { title: `AE4450U`, description: `Series: COMPRESSORS TECUMSEH R290 HMBP | REPA IT: 3070520 | REPA DE: LF3070520`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE4450U`, slug: '3070520-ae4450u', description: `Series: COMPRESSORS TECUMSEH R290 HMBP | REPA IT: 3070520 | REPA DE: LF3070520`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'tecumseh-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070524-ae2415u' },
        update: { title: `AE2415U`, description: `Series: COMPRESSORS TECUMSEH R290 HMBP | REPA IT: 3070524 | REPA DE: LF3070524`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AE2415U`, slug: '3070524-ae2415u', description: `Series: COMPRESSORS TECUMSEH R290 HMBP | REPA IT: 3070524 | REPA DE: LF3070524`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compressors-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068102' },
        update: { title: `3068102`, description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068102 | REPA DE: 365153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3068102`, slug: '3068102', description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068102 | REPA DE: 365153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compressors-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068070' },
        update: { title: `3068070`, description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068070 | REPA DE: 365094`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3068070`, slug: '3068070', description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068070 | REPA DE: 365094`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compressors-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068067' },
        update: { title: `3068067`, description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068067 | REPA DE: 365111`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3068067`, slug: '3068067', description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068067 | REPA DE: 365111`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compressors-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068069' },
        update: { title: `3068069`, description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068069 | REPA DE: LF3068069`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3068069`, slug: '3068069', description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068069 | REPA DE: LF3068069`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compressors-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068039' },
        update: { title: `3068039`, description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068039 | REPA DE: LF3068039`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3068039`, slug: '3068039', description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068039 | REPA DE: LF3068039`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compressors-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068035' },
        update: { title: `3068035`, description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068035 | REPA DE: LF3068035`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3068035`, slug: '3068035', description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068035 | REPA DE: LF3068035`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compressors-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068037' },
        update: { title: `3068037`, description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068037 | REPA DE: LF3068037`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3068037`, slug: '3068037', description: `Series: UNIVERSAL ANTI-VIBRATION FEET FOR COMPRESSORS | REPA IT: 3068037 | REPA DE: LF3068037`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070433-zr22k3e-pfj-522' },
        update: { title: `ZR22K3E PFJ 522`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070433 | REPA DE: LF3070433`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ZR22K3E PFJ 522`, slug: '3070433-zr22k3e-pfj-522', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070433 | REPA DE: LF3070433`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070435-zr34k3e-pfj-522' },
        update: { title: `ZR34K3E PFJ 522`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070435 | REPA DE: LF3070435`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ZR34K3E PFJ 522`, slug: '3070435-zr34k3e-pfj-522', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070435 | REPA DE: LF3070435`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070438-zr40k3e-tfd-522' },
        update: { title: `ZR40K3E TFD 522`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070438 | REPA DE: LF3070438`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ZR40K3E TFD 522`, slug: '3070438-zr40k3e-tfd-522', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070438 | REPA DE: LF3070438`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070584-c-sbn353h8g' },
        update: { title: `C-SBN353H8G`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070584 | REPA DE: LF3070584`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `C-SBN353H8G`, slug: '3070584-c-sbn353h8g', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070584 | REPA DE: LF3070584`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070586-c-sbs235h38b' },
        update: { title: `C-SBS235H38B`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070586 | REPA DE: LF3070586`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `C-SBS235H38B`, slug: '3070586-c-sbs235h38b', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070586 | REPA DE: LF3070586`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070588-c-scn753h8k' },
        update: { title: `C-SCN753H8K`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070588 | REPA DE: LF3070588`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `C-SCN753H8K`, slug: '3070588-c-scn753h8k', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070588 | REPA DE: LF3070588`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070590-c-sbn303h8h' },
        update: { title: `C-SBN303H8H`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070590 | REPA DE: LF3070590`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `C-SBN303H8H`, slug: '3070590-c-sbn303h8h', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070590 | REPA DE: LF3070590`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'scroll-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070592-c-scp270h38b' },
        update: { title: `C-SCP270H38B`, description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070592 | REPA DE: LF3070592`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `C-SCP270H38B`, slug: '3070592-c-scp270h38b', description: `Series: COMPRESSORS SCROLL COPELAND | REPA IT: 3070592 | REPA DE: LF3070592`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070556-mtz22-4vm' },
        update: { title: `MTZ22-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070556 | REPA DE: LF3070556`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ22-4VM`, slug: '3070556-mtz22-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070556 | REPA DE: LF3070556`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070558-mtz32-4vm' },
        update: { title: `MTZ32-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070558 | REPA DE: LF3070558`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ32-4VM`, slug: '3070558-mtz32-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070558 | REPA DE: LF3070558`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070560-mtz40-4vm' },
        update: { title: `MTZ40-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070560 | REPA DE: LF3070560`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ40-4VM`, slug: '3070560-mtz40-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070560 | REPA DE: LF3070560`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070562-mtz50-4vm' },
        update: { title: `MTZ50-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070562 | REPA DE: LF3070562`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ50-4VM`, slug: '3070562-mtz50-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070562 | REPA DE: LF3070562`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070564-mtz64-4vm' },
        update: { title: `MTZ64-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070564 | REPA DE: LF3070564`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ64-4VM`, slug: '3070564-mtz64-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070564 | REPA DE: LF3070564`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070566-mtz80-4vm' },
        update: { title: `MTZ80-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070566 | REPA DE: LF3070566`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ80-4VM`, slug: '3070566-mtz80-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070566 | REPA DE: LF3070566`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070567-mtz125-4vm' },
        update: { title: `MTZ125-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070567 | REPA DE: LF3070567`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ125-4VM`, slug: '3070567-mtz125-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070567 | REPA DE: LF3070567`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'danfoss-maneurop-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070569-mtz160-4vm' },
        update: { title: `MTZ160-4VM`, description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070569 | REPA DE: LF3070569`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTZ160-4VM`, slug: '3070569-mtz160-4vm', description: `Series: COMPRESSORS DANFOSS MANEUROP | REPA IT: 3070569 | REPA DE: LF3070569`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070528-h80cc' },
        update: { title: `H80CC`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070528 | REPA DE: LF3070528`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `H80CC`, slug: '3070528-h80cc', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070528 | REPA DE: LF3070528`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070441-h101cc' },
        update: { title: `H101CC`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070441 | REPA DE: LF3070441`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `H101CC`, slug: '3070441-h101cc', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070441 | REPA DE: LF3070441`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070443-h151cc' },
        update: { title: `H151CC`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070443 | REPA DE: LF3070443`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `H151CC`, slug: '3070443-h151cc', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070443 | REPA DE: LF3070443`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070445-h181cc' },
        update: { title: `H181CC`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070445 | REPA DE: LF3070445`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `H181CC`, slug: '3070445-h181cc', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070445 | REPA DE: LF3070445`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070447-h201cc' },
        update: { title: `H201CC`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070447 | REPA DE: LF3070447`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `H201CC`, slug: '3070447-h201cc', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070447 | REPA DE: LF3070447`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5238766' },
        update: { title: `5238766`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 5238766 | REPA DE: LF5238766`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5238766`, slug: '5238766', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 5238766 | REPA DE: LF5238766`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070571-a07-5y' },
        update: { title: `A07-5Y`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070571 | REPA DE: LF3070571`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A07-5Y`, slug: '3070571-a07-5y', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070571 | REPA DE: LF3070571`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070573-a1-7y' },
        update: { title: `A1-7Y`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070573 | REPA DE: LF3070573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A1-7Y`, slug: '3070573-a1-7y', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070573 | REPA DE: LF3070573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070575-a15-8y' },
        update: { title: `A1.5-8Y`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070575 | REPA DE: LF3070575`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A1.5-8Y`, slug: '3070575-a15-8y', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070575 | REPA DE: LF3070575`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070577-b2-101y' },
        update: { title: `B2-10.1Y`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070577 | REPA DE: LF3070577`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `B2-10.1Y`, slug: '3070577-b2-101y', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070577 | REPA DE: LF3070577`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'semihermetic-compressors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3070579-d2-151y' },
        update: { title: `D2-15.1Y`, description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070579 | REPA DE: LF3070579`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `D2-15.1Y`, slug: '3070579-d2-151y', description: `Series: SEMI-HERMETIC COMPRESSORS DORIN | REPA IT: 3070579 | REPA DE: LF3070579`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058076-uc404ae2425' },
        update: { title: `UC404AE2425`, description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058076 | REPA DE: LF3058076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UC404AE2425`, slug: '3058076-uc404ae2425', description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058076 | REPA DE: LF3058076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058078-uc404caj2440z' },
        update: { title: `UC404CAJ2440Z`, description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058078 | REPA DE: LF3058078`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UC404CAJ2440Z`, slug: '3058078-uc404caj2440z', description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058078 | REPA DE: LF3058078`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058080-uc404-fh2480z' },
        update: { title: `UC404-FH2480Z`, description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058080 | REPA DE: LF3058080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UC404-FH2480Z`, slug: '3058080-uc404-fh2480z', description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058080 | REPA DE: LF3058080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058087-uc404ae4460z' },
        update: { title: `UC404AE4460Z`, description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058087 | REPA DE: LF3058087`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UC404AE4460Z`, slug: '3058087-uc404ae4460z', description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058087 | REPA DE: LF3058087`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058089-uc404taj9510z' },
        update: { title: `UC404TAJ9510Z`, description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058089 | REPA DE: LF3058089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UC404TAJ9510Z`, slug: '3058089-uc404taj9510z', description: `Series: CONDENSING UNITS TECUMSEH BT R452/R404 LBP - THERMOSTATIC VALVE | REPA IT: 3058089 | REPA DE: LF3058089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058083-ucc404-ae4430z' },
        update: { title: `UCC404-AE4430Z`, description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058083 | REPA DE: LF3058083`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCC404-AE4430Z`, slug: '3058083-ucc404-ae4430z', description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058083 | REPA DE: LF3058083`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058085-ucc404-ae4460z' },
        update: { title: `UCC404-AE4460Z`, description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058085 | REPA DE: LF3058085`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCC404-AE4460Z`, slug: '3058085-ucc404-ae4460z', description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058085 | REPA DE: LF3058085`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058073-uc134caj4492' },
        update: { title: `UC134CAJ4492`, description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058073 | REPA DE: LF3058073`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UC134CAJ4492`, slug: '3058073-uc134caj4492', description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058073 | REPA DE: LF3058073`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058069-ucc134ae4440y' },
        update: { title: `UCC134AE4440Y`, description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058069 | REPA DE: LF3058069`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCC134AE4440Y`, slug: '3058069-ucc134ae4440y', description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058069 | REPA DE: LF3058069`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058071-ucc134ae4460y' },
        update: { title: `UCC134AE4460Y`, description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058071 | REPA DE: LF3058071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCC134AE4460Y`, slug: '3058071-ucc134ae4460y', description: `Series: CONDENSING UNITS TECUMSEH TN R452/R404 HMBP - CAPILLARY | REPA IT: 3058071 | REPA DE: LF3058071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123018-ac6160z' },
        update: { title: `AC6160Z`, description: `REPA IT: 3123018 | REPA DE: LF3123018`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AC6160Z`, slug: '3123018-ac6160z', description: `REPA IT: 3123018 | REPA DE: LF3123018`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123054-ac6187z' },
        update: { title: `AC6187Z`, description: `REPA IT: 3123054 | REPA DE: LF3123054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AC6187Z`, slug: '3123054-ac6187z', description: `REPA IT: 3123054 | REPA DE: LF3123054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123144-ac6214z' },
        update: { title: `AC6214Z`, description: `REPA IT: 3123144 | REPA DE: LF3123144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AC6214Z`, slug: '3123144-ac6214z', description: `REPA IT: 3123144 | REPA DE: LF3123144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123056-av6160z' },
        update: { title: `AV6160Z`, description: `REPA IT: 3123056 | REPA DE: LF3123056`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6160Z`, slug: '3123056-av6160z', description: `REPA IT: 3123056 | REPA DE: LF3123056`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123058-av6187z' },
        update: { title: `AV6187Z`, description: `REPA IT: 3123058 | REPA DE: LF3123058`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6187Z`, slug: '3123058-av6187z', description: `REPA IT: 3123058 | REPA DE: LF3123058`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123059-av6214z' },
        update: { title: `AV6214Z`, description: `REPA IT: 3123059 | REPA DE: LF3123059`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6214Z`, slug: '3123059-av6214z', description: `REPA IT: 3123059 | REPA DE: LF3123059`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123030-av6220z' },
        update: { title: `AV6220Z`, description: `REPA IT: 3123030 | REPA DE: LF3123030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6220Z`, slug: '3123030-av6220z', description: `REPA IT: 3123030 | REPA DE: LF3123030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123027-avt6226zx' },
        update: { title: `AVT6226ZX`, description: `REPA IT: 3123027 | REPA DE: LF3123027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AVT6226ZX`, slug: '3123027-avt6226zx', description: `REPA IT: 3123027 | REPA DE: LF3123027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123146-ac6152gk' },
        update: { title: `AC6152GK`, description: `REPA IT: 3123146 | REPA DE: LF3123146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AC6152GK`, slug: '3123146-ac6152gk', description: `REPA IT: 3123146 | REPA DE: LF3123146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123148-ac6181gk' },
        update: { title: `AC6181GK`, description: `REPA IT: 3123148 | REPA DE: LF3123148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AC6181GK`, slug: '3123148-ac6181gk', description: `REPA IT: 3123148 | REPA DE: LF3123148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123016-av6152gk' },
        update: { title: `AV6152GK`, description: `REPA IT: 3123016 | REPA DE: LF3123016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6152GK`, slug: '3123016-av6152gk', description: `REPA IT: 3123016 | REPA DE: LF3123016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123025-av6181gk' },
        update: { title: `AV6181GK`, description: `REPA IT: 3123025 | REPA DE: LF3123025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6181GK`, slug: '3123025-av6181gk', description: `REPA IT: 3123025 | REPA DE: LF3123025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123043-av6215gk' },
        update: { title: `AV6215GK`, description: `REPA IT: 3123043 | REPA DE: LF3123043`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6215GK`, slug: '3123043-av6215gk', description: `REPA IT: 3123043 | REPA DE: LF3123043`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123044-av6222gk' },
        update: { title: `AV6222GK`, description: `REPA IT: 3123044 | REPA DE: LF3123044`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6222GK`, slug: '3123044-av6222gk', description: `REPA IT: 3123044 | REPA DE: LF3123044`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123050-av6226gk' },
        update: { title: `AV6226GK`, description: `REPA IT: 3123050 | REPA DE: LF3123050`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV6226GK`, slug: '3123050-av6226gk', description: `REPA IT: 3123050 | REPA DE: LF3123050`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123045-av9232gk' },
        update: { title: `AV9232GK`, description: `REPA IT: 3123045 | REPA DE: LF3123045`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV9232GK`, slug: '3123045-av9232gk', description: `REPA IT: 3123045 | REPA DE: LF3123045`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123036-avt9232gs2v' },
        update: { title: `AVT9232GS2V`, description: `REPA IT: 3123036 | REPA DE: LF3123036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AVT9232GS2V`, slug: '3123036-avt9232gs2v', description: `REPA IT: 3123036 | REPA DE: LF3123036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123035-av9238gk2v' },
        update: { title: `AV9238GK2V`, description: `REPA IT: 3123035 | REPA DE: LF3123035`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV9238GK2V`, slug: '3123035-av9238gk2v', description: `REPA IT: 3123035 | REPA DE: LF3123035`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123151-ac2155gk' },
        update: { title: `AC2155GK`, description: `REPA IT: 3123151 | REPA DE: LF3123151`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AC2155GK`, slug: '3123151-ac2155gk', description: `REPA IT: 3123151 | REPA DE: LF3123151`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123153-ac2178gk' },
        update: { title: `AC2178GK`, description: `REPA IT: 3123153 | REPA DE: LF3123153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AC2178GK`, slug: '3123153-ac2178gk', description: `REPA IT: 3123153 | REPA DE: LF3123153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123026-av2140gk' },
        update: { title: `AV2140GK`, description: `REPA IT: 3123026 | REPA DE: LF3123026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV2140GK`, slug: '3123026-av2140gk', description: `REPA IT: 3123026 | REPA DE: LF3123026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123048-av2168gk' },
        update: { title: `AV2168GK`, description: `REPA IT: 3123048 | REPA DE: LF3123048`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV2168GK`, slug: '3123048-av2168gk', description: `REPA IT: 3123048 | REPA DE: LF3123048`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058004-av2180gk' },
        update: { title: `AV2180GK`, description: `REPA IT: 3058004 | REPA DE: LF3058004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV2180GK`, slug: '3058004-av2180gk', description: `REPA IT: 3058004 | REPA DE: LF3058004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123040-av2212gk' },
        update: { title: `AV2212GK`, description: `REPA IT: 3123040 | REPA DE: LF3123040`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AV2212GK`, slug: '3123040-av2212gk', description: `REPA IT: 3123040 | REPA DE: LF3123040`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123047-avt2212gs' },
        update: { title: `AVT2212GS`, description: `REPA IT: 3123047 | REPA DE: LF3123047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AVT2212GS`, slug: '3123047-avt2212gs', description: `REPA IT: 3123047 | REPA DE: LF3123047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058041-cunl61mf00c' },
        update: { title: `CUNL6.1MF00C`, description: `REPA IT: 3058041 | REPA DE: LF3058041`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUNL6.1MF00C`, slug: '3058041-cunl61mf00c', description: `REPA IT: 3058041 | REPA DE: LF3058041`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058043-cufr75g000c' },
        update: { title: `CUFR7.5G000C`, description: `REPA IT: 3058043 | REPA DE: LF3058043`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUFR7.5G000C`, slug: '3058043-cufr75g000c', description: `REPA IT: 3058043 | REPA DE: LF3058043`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058047-cufr10g0000c' },
        update: { title: `CUFR10G0000C`, description: `REPA IT: 3058047 | REPA DE: LF3058047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUFR10G0000C`, slug: '3058047-cufr10g0000c', description: `REPA IT: 3058047 | REPA DE: LF3058047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058050-cufr11g0000c' },
        update: { title: `CUFR11G0000C`, description: `REPA IT: 3058050 | REPA DE: LF3058050`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUFR11G0000C`, slug: '3058050-cufr11g0000c', description: `REPA IT: 3058050 | REPA DE: LF3058050`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058052-cusc15mfx00c' },
        update: { title: `CUSC15MFX00C`, description: `REPA IT: 3058052 | REPA DE: LF3058052`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC15MFX00C`, slug: '3058052-cusc15mfx00c', description: `REPA IT: 3058052 | REPA DE: LF3058052`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058054-cusc18mfx00c' },
        update: { title: `CUSC18MFX00C`, description: `REPA IT: 3058054 | REPA DE: LF3058054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC18MFX00C`, slug: '3058054-cusc18mfx00c', description: `REPA IT: 3058054 | REPA DE: LF3058054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058060-cusc18mfx00v' },
        update: { title: `CUSC18MFX00V`, description: `REPA IT: 3058060 | REPA DE: 605295`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC18MFX00V`, slug: '3058060-cusc18mfx00v', description: `REPA IT: 3058060 | REPA DE: 605295`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058062-cugs26mfx00v' },
        update: { title: `CUGS26MFX00V`, description: `REPA IT: 3058062 | REPA DE: LF3058062`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUGS26MFX00V`, slug: '3058062-cugs26mfx00v', description: `REPA IT: 3058062 | REPA DE: LF3058062`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058013-cunl61mlx0c' },
        update: { title: `CUNL6.1MLX0C`, description: `REPA IT: 3058013 | REPA DE: LF3058013`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUNL6.1MLX0C`, slug: '3058013-cunl61mlx0c', description: `REPA IT: 3058013 | REPA DE: LF3058013`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058016-cusc10mlx00c' },
        update: { title: `CUSC10MLX00C`, description: `REPA IT: 3058016 | REPA DE: LF3058016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC10MLX00C`, slug: '3058016-cusc10mlx00c', description: `REPA IT: 3058016 | REPA DE: LF3058016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058018-cusc15mlx00c' },
        update: { title: `CUSC15MLX00C`, description: `REPA IT: 3058018 | REPA DE: LF3058018`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC15MLX00C`, slug: '3058018-cusc15mlx00c', description: `REPA IT: 3058018 | REPA DE: LF3058018`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058021-cusc10mlx00v' },
        update: { title: `CUSC10MLX00V`, description: `REPA IT: 3058021 | REPA DE: 605298`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC10MLX00V`, slug: '3058021-cusc10mlx00v', description: `REPA IT: 3058021 | REPA DE: 605298`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058023-cusc15mlx00v' },
        update: { title: `CUSC15MLX00V`, description: `REPA IT: 3058023 | REPA DE: 605300`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC15MLX00V`, slug: '3058023-cusc15mlx00v', description: `REPA IT: 3058023 | REPA DE: 605300`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058025-cugs21mlx00v' },
        update: { title: `CUGS21MLX00V`, description: `REPA IT: 3058025 | REPA DE: LF3058025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUGS21MLX00V`, slug: '3058025-cugs21mlx00v', description: `REPA IT: 3058025 | REPA DE: LF3058025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058027-cugs34mlx00v' },
        update: { title: `CUGS34MLX00V`, description: `REPA IT: 3058027 | REPA DE: LF3058027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUGS34MLX00V`, slug: '3058027-cugs34mlx00v', description: `REPA IT: 3058027 | REPA DE: LF3058027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058029-cunl7clx000c' },
        update: { title: `CUNL7CLX000C`, description: `REPA IT: 3058029 | REPA DE: LF3058029`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUNL7CLX000C`, slug: '3058029-cunl7clx000c', description: `REPA IT: 3058029 | REPA DE: LF3058029`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058031-cusc12clx2c' },
        update: { title: `CUSC12CLX.2C`, description: `REPA IT: 3058031 | REPA DE: LF3058931`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC12CLX.2C`, slug: '3058031-cusc12clx2c', description: `REPA IT: 3058031 | REPA DE: LF3058931`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058033-cusc18cl000c' },
        update: { title: `CUSC18CL000C`, description: `REPA IT: 3058033 | REPA DE: LF3058033`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC18CL000C`, slug: '3058033-cusc18cl000c', description: `REPA IT: 3058033 | REPA DE: LF3058033`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058035-cusc12clx2v' },
        update: { title: `CUSC12CLX.2V`, description: `REPA IT: 3058035 | REPA DE: 605289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC12CLX.2V`, slug: '3058035-cusc12clx2v', description: `REPA IT: 3058035 | REPA DE: 605289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058037-cusc21cl000v' },
        update: { title: `CUSC21CL000V`, description: `REPA IT: 3058037 | REPA DE: 605291`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUSC21CL000V`, slug: '3058037-cusc21cl000v', description: `REPA IT: 3058037 | REPA DE: 605291`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058039-cugs34clx00v' },
        update: { title: `CUGS34CLX00V`, description: `REPA IT: 3058039 | REPA DE: LF3058039`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CUGS34CLX00V`, slug: '3058039-cugs34clx00v', description: `REPA IT: 3058039 | REPA DE: LF3058039`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058146-cgly12raa3n' },
        update: { title: `CGLY12RAa3N`, description: `Series: CONDENSING UNITS CUBIGEL TN R134 HMBP - CAPILLARY | REPA IT: 3058146 | REPA DE: LF3058146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CGLY12RAa3N`, slug: '3058146-cgly12raa3n', description: `Series: CONDENSING UNITS CUBIGEL TN R134 HMBP - CAPILLARY | REPA IT: 3058146 | REPA DE: LF3058146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058148-cml80tb2n' },
        update: { title: `CML80TB2N`, description: `Series: CONDENSING UNITS CUBIGEL TN R134 HMBP - CAPILLARY | REPA IT: 3058148 | REPA DE: LF3058148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CML80TB2N`, slug: '3058148-cml80tb2n', description: `Series: CONDENSING UNITS CUBIGEL TN R134 HMBP - CAPILLARY | REPA IT: 3058148 | REPA DE: LF3058148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058150-cml90tb3n' },
        update: { title: `CML90TB3N`, description: `Series: CONDENSING UNITS CUBIGEL TN R404/R507 HMBP - THERMOSTATIC VALVE | REPA IT: 3058150 | REPA DE: LF3058150`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CML90TB3N`, slug: '3058150-cml90tb3n', description: `Series: CONDENSING UNITS CUBIGEL TN R404/R507 HMBP - THERMOSTATIC VALVE | REPA IT: 3058150 | REPA DE: LF3058150`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058153-cmpt14la3n' },
        update: { title: `CMPT14LA3N`, description: `Series: CONDENSING UNITS CUBIGEL TN R404/R507 HMBP - THERMOSTATIC VALVE | REPA IT: 3058153 | REPA DE: LF3058153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CMPT14LA3N`, slug: '3058153-cmpt14la3n', description: `Series: CONDENSING UNITS CUBIGEL TN R404/R507 HMBP - THERMOSTATIC VALVE | REPA IT: 3058153 | REPA DE: LF3058153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058122-ucs-hu25a-sa-emt6165u' },
        update: { title: `UCS HU/25A SA EMT6165U`, description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058122 | REPA DE: LF3058122`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCS HU/25A SA EMT6165U`, slug: '3058122-ucs-hu25a-sa-emt6165u', description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058122 | REPA DE: LF3058122`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058124-ucs-hu50a-sa-nek6217u' },
        update: { title: `UCS HU/50A SA NEK6217U`, description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058124 | REPA DE: LF3058124`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCS HU/50A SA NEK6217U`, slug: '3058124-ucs-hu50a-sa-nek6217u', description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058124 | REPA DE: LF3058124`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058127-ucs-u25a-sa-emt2121u' },
        update: { title: `UCS U/25A SA EMT2121U`, description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058127 | REPA DE: LF3058127`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCS U/25A SA EMT2121U`, slug: '3058127-ucs-u25a-sa-emt2121u', description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058127 | REPA DE: LF3058127`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058129-ucs-u50a-sa-nek2134u' },
        update: { title: `UCS U/50A SA NEK2134U`, description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058129 | REPA DE: LF3058129`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCS U/50A SA NEK2134U`, slug: '3058129-ucs-u50a-sa-nek2134u', description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058129 | REPA DE: LF3058129`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058131-ucs-u100a-sa-nt2180u' },
        update: { title: `UCS U/100A SA NT2180U`, description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058131 | REPA DE: LF3058131`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCS U/100A SA NT2180U`, slug: '3058131-ucs-u100a-sa-nt2180u', description: `Series: CONDENSING UNITS TN R290 MHBP - CAPILLARY | REPA IT: 3058131 | REPA DE: LF3058131`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058117-ucg-w-50-a' },
        update: { title: `UCG W 50 A`, description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058117 | REPA DE: LF3058117`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCG W 50 A`, slug: '3058117-ucg-w-50-a', description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058117 | REPA DE: LF3058117`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058119-ucg-w-90-a' },
        update: { title: `UCG W 90 A`, description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058119 | REPA DE: LF3058119`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UCG W 90 A`, slug: '3058119-ucg-w-90-a', description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058119 | REPA DE: LF3058119`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058135-leocar9480muta' },
        update: { title: `LEOCAR9480MUTA`, description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058135 | REPA DE: LF3058135`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LEOCAR9480MUTA`, slug: '3058135-leocar9480muta', description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058135 | REPA DE: LF3058135`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058137-leocar4519muta' },
        update: { title: `LEOCAR4519MUTA`, description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058137 | REPA DE: LF3058137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LEOCAR4519MUTA`, slug: '3058137-leocar4519muta', description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058137 | REPA DE: LF3058137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058140-leocar2464muta' },
        update: { title: `LEOCAR2464MUTA`, description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058140 | REPA DE: LF3058140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LEOCAR2464MUTA`, slug: '3058140-leocar2464muta', description: `Series: WATER CONDENSING UNITS EMBRACO BT R404/R452 LBP - VALVE | REPA IT: 3058140 | REPA DE: LF3058140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058143-leocar4511muta' },
        update: { title: `LEOCAR4511MUTA`, description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058143 | REPA DE: LF3058143`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LEOCAR4511MUTA`, slug: '3058143-leocar4511muta', description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058143 | REPA DE: LF3058143`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058159-mta20-hu1400-n' },
        update: { title: `MTA2.0 HU/1400 N`, description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058159 | REPA DE: LF3058159`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTA2.0 HU/1400 N`, slug: '3058159-mta20-hu1400-n', description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058159 | REPA DE: LF3058159`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058161-mta20-mu1400-g' },
        update: { title: `MTA2.0 MU/1400 G`, description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058161 | REPA DE: LF3058161`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTA2.0 MU/1400 G`, slug: '3058161-mta20-mu1400-g', description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058161 | REPA DE: LF3058161`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058163-mta20-u1400-g' },
        update: { title: `MTA2.0 U/1400 G`, description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058163 | REPA DE: LF3058163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MTA2.0 U/1400 G`, slug: '3058163-mta20-u1400-g', description: `Series: SILENCED CONDENSING UNITS TECUMSEH TN R134 HBP - VALVE | REPA IT: 3058163 | REPA DE: LF3058163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155852-umz-u04a1-plug-in' },
        update: { title: `UMZ U/04A1 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155852 | REPA DE: LF5155852`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ U/04A1 PLUG-IN`, slug: '5155852-umz-u04a1-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155852 | REPA DE: LF5155852`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155866-umz-g05a1-plug-in' },
        update: { title: `UMZ G/05A1 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155866 | REPA DE: LF5155866`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ G/05A1 PLUG-IN`, slug: '5155866-umz-g05a1-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155866 | REPA DE: LF5155866`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155868-umz-g11u2-plug-in' },
        update: { title: `UMZ G/11U2 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155868 | REPA DE: LF5155868`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ G/11U2 PLUG-IN`, slug: '5155868-umz-g11u2-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155868 | REPA DE: LF5155868`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155870-t-umz-g17u3-plug-in' },
        update: { title: `T UMZ G/17U3 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155870 | REPA DE: LF5155870`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `T UMZ G/17U3 PLUG-IN`, slug: '5155870-t-umz-g17u3-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155870 | REPA DE: LF5155870`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155854-umz-u13a3-plug-in' },
        update: { title: `UMZ U/13A3 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155854 | REPA DE: LF5155854`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ U/13A3 PLUG-IN`, slug: '5155854-umz-u13a3-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155854 | REPA DE: LF5155854`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155845-umz-hu05s1-plug-in' },
        update: { title: `UMZ HU/05S1 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155845 | REPA DE: LF5155845`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ HU/05S1 PLUG-IN`, slug: '5155845-umz-hu05s1-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155845 | REPA DE: LF5155845`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155857-umz-h-g05a1-plug-in' },
        update: { title: `UMZ H G/05A1 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155857 | REPA DE: LF5155857`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ H G/05A1 PLUG-IN`, slug: '5155857-umz-h-g05a1-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155857 | REPA DE: LF5155857`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155859-umz-h-g08a1-plug-in' },
        update: { title: `UMZ H G/08A1 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155859 | REPA DE: LF5155859`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ H G/08A1 PLUG-IN`, slug: '5155859-umz-h-g08a1-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155859 | REPA DE: LF5155859`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155862-umz-h-g16a2-plug-in' },
        update: { title: `UMZ H G/16A2 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155862 | REPA DE: LF5155862`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ H G/16A2 PLUG-IN`, slug: '5155862-umz-h-g16a2-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155862 | REPA DE: LF5155862`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155864-t-umz-h-g23u3-plug' },
        update: { title: `T UMZ H G/23U3 PLUG-`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155864 | REPA DE: LF5155864`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `T UMZ H G/23U3 PLUG-`, slug: '5155864-t-umz-h-g23u3-plug', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155864 | REPA DE: LF5155864`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5155847-umz-hu12s2-plug-in' },
        update: { title: `UMZ HU/12S2 PLUG-IN`, description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155847 | REPA DE: LF5155847`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `UMZ HU/12S2 PLUG-IN`, slug: '5155847-umz-hu12s2-plug-in', description: `Series: WALL-MOUNTED MONOBLOCK MTH BT - CAPILLARY | REPA IT: 5155847 | REPA DE: LF5155847`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058007-sta-e-phv' },
        update: { title: `STA E-PHV`, description: `Series: COOLING UNITS TECO | REPA IT: 3058007 | REPA DE: LF3058007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STA E-PHV`, slug: '3058007-sta-e-phv', description: `Series: COOLING UNITS TECO | REPA IT: 3058007 | REPA DE: LF3058007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058009-sta-e-nhv' },
        update: { title: `STA E-NHV`, description: `Series: COOLING UNITS TECO | REPA IT: 3058009 | REPA DE: LF3058009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STA E-NHV`, slug: '3058009-sta-e-nhv', description: `Series: COOLING UNITS TECO | REPA IT: 3058009 | REPA DE: LF3058009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3058011-stb-e-plv-lh' },
        update: { title: `STB E-PLV Lh`, description: `Series: COOLING UNITS TECO | REPA IT: 3058011 | REPA DE: LF3058011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STB E-PLV Lh`, slug: '3058011-stb-e-plv-lh', description: `Series: COOLING UNITS TECO | REPA IT: 3058011 | REPA DE: LF3058011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5231833-stb-e-ph-high-eff-lh' },
        update: { title: `STB E-PH - High Eff. Lh`, description: `Series: COOLING UNITS TECO | REPA IT: 5231833 | REPA DE: LF5231833`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STB E-PH - High Eff. Lh`, slug: '5231833-stb-e-ph-high-eff-lh', description: `Series: COOLING UNITS TECO | REPA IT: 5231833 | REPA DE: LF5231833`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5233859-stb-e-phv-rh' },
        update: { title: `STB E-PHV Rh`, description: `Series: COOLING UNITS TECO | REPA IT: 5233859 | REPA DE: LF5233859`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STB E-PHV Rh`, slug: '5233859-stb-e-phv-rh', description: `Series: COOLING UNITS TECO | REPA IT: 5233859 | REPA DE: LF5233859`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5232113-stb-e-pl-lh' },
        update: { title: `STB E-PL Lh`, description: `Series: COOLING UNITS TECO | REPA IT: 5232113 | REPA DE: LF5232113`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STB E-PL Lh`, slug: '5232113-stb-e-pl-lh', description: `Series: COOLING UNITS TECO | REPA IT: 5232113 | REPA DE: LF5232113`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-units' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3185134' },
        update: { title: `3185134`, description: `Series: COOLING UNITS TECO | REPA IT: 3185134 | REPA DE: LF3185134`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3185134`, slug: '3185134', description: `Series: COOLING UNITS TECO | REPA IT: 3185134 | REPA DE: LF3185134`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'evaporators-luve-shs' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123201-evaporator-luve-shs13' },
        update: { title: `EVAPORATOR LUVE SHS13`, description: `Series: EVAPORATORS LUVE SHS | REPA IT: 3123201 | REPA DE: LF3123201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVAPORATOR LUVE SHS13`, slug: '3123201-evaporator-luve-shs13', description: `Series: EVAPORATORS LUVE SHS | REPA IT: 3123201 | REPA DE: LF3123201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'evaporators-luve-shs' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123203-evaporator-luve-shs26' },
        update: { title: `EVAPORATOR LUVE SHS26`, description: `Series: EVAPORATORS LUVE SHS | REPA IT: 3123203 | REPA DE: LF3123203`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVAPORATOR LUVE SHS26`, slug: '3123203-evaporator-luve-shs26', description: `Series: EVAPORATORS LUVE SHS | REPA IT: 3123203 | REPA DE: LF3123203`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'evaporators-for-counter' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123020-evc2n' },
        update: { title: `EVC2N`, description: `Series: VENTILATED EVAPORATORS FOR COUNTER | REPA IT: 3123020 | REPA DE: 750779`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVC2N`, slug: '3123020-evc2n', description: `Series: VENTILATED EVAPORATORS FOR COUNTER | REPA IT: 3123020 | REPA DE: 750779`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'evaporators-for-counter' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123022-evc4n' },
        update: { title: `EVC4N`, description: `Series: VENTILATED EVAPORATORS FOR COUNTER | REPA IT: 3123022 | REPA DE: LF3123022`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVC4N`, slug: '3123022-evc4n', description: `Series: VENTILATED EVAPORATORS FOR COUNTER | REPA IT: 3123022 | REPA DE: LF3123022`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'evaporators-for-counter' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123024-evp2n' },
        update: { title: `EVP2N`, description: `Series: VENTILATED EVAPORATORS FOR COUNTER | REPA IT: 3123024 | REPA DE: 750780`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVP2N`, slug: '3123024-evp2n', description: `Series: VENTILATED EVAPORATORS FOR COUNTER | REPA IT: 3123024 | REPA DE: 750780`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455467' },
        update: { title: `3455467`, description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 3455467 | REPA DE: 417571`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3455467`, slug: '3455467', description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 3455467 | REPA DE: 417571`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455470' },
        update: { title: `3455470`, description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 3455470 | REPA DE: 696600`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3455470`, slug: '3455470', description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 3455470 | REPA DE: 696600`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355689' },
        update: { title: `3355689`, description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 3355689 | REPA DE: 418855`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355689`, slug: '3355689', description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 3355689 | REPA DE: 418855`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5039574' },
        update: { title: `5039574`, description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 5039574 | REPA DE: 419331`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5039574`, slug: '5039574', description: `Series: CARTRIDGE HEATING ELEMENTS PTC UNIVERSAL | REPA IT: 5039574 | REPA DE: 419331`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355974' },
        update: { title: `3355974`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355974 | REPA DE: LF3355974`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355974`, slug: '3355974', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355974 | REPA DE: LF3355974`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355969' },
        update: { title: `3355969`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355969 | REPA DE: LF3355969`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355969`, slug: '3355969', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355969 | REPA DE: LF3355969`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355970' },
        update: { title: `3355970`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355970 | REPA DE: 416747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355970`, slug: '3355970', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355970 | REPA DE: 416747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355956' },
        update: { title: `3355956`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355956 | REPA DE: 418591`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355956`, slug: '3355956', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355956 | REPA DE: 418591`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355690' },
        update: { title: `3355690`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355690 | REPA DE: LF3355690`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355690`, slug: '3355690', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355690 | REPA DE: LF3355690`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355698' },
        update: { title: `3355698`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355698 | REPA DE: 420372`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355698`, slug: '3355698', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355698 | REPA DE: 420372`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355700' },
        update: { title: `3355700`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355700 | REPA DE: 420373`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355700`, slug: '3355700', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355700 | REPA DE: 420373`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355706' },
        update: { title: `3355706`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355706 | REPA DE: 420374`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355706`, slug: '3355706', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355706 | REPA DE: 420374`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355932' },
        update: { title: `3355932`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355932 | REPA DE: 416311`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355932`, slug: '3355932', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355932 | REPA DE: 416311`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355730' },
        update: { title: `3355730`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355730 | REPA DE: 417805`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355730`, slug: '3355730', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355730 | REPA DE: 417805`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355735' },
        update: { title: `3355735`, description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355735 | REPA DE: LF3355735`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355735`, slug: '3355735', description: `Series: HEATING ELEMENTS WITH METAL MESH | REPA IT: 3355735 | REPA DE: LF3355735`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355967' },
        update: { title: `3355967`, description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355967 | REPA DE: 419345`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355967`, slug: '3355967', description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355967 | REPA DE: 419345`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355941' },
        update: { title: `3355941`, description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355941 | REPA DE: 417518`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355941`, slug: '3355941', description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355941 | REPA DE: 417518`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355942' },
        update: { title: `3355942`, description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355942 | REPA DE: 417519`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355942`, slug: '3355942', description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355942 | REPA DE: 417519`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355944' },
        update: { title: `3355944`, description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355944 | REPA DE: 417521`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355944`, slug: '3355944', description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355944 | REPA DE: 417521`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3355946' },
        update: { title: `3355946`, description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355946 | REPA DE: 417523`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3355946`, slug: '3355946', description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3355946 | REPA DE: 417523`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455431-rce-061' },
        update: { title: `RCE 061`, description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3455431 | REPA DE: LF3455431`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RCE 061`, slug: '3455431-rce-061', description: `Series: HEATING ELEMENTS IN SILICONE FOR CONDENSATE DRAIN | REPA IT: 3455431 | REPA DE: LF3455431`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455433-rsv-060' },
        update: { title: `RSV-060`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455433 | REPA DE: LF3455433`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-060`, slug: '3455433-rsv-060', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455433 | REPA DE: LF3455433`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455435-rsv-125' },
        update: { title: `RSV-125`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455435 | REPA DE: LF3455435`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-125`, slug: '3455435-rsv-125', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455435 | REPA DE: LF3455435`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455437-rsv-175' },
        update: { title: `RSV-175`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455437 | REPA DE: LF3455437`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-175`, slug: '3455437-rsv-175', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455437 | REPA DE: LF3455437`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455439-rsv-225' },
        update: { title: `RSV-225`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455439 | REPA DE: LF3455439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-225`, slug: '3455439-rsv-225', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455439 | REPA DE: LF3455439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455441-rsv-275' },
        update: { title: `RSV-275`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455441 | REPA DE: LF3455441`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-275`, slug: '3455441-rsv-275', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455441 | REPA DE: LF3455441`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455443-rsv-325' },
        update: { title: `RSV-325`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455443 | REPA DE: LF3455443`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-325`, slug: '3455443-rsv-325', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455443 | REPA DE: LF3455443`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455455-rsv-375' },
        update: { title: `RSV-375`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455455 | REPA DE: LF3455455`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-375`, slug: '3455455-rsv-375', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455455 | REPA DE: LF3455455`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455446-rsv-450' },
        update: { title: `RSV-450`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455446 | REPA DE: LF3455446`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-450`, slug: '3455446-rsv-450', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455446 | REPA DE: LF3455446`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'heating-elements' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3455450-rsv-650' },
        update: { title: `RSV-650`, description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455450 | REPA DE: LF3455450`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RSV-650`, slug: '3455450-rsv-650', description: `Series: HEATING ELEMENTS SHEATHED, TUBOLAR, FLEXIBLE | REPA IT: 3455450 | REPA DE: LF3455450`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'drip-trays' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3015080' },
        update: { title: `3015080`, description: `Series: CONDENSATE EVAPORATION TRAYS UNIVERSAL | REPA IT: 3015080 | REPA DE: LF3015080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3015080`, slug: '3015080', description: `Series: CONDENSATE EVAPORATION TRAYS UNIVERSAL | REPA IT: 3015080 | REPA DE: LF3015080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'drip-trays' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3016007-bde30' },
        update: { title: `BDE/30`, description: `Series: CONDENSATE EVAPORATION TRAYS UNIVERSAL | REPA IT: 3016007 | REPA DE: 750002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `BDE/30`, slug: '3016007-bde30', description: `Series: CONDENSATE EVAPORATION TRAYS UNIVERSAL | REPA IT: 3016007 | REPA DE: 750002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123060-chs2' },
        update: { title: `CHS2`, description: `REPA IT: 3123060 | REPA DE: LF3123060`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CHS2`, slug: '3123060-chs2', description: `REPA IT: 3123060 | REPA DE: LF3123060`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123063-chs4' },
        update: { title: `CHS4`, description: `REPA IT: 3123063 | REPA DE: LF3123063`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CHS4`, slug: '3123063-chs4', description: `REPA IT: 3123063 | REPA DE: LF3123063`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123093-stft-12118' },
        update: { title: `STFT 12118`, description: `REPA IT: 3123093 | REPA DE: LF3123093`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STFT 12118`, slug: '3123093-stft-12118', description: `REPA IT: 3123093 | REPA DE: LF3123093`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123092-stft-14121' },
        update: { title: `STFT 14121`, description: `REPA IT: 3123092 | REPA DE: LF3123092`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STFT 14121`, slug: '3123092-stft-14121', description: `REPA IT: 3123092 | REPA DE: LF3123092`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123125-stft-16124' },
        update: { title: `STFT 16124`, description: `REPA IT: 3123125 | REPA DE: LF3123125`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STFT 16124`, slug: '3123125-stft-16124', description: `REPA IT: 3123125 | REPA DE: LF3123125`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3068901-stn-8324' },
        update: { title: `STN 8324`, description: `REPA IT: 3068901 | REPA DE: 750249`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STN 8324`, slug: '3068901-stn-8324', description: `REPA IT: 3068901 | REPA DE: 750249`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123095-cf21' },
        update: { title: `CF21`, description: `REPA IT: 3123095 | REPA DE: LF3123095`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CF21`, slug: '3123095-cf21', description: `REPA IT: 3123095 | REPA DE: LF3123095`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-counterflow-water-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123097-cf27' },
        update: { title: `CF27`, description: `REPA IT: 3123097 | REPA DE: LF123097`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CF27`, slug: '3123097-cf27', description: `REPA IT: 3123097 | REPA DE: LF123097`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-air-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123064-ccv10244' },
        update: { title: `CCV1024/4`, description: `REPA IT: 3123064 | REPA DE: LF3123064`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CCV1024/4`, slug: '3123064-ccv10244', description: `REPA IT: 3123064 | REPA DE: LF3123064`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-air-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123009-ccv14384' },
        update: { title: `CCV1438/4`, description: `REPA IT: 3123009 | REPA DE: LF3123009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CCV1438/4`, slug: '3123009-ccv14384', description: `REPA IT: 3123009 | REPA DE: LF3123009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-air-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123011-ccv12583' },
        update: { title: `CCV1258/3`, description: `REPA IT: 3123011 | REPA DE: LF3123011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CCV1258/3`, slug: '3123011-ccv12583', description: `REPA IT: 3123011 | REPA DE: LF3123011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'condensers-air-cooled-condensers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3123014-ccv14704' },
        update: { title: `CCV1470/4`, description: `REPA IT: 3123014 | REPA DE: LF3123014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CCV1470/4`, slug: '3123014-ccv14704', description: `REPA IT: 3123014 | REPA DE: LF3123014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540038-ad0612hb-a71gl' },
        update: { title: `AD0612HB-A71GL`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540038 | REPA DE: 601154`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AD0612HB-A71GL`, slug: '3540038-ad0612hb-a71gl', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540038 | REPA DE: 601154`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540028-mf60252v1-a99-a' },
        update: { title: `MF60252V1-A99-A`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540028 | REPA DE: 601679`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MF60252V1-A99-A`, slug: '3540028-mf60252v1-a99-a', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540028 | REPA DE: 601679`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540040-ad08012hb-257104' },
        update: { title: `AD08012HB-257104`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540040 | REPA DE: 601670`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AD08012HB-257104`, slug: '3540040-ad08012hb-257104', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540040 | REPA DE: 601670`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540041-ad08024hb-257104' },
        update: { title: `AD08024HB-257104`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540041 | REPA DE: 601439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AD08024HB-257104`, slug: '3540041-ad08024hb-257104', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540041 | REPA DE: 601439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240502-sf23080at-2082hblgn' },
        update: { title: `SF23080AT-2082HBL.GN`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3240502 | REPA DE: LF3240502`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SF23080AT-2082HBL.GN`, slug: '3240502-sf23080at-2082hblgn', description: `Series: AXIAL FANS COMPACT | REPA IT: 3240502 | REPA DE: LF3240502`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540003-ma2082-hvlgn' },
        update: { title: `MA2082-HVL.GN`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540003 | REPA DE: 602244`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MA2082-HVL.GN`, slug: '3540003-ma2082-hvlgn', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540003 | REPA DE: 602244`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240337-sf23080a-2083hblgn' },
        update: { title: `SF23080A-2083HBL.GN`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3240337 | REPA DE: LF3240337`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SF23080A-2083HBL.GN`, slug: '3240337-sf23080a-2083hblgn', description: `Series: AXIAL FANS COMPACT | REPA IT: 3240337 | REPA DE: LF3240337`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540044-ad0912hb-a71gl' },
        update: { title: `AD0912HB-A71GL`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540044 | REPA DE: 601747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AD0912HB-A71GL`, slug: '3540044-ad0912hb-a71gl', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540044 | REPA DE: 601747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540046-aa9252hb-at' },
        update: { title: `AA9252HB-AT`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540046 | REPA DE: 601055`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AA9252HB-AT`, slug: '3540046-aa9252hb-at', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540046 | REPA DE: 601055`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1540001-pmd2409pmb1-a2gn' },
        update: { title: `PMD2409PMB1-A(2).GN`, description: `Series: AXIAL FANS COMPACT | REPA IT: 1540001 | REPA DE: LF1540001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PMD2409PMB1-A(2).GN`, slug: '1540001-pmd2409pmb1-a2gn', description: `Series: AXIAL FANS COMPACT | REPA IT: 1540001 | REPA DE: LF1540001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540048-ad1224hb-a71gl' },
        update: { title: `AD1224HB-A71GL`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540048 | REPA DE: 601159`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AD1224HB-A71GL`, slug: '3540048-ad1224hb-a71gl', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540048 | REPA DE: 601159`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540049-aa1252mb-at' },
        update: { title: `AA1252MB-AT`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540049 | REPA DE: 601131`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AA1252MB-AT`, slug: '3540049-aa1252mb-at', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540049 | REPA DE: 601131`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340133-pmd1212pmb2-a' },
        update: { title: `PMD1212PMB2-A`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3340133 | REPA DE: LF3340133`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PMD1212PMB2-A`, slug: '3340133-pmd1212pmb2-a', description: `Series: AXIAL FANS COMPACT | REPA IT: 3340133 | REPA DE: LF3340133`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '4088034-aa1282hs-aw' },
        update: { title: `AA1282HS-AW`, description: `Series: AXIAL FANS COMPACT | REPA IT: 4088034 | REPA DE: 601604`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AA1282HS-AW`, slug: '4088034-aa1282hs-aw', description: `Series: AXIAL FANS COMPACT | REPA IT: 4088034 | REPA DE: 601604`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540073-a12b23hwbwf0' },
        update: { title: `A12B23HWBWF0`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540073 | REPA DE: 602323`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A12B23HWBWF0`, slug: '3540073-a12b23hwbwf0', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540073 | REPA DE: 602323`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540052-ad1312ub-f51' },
        update: { title: `AD1312UB-F51`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3540052 | REPA DE: 601457`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AD1312UB-F51`, slug: '3540052-ad1312ub-f51', description: `Series: AXIAL FANS COMPACT | REPA IT: 3540052 | REPA DE: 601457`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240504-c17b23htbf00' },
        update: { title: `C17B23HTBF00`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3240504 | REPA DE: 602271`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `C17B23HTBF00`, slug: '3240504-c17b23htbf00', description: `Series: AXIAL FANS COMPACT | REPA IT: 3240504 | REPA DE: 602271`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340157-a2175-hbt-tcgn' },
        update: { title: `A2175-HBT-TC.GN`, description: `Series: AXIAL FANS COMPACT | REPA IT: 3340157 | REPA DE: 602263`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A2175-HBT-TC.GN`, slug: '3340157-a2175-hbt-tcgn', description: `Series: AXIAL FANS COMPACT | REPA IT: 3340157 | REPA DE: 602263`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540002' },
        update: { title: `3540002`, description: `Series: ACCESSORIES FOR COMPACT AXIAL FANS | REPA IT: 3540002 | REPA DE: LF3540002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3540002`, slug: '3540002', description: `Series: ACCESSORIES FOR COMPACT AXIAL FANS | REPA IT: 3540002 | REPA DE: LF3540002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3805036' },
        update: { title: `3805036`, description: `Series: ACCESSORIES FOR COMPACT AXIAL FANS | REPA IT: 3805036 | REPA DE: LF3805036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3805036`, slug: '3805036', description: `Series: ACCESSORIES FOR COMPACT AXIAL FANS | REPA IT: 3805036 | REPA DE: LF3805036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2101758' },
        update: { title: `2101758`, description: `Series: ACCESSORIES FOR COMPACT AXIAL FANS | REPA IT: 2101758 | REPA DE: LF2101758`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `2101758`, slug: '2101758', description: `Series: ACCESSORIES FOR COMPACT AXIAL FANS | REPA IT: 2101758 | REPA DE: LF2101758`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1240053-8412n' },
        update: { title: `8412N`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 1240053 | REPA DE: LF1240053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `8412N`, slug: '1240053-8412n', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 1240053 | REPA DE: LF1240053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540034-8550n' },
        update: { title: `8550N`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540034 | REPA DE: 601908`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `8550N`, slug: '3540034-8550n', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540034 | REPA DE: 601908`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240515-8556n' },
        update: { title: `8556N`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240515 | REPA DE: 601038`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `8556N`, slug: '3240515-8556n', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240515 | REPA DE: 601038`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240518-3414n' },
        update: { title: `3414N`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240518 | REPA DE: 601074`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3414N`, slug: '3240518-3414n', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240518 | REPA DE: 601074`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240613-3656' },
        update: { title: `3656`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240613 | REPA DE: 601633`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3656`, slug: '3240613-3656', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240613 | REPA DE: 601633`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540023-4412f' },
        update: { title: `4412F`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540023 | REPA DE: 602245`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4412F`, slug: '3540023-4412f', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540023 | REPA DE: 602245`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '7108502-4314l' },
        update: { title: `4314L`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 7108502 | REPA DE: LF7108502`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4314L`, slug: '7108502-4314l', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 7108502 | REPA DE: LF7108502`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540036-4114nhh' },
        update: { title: `4114NHH`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540036 | REPA DE: 601656`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4114NHH`, slug: '3540036-4114nhh', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540036 | REPA DE: 601656`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540095-vwcf119dsgjs' },
        update: { title: `VWCF119DSGJS`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540095 | REPA DE: LF3540008`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VWCF119DSGJS`, slug: '3540095-vwcf119dsgjs', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540095 | REPA DE: LF3540008`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1240390-4650n' },
        update: { title: `4650N`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 1240390 | REPA DE: 601089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4650N`, slug: '1240390-4650n', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 1240390 | REPA DE: 601089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102517-4656nu' },
        update: { title: `4656NU`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 2102517 | REPA DE: LF2102517`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4656NU`, slug: '2102517-4656nu', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 2102517 | REPA DE: LF2102517`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540032-4656zw' },
        update: { title: `4656ZW`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540032 | REPA DE: LF3540032`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4656ZW`, slug: '3540032-4656zw', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540032 | REPA DE: LF3540032`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5063246-4656zwu' },
        update: { title: `4656ZWU`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 5063246 | REPA DE: 602211`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4656ZWU`, slug: '5063246-4656zwu', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 5063246 | REPA DE: 602211`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540071-aci-4420-hh' },
        update: { title: `ACi 4420 HH`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540071 | REPA DE: LF3540071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ACi 4420 HH`, slug: '3540071-aci-4420-hh', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540071 | REPA DE: LF3540071`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540033-5656s' },
        update: { title: `5656S`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540033 | REPA DE: 601793`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5656S`, slug: '3540033-5656s', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3540033 | REPA DE: 601793`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240520-7855es-w2s130-aa03-01' },
        update: { title: `7855ES W2S130-AA03-01`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240520 | REPA DE: 601088`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `7855ES W2S130-AA03-01`, slug: '3240520-7855es-w2s130-aa03-01', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3240520 | REPA DE: 601088`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340130-6058es-w2e143-aa09-01' },
        update: { title: `6058ES W2E143-AA09-01`, description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3340130 | REPA DE: 601755`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6058ES W2E143-AA09-01`, slug: '3340130-6058es-w2e143-aa09-01', description: `Series: AXIAL FANS COMPACT EBM-PAPST | REPA IT: 3340130 | REPA DE: 601755`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240686-ebm-4656-tz' },
        update: { title: `EBM 4656 TZ`, description: `REPA IT: 3240686 | REPA DE: LF3240686`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EBM 4656 TZ`, slug: '3240686-ebm-4656-tz', description: `REPA IT: 3240686 | REPA DE: LF3240686`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5065202-a4s250-ah02-01' },
        update: { title: `A4S250-AH02-01`, description: `REPA IT: 5065202 | REPA DE: LF5065202`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4S250-AH02-01`, slug: '5065202-a4s250-ah02-01', description: `REPA IT: 5065202 | REPA DE: LF5065202`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540054-a4e300-as72-19' },
        update: { title: `A4E300-AS72-19`, description: `REPA IT: 3540054 | REPA DE: 602152`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4E300-AS72-19`, slug: '3540054-a4e300-as72-19', description: `REPA IT: 3540054 | REPA DE: 602152`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240488-a4e315-ac08-18' },
        update: { title: `A4E315-AC08-18`, description: `REPA IT: 3240488 | REPA DE: 601622`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4E315-AC08-18`, slug: '3240488-a4e315-ac08-18', description: `REPA IT: 3240488 | REPA DE: 601622`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102390-a4e315-as20-01' },
        update: { title: `A4E315 AS20-01`, description: `REPA IT: 2102390 | REPA DE: LF2102390`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4E315 AS20-01`, slug: '2102390-a4e315-as20-01', description: `REPA IT: 2102390 | REPA DE: LF2102390`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5073754-a6e330-aa02-10' },
        update: { title: `A6E330-AA02-10`, description: `REPA IT: 5073754 | REPA DE: LF5073754`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A6E330-AA02-10`, slug: '5073754-a6e330-aa02-10', description: `REPA IT: 5073754 | REPA DE: LF5073754`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102318-a4e330-ab16-19' },
        update: { title: `A4E330 AB16-19`, description: `REPA IT: 2102318 | REPA DE: LF2102318`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4E330 AB16-19`, slug: '2102318-a4e330-ab16-19', description: `REPA IT: 2102318 | REPA DE: LF2102318`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540011-a4e350-an02-01' },
        update: { title: `A4E350-AN02-01`, description: `REPA IT: 3540011 | REPA DE: LF3540011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4E350-AN02-01`, slug: '3540011-a4e350-an02-01', description: `REPA IT: 3540011 | REPA DE: LF3540011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2101975-a4e400-ap02-02' },
        update: { title: `A4E400-AP02-02`, description: `REPA IT: 2101975 | REPA DE: LF2101975`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4E400-AP02-02`, slug: '2101975-a4e400-ap02-02', description: `REPA IT: 2101975 | REPA DE: LF2101975`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340147-a4d400-ap12-01' },
        update: { title: `A4D400-AP12-01`, description: `REPA IT: 3340147 | REPA DE: LF3340147`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4D400-AP12-01`, slug: '3340147-a4d400-ap12-01', description: `REPA IT: 3340147 | REPA DE: LF3340147`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340148-a4d450-ap01-01' },
        update: { title: `A4D450-AP01-01`, description: `REPA IT: 3340148 | REPA DE: LF3340148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A4D450-AP01-01`, slug: '3340148-a4d450-ap01-01', description: `REPA IT: 3340148 | REPA DE: LF3340148`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235535-a3g350an0103' },
        update: { title: `A3G350AN0103`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235535 | REPA DE: 776328`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A3G350AN0103`, slug: '5235535-a3g350an0103', description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235535 | REPA DE: 776328`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235537-a3g450bl03h3' },
        update: { title: `A3G450BL03H3`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235537 | REPA DE: 776330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A3G450BL03H3`, slug: '5235537-a3g450bl03h3', description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235537 | REPA DE: 776330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235540-a3g500bm06h1' },
        update: { title: `A3G500BM06H1`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235540 | REPA DE: 776332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A3G500BM06H1`, slug: '5235540-a3g500bm06h1', description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235540 | REPA DE: 776332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235542-a3g560bh9901' },
        update: { title: `A3G560BH9901`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235542 | REPA DE: 776334`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A3G560BH9901`, slug: '5235542-a3g560bh9901', description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235542 | REPA DE: 776334`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235545-a3g630bg9701' },
        update: { title: `A3G630BG9701`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235545 | REPA DE: 776336`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A3G630BG9701`, slug: '5235545-a3g630bg9701', description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235545 | REPA DE: 776336`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235547-a3g800as2609' },
        update: { title: `A3G800AS2609`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235547 | REPA DE: 776338`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A3G800AS2609`, slug: '5235547-a3g800as2609', description: `Series: ELECTRONIC FANS EBM | REPA IT: 5235547 | REPA DE: 776338`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240558' },
        update: { title: `3240558`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240558 | REPA DE: LF3240558`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240558`, slug: '3240558', description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240558 | REPA DE: LF3240558`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240560' },
        update: { title: `3240560`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240560 | REPA DE: 601949`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240560`, slug: '3240560', description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240560 | REPA DE: 601949`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240561' },
        update: { title: `3240561`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240561 | REPA DE: LF3240561`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240561`, slug: '3240561', description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240561 | REPA DE: LF3240561`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240562' },
        update: { title: `3240562`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240562 | REPA DE: 601956`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240562`, slug: '3240562', description: `Series: ELECTRONIC FANS EBM | REPA IT: 3240562 | REPA DE: 601956`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340145' },
        update: { title: `3340145`, description: `Series: ELECTRONIC FANS EBM | REPA IT: 3340145 | REPA DE: 601953`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3340145`, slug: '3340145', description: `Series: ELECTRONIC FANS EBM | REPA IT: 3340145 | REPA DE: 601953`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540088-fb035-4ekwdv5' },
        update: { title: `FB035-4EK.WD.V5`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540088 | REPA DE: LF3540088`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FB035-4EK.WD.V5`, slug: '3540088-fb035-4ekwdv5', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540088 | REPA DE: LF3540088`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540089-fn040-vdk0fv7p1' },
        update: { title: `FN040-VDK.0F.V7P1`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540089 | REPA DE: LF3540089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FN040-VDK.0F.V7P1`, slug: '3540089-fn040-vdk0fv7p1', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540089 | REPA DE: LF3540089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240587-fb045-vdk4cv4p' },
        update: { title: `FB045-VDK.4C.V4P`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240587 | REPA DE: 601974`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FB045-VDK.4C.V4P`, slug: '3240587-fb045-vdk4cv4p', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240587 | REPA DE: 601974`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240616-fb050-vdk4iv4p' },
        update: { title: `FB050-VDK.4I.V4P`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240616 | REPA DE: 601976`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FB050-VDK.4I.V4P`, slug: '3240616-fb050-vdk4iv4p', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240616 | REPA DE: 601976`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540030-fn050-6ek4fv7p3' },
        update: { title: `FN050-6EK.4F.V7P3`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540030 | REPA DE: LF3540030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FN050-6EK.4F.V7P3`, slug: '3540030-fn050-6ek4fv7p3', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540030 | REPA DE: LF3540030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540090-fn050-vds4iv7p1' },
        update: { title: `FN050-VDS.4I.V7P1`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540090 | REPA DE: LF3540090`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FN050-VDS.4I.V7P1`, slug: '3540090-fn050-vds4iv7p1', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540090 | REPA DE: LF3540090`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540015-fb063-sdk4iv4p' },
        update: { title: `FB063-SDK.4I.V4P`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540015 | REPA DE: LF3540015`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FB063-SDK.4I.V4P`, slug: '3540015-fb063-sdk4iv4p', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540015 | REPA DE: LF3540015`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540092-fn063-vdk6nv7p7' },
        update: { title: `FN063-VDK.6N.V7P7`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540092 | REPA DE: LF3540092`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FN063-VDK.6N.V7P7`, slug: '3540092-fn063-vdk6nv7p7', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540092 | REPA DE: LF3540092`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240654-ywf4e-300s' },
        update: { title: `YWF4E-300S`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240654 | REPA DE: 601880`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YWF4E-300S`, slug: '3240654-ywf4e-300s', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240654 | REPA DE: 601880`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240655-ywf4e-315s' },
        update: { title: `YWF4E-315S`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240655 | REPA DE: 601881`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YWF4E-315S`, slug: '3240655-ywf4e-315s', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240655 | REPA DE: 601881`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240657-ywf4e-350s' },
        update: { title: `YWF4E-350S`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240657 | REPA DE: 601883`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YWF4E-350S`, slug: '3240657-ywf4e-350s', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3240657 | REPA DE: 601883`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540084-ywf4d-400s' },
        update: { title: `YWF4D-400S`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540084 | REPA DE: LF3540084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YWF4D-400S`, slug: '3540084-ywf4d-400s', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540084 | REPA DE: LF3540084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5181720-ywf6d-450s' },
        update: { title: `YWF6D-450S`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 5181720 | REPA DE: LF5181720`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YWF6D-450S`, slug: '5181720-ywf6d-450s', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 5181720 | REPA DE: LF5181720`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'axial-motor-fans' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3540086-ywf6d-500s' },
        update: { title: `YWF6D-500S`, description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540086 | REPA DE: 720169`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YWF6D-500S`, slug: '3540086-ywf6d-500s', description: `Series: AXIAL FANS ZIEHL-ABEGG | REPA IT: 3540086 | REPA DE: 720169`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240961' },
        update: { title: `3240961`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240961 | REPA DE: 601553`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240961`, slug: '3240961', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240961 | REPA DE: 601553`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240220' },
        update: { title: `3240220`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240220 | REPA DE: 601070`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240220`, slug: '3240220', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240220 | REPA DE: 601070`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240964' },
        update: { title: `3240964`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240964 | REPA DE: 601567`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240964`, slug: '3240964', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240964 | REPA DE: 601567`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240411' },
        update: { title: `3240411`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240411 | REPA DE: 601568`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240411`, slug: '3240411', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240411 | REPA DE: 601568`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240393' },
        update: { title: `3240393`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240393 | REPA DE: 601570`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240393`, slug: '3240393', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240393 | REPA DE: 601570`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240395' },
        update: { title: `3240395`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240395 | REPA DE: 601573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240395`, slug: '3240395', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240395 | REPA DE: 601573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240969' },
        update: { title: `3240969`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240969 | REPA DE: 601586`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240969`, slug: '3240969', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240969 | REPA DE: 601586`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240409' },
        update: { title: `3240409`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240409 | REPA DE: 601588`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240409`, slug: '3240409', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240409 | REPA DE: 601588`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240972' },
        update: { title: `3240972`, description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240972 | REPA DE: 601590`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240972`, slug: '3240972', description: `Series: ALUMINUM FANS FOR MOTORS | REPA IT: 3240972 | REPA DE: 601590`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240951' },
        update: { title: `3240951`, description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3240951 | REPA DE: 601075`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240951`, slug: '3240951', description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3240951 | REPA DE: 601075`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240223' },
        update: { title: `3240223`, description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3240223 | REPA DE: 601076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3240223`, slug: '3240223', description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3240223 | REPA DE: 601076`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3805025' },
        update: { title: `3805025`, description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3805025 | REPA DE: LF3805025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3805025`, slug: '3805025', description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3805025 | REPA DE: LF3805025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3805027' },
        update: { title: `3805027`, description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3805027 | REPA DE: LF3805027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3805027`, slug: '3805027', description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3805027 | REPA DE: LF3805027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3185093' },
        update: { title: `3185093`, description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3185093 | REPA DE: 601582`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3185093`, slug: '3185093', description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3185093 | REPA DE: 601582`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3185090' },
        update: { title: `3185090`, description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3185090 | REPA DE: 602227`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3185090`, slug: '3185090', description: `Series: MOTOR BRACKETS STRAIGHT | REPA IT: 3185090 | REPA DE: 602227`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240911-yzf-10-20-26' },
        update: { title: `YZF 10-20-26`, description: `Series: MOTORS WEIGUANG YZF PENTAVALENT | REPA IT: 3240911 | REPA DE: 601022`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YZF 10-20-26`, slug: '3240911-yzf-10-20-26', description: `Series: MOTORS WEIGUANG YZF PENTAVALENT | REPA IT: 3240911 | REPA DE: 601022`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240913-yzf-25-40-26' },
        update: { title: `YZF 25-40-26`, description: `Series: MOTORS WEIGUANG YZF PENTAVALENT | REPA IT: 3240913 | REPA DE: 601024`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YZF 25-40-26`, slug: '3240913-yzf-25-40-26', description: `Series: MOTORS WEIGUANG YZF PENTAVALENT | REPA IT: 3240913 | REPA DE: 601024`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340257-7112' },
        update: { title: `7112`, description: `Series: MOTORS WEIGUANG YZF PENTAVALENT | REPA IT: 3340257 | REPA DE: 601878`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `7112`, slug: '3340257-7112', description: `Series: MOTORS WEIGUANG YZF PENTAVALENT | REPA IT: 3340257 | REPA DE: 601878`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240414-n-34-45389' },
        update: { title: `N 34-45/389`, description: `Series: MOTORS ELCO N T3 | REPA IT: 3240414 | REPA DE: 602221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `N 34-45/389`, slug: '3240414-n-34-45389', description: `Series: MOTORS ELCO N T3 | REPA IT: 3240414 | REPA DE: 602221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340114-n-16-25110' },
        update: { title: `N 16-25/110`, description: `Series: MOTORS ELCO N T3 | REPA IT: 3340114 | REPA DE: 601891`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `N 16-25/110`, slug: '3340114-n-16-25110', description: `Series: MOTORS ELCO N T3 | REPA IT: 3340114 | REPA DE: 601891`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340111-n-16-251457' },
        update: { title: `N 16-25/1457`, description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3340111 | REPA DE: 601763`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `N 16-25/1457`, slug: '3340111-n-16-251457', description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3340111 | REPA DE: 601763`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240211-n-10-20' },
        update: { title: `N 10-20`, description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3240211 | REPA DE: 601427`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `N 10-20`, slug: '3240211-n-10-20', description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3240211 | REPA DE: 601427`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3242829-n-18-30' },
        update: { title: `N 18-30`, description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3242829 | REPA DE: 602057`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `N 18-30`, slug: '3242829-n-18-30', description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3242829 | REPA DE: 602057`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240904-n-34-45' },
        update: { title: `N 34-45`, description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3240904 | REPA DE: 601530`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `N 34-45`, slug: '3240904-n-34-45', description: `Series: MOTORS ELCO N T4 WITH BEARING | REPA IT: 3240904 | REPA DE: 601530`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240635-5-82-ce-2010' },
        update: { title: `5-82-CE 2010`, description: `Series: MOTORS ELCO 3FBT | REPA IT: 3240635 | REPA DE: 602213`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5-82-CE 2010`, slug: '3240635-5-82-ce-2010', description: `Series: MOTORS ELCO 3FBT | REPA IT: 3240635 | REPA DE: 602213`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240636-5-82-ce-3016' },
        update: { title: `5-82-CE 3016`, description: `Series: MOTORS ELCO 3FBT | REPA IT: 3240636 | REPA DE: 602273`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5-82-CE 3016`, slug: '3240636-5-82-ce-3016', description: `Series: MOTORS ELCO 3FBT | REPA IT: 3240636 | REPA DE: 602273`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3340124-5-82-ce-4025' },
        update: { title: `5-82-CE 4025`, description: `Series: MOTORS ELCO 3FBT | REPA IT: 3340124 | REPA DE: 602215`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5-82-CE 4025`, slug: '3340124-5-82-ce-4025', description: `Series: MOTORS ELCO 3FBT | REPA IT: 3340124 | REPA DE: 602215`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1240122-82e-301655' },
        update: { title: `82E-3016/55`, description: `Series: MOTORS EMI 82E | REPA IT: 1240122 | REPA DE: LF1240122`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `82E-3016/55`, slug: '1240122-82e-301655', description: `Series: MOTORS EMI 82E | REPA IT: 1240122 | REPA DE: LF1240122`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240881-101m-501303' },
        update: { title: `101M-50130/3`, description: `Series: MOTORS EMI 83D | REPA IT: 3240881 | REPA DE: 601554`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `101M-50130/3`, slug: '3240881-101m-501303', description: `Series: MOTORS EMI 83D | REPA IT: 3240881 | REPA DE: 601554`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240580-m4q045-ca03-75' },
        update: { title: `M4Q045-CA03-75`, description: `Series: MOTORS EBM M4Q045 PENTAVALENT | REPA IT: 3240580 | REPA DE: 601757`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `M4Q045-CA03-75`, slug: '3240580-m4q045-ca03-75', description: `Series: MOTORS EBM M4Q045 PENTAVALENT | REPA IT: 3240580 | REPA DE: 601757`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240627-m4q045-da01-75' },
        update: { title: `M4Q045-DA01-75`, description: `Series: MOTORS EBM M4Q045 PENTAVALENT | REPA IT: 3240627 | REPA DE: 601759`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `M4Q045-DA01-75`, slug: '3240627-m4q045-da01-75', description: `Series: MOTORS EBM M4Q045 PENTAVALENT | REPA IT: 3240627 | REPA DE: 601759`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'fan-motors' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240629-m4q045-ef01-75' },
        update: { title: `M4Q045-EF01-75`, description: `Series: MOTORS EBM M4Q045 PENTAVALENT | REPA IT: 3240629 | REPA DE: 601761`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `M4Q045-EF01-75`, slug: '3240629-m4q045-ef01-75', description: `Series: MOTORS EBM M4Q045 PENTAVALENT | REPA IT: 3240629 | REPA DE: 601761`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'telethermometers-telethermometers-11x62-mm' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3441001-rof-88' },
        update: { title: `ROF-88`, description: `REPA IT: 3441001 | REPA DE: 541080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ROF-88`, slug: '3441001-rof-88', description: `REPA IT: 3441001 | REPA DE: 541080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'telethermometers-telethermometers-11x62-mm' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3441078-rof-88' },
        update: { title: `ROF-88`, description: `REPA IT: 3441078 | REPA DE: LF3441078`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ROF-88`, slug: '3441078-rof-88', description: `REPA IT: 3441078 | REPA DE: LF3441078`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'telethermometers-telethermometers-11x62-mm' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3441082' },
        update: { title: `3441082`, description: `REPA IT: 3441082 | REPA DE: LF3441082`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3441082`, slug: '3441082', description: `REPA IT: 3441082 | REPA DE: LF3441082`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'telethermometers-telethermometers-11x62-mm' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3441002' },
        update: { title: `3441002`, description: `REPA IT: 3441002 | REPA DE: LF3441002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3441002`, slug: '3441002', description: `REPA IT: 3441002 | REPA DE: LF3441002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'telethermometers-telethermometers-60-mm' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3441932' },
        update: { title: `3441932`, description: `Series: TELETHERMOMETERS F87R WITH REVERSIBLE FLANGE | REPA IT: 3441932 | REPA DE: LF3441932`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3441932`, slug: '3441932', description: `Series: TELETHERMOMETERS F87R WITH REVERSIBLE FLANGE | REPA IT: 3441932 | REPA DE: LF3441932`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3744130' },
        update: { title: `3744130`, description: `REPA IT: 3744130 | REPA DE: 390011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3744130`, slug: '3744130', description: `REPA IT: 3744130 | REPA DE: 390011`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3744229' },
        update: { title: `3744229`, description: `REPA IT: 3744229 | REPA DE: 390010`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3744229`, slug: '3744229', description: `REPA IT: 3744229 | REPA DE: 390010`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444976-f2000' },
        update: { title: `F2000`, description: `REPA IT: 3444976 | REPA DE: 390537`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `F2000`, slug: '3444976-f2000', description: `REPA IT: 3444976 | REPA DE: 390537`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444801-f2000' },
        update: { title: `F2000`, description: `REPA IT: 3444801 | REPA DE: 390595`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `F2000`, slug: '3444801-f2000', description: `REPA IT: 3444801 | REPA DE: 390595`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444996-2000a' },
        update: { title: `2000A`, description: `REPA IT: 3444996 | REPA DE: 390538`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `2000A`, slug: '3444996-2000a', description: `REPA IT: 3444996 | REPA DE: 390538`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444172-tr711n' },
        update: { title: `TR711N`, description: `REPA IT: 3444172 | REPA DE: 390534`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TR711N`, slug: '3444172-tr711n', description: `REPA IT: 3444172 | REPA DE: 390534`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444918-k50-p1125' },
        update: { title: `K50 P1125`, description: `REPA IT: 3444918 | REPA DE: 390545`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `K50 P1125`, slug: '3444918-k50-p1125', description: `REPA IT: 3444918 | REPA DE: 390545`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: 'd444075-k54-p1102' },
        update: { title: `K54 P1102`, description: `REPA IT: D444075 | REPA DE: 391056`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `K54 P1102`, slug: 'd444075-k54-p1102', description: `REPA IT: D444075 | REPA DE: 391056`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: 'd444068-k59-l1102' },
        update: { title: `K59 L1102`, description: `REPA IT: D444068 | REPA DE: 391064`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `K59 L1102`, slug: 'd444068-k59-l1102', description: `REPA IT: D444068 | REPA DE: 391064`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444819-k50-p1118' },
        update: { title: `K50 P1118`, description: `REPA IT: 3444819 | REPA DE: LF3444819`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `K50 P1118`, slug: '3444819-k50-p1118', description: `REPA IT: 3444819 | REPA DE: LF3444819`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3744128-arth094' },
        update: { title: `ARTH094`, description: `REPA IT: 3744128 | REPA DE: LF3744128`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ARTH094`, slug: '3744128-arth094', description: `REPA IT: 3744128 | REPA DE: LF3744128`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3744132-arth095' },
        update: { title: `ARTH095`, description: `REPA IT: 3744132 | REPA DE: LF3744132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ARTH095`, slug: '3744132-arth095', description: `REPA IT: 3744132 | REPA DE: LF3744132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444987-tsc-093c' },
        update: { title: `TSC 093C`, description: `REPA IT: 3444987 | REPA DE: LF3444987`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TSC 093C`, slug: '3444987-tsc-093c', description: `REPA IT: 3444987 | REPA DE: LF3444987`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-ranco-series-k-varifix' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444986-tsc-093c24w' },
        update: { title: `TSC 093C+24W`, description: `REPA IT: 3444986 | REPA DE: LF3444986`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TSC 093C+24W`, slug: '3444986-tsc-093c24w', description: `REPA IT: 3444986 | REPA DE: LF3444986`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-danfoss-service-kit' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444880-077b-7002' },
        update: { title: `077B-7002`, description: `REPA IT: 3444880 | REPA DE: 390553`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `077B-7002`, slug: '3444880-077b-7002', description: `REPA IT: 3444880 | REPA DE: 390553`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-danfoss-service-kit' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444882-077b-7004' },
        update: { title: `077B-7004`, description: `REPA IT: 3444882 | REPA DE: 390555`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `077B-7004`, slug: '3444882-077b-7004', description: `REPA IT: 3444882 | REPA DE: 390555`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-danfoss-service-kit' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444951-077b-7006' },
        update: { title: `077B-7006`, description: `REPA IT: 3444951 | REPA DE: 390557`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `077B-7006`, slug: '3444951-077b-7006', description: `REPA IT: 3444951 | REPA DE: 390557`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-danfoss-service-kit' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444533-077b-7008' },
        update: { title: `077B-7008`, description: `REPA IT: 3444533 | REPA DE: 390559`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `077B-7008`, slug: '3444533-077b-7008', description: `REPA IT: 3444533 | REPA DE: 390559`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-danfoss-service-kit' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3744163-kp61-060l1182' },
        update: { title: `KP61-060L1182`, description: `REPA IT: 3744163 | REPA DE: LF3744163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KP61-060L1182`, slug: '3744163-kp61-060l1182', description: `REPA IT: 3744163 | REPA DE: LF3744163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'thermostats-thermostats-danfoss-service-kit' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3444544-kp71-060l1115' },
        update: { title: `KP71-060L1115`, description: `REPA IT: 3444544 | REPA DE: 390491`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KP71-060L1115`, slug: '3444544-kp71-060l1115', description: `REPA IT: 3444544 | REPA DE: 390491`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5060764-eurema-te01def' },
        update: { title: `EUREMA TE01DEF`, description: `Series: DIGITAL THERMOMETERS | REPA IT: 5060764 | REPA DE: 378472`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EUREMA TE01DEF`, slug: '5060764-eurema-te01def', description: `Series: DIGITAL THERMOMETERS | REPA IT: 5060764 | REPA DE: 378472`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445537-arthermo-rof-dig' },
        update: { title: `ARTHERMO ROF-DIG`, description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445537 | REPA DE: 378274`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ARTHERMO ROF-DIG`, slug: '3445537-arthermo-rof-dig', description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445537 | REPA DE: 378274`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445351-dixell-xt11s-5000n' },
        update: { title: `DIXELL XT11S-5000N`, description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445351 | REPA DE: 378693`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DIXELL XT11S-5000N`, slug: '3445351-dixell-xt11s-5000n', description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445351 | REPA DE: 378693`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445259-eliwell-em300lx' },
        update: { title: `ELIWELL EM300LX`, description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445259 | REPA DE: 378701`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ELIWELL EM300LX`, slug: '3445259-eliwell-em300lx', description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445259 | REPA DE: 378701`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445089-ic-plus-915' },
        update: { title: `IC PLUS 915`, description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445089 | REPA DE: 379832`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IC PLUS 915`, slug: '3445089-ic-plus-915', description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445089 | REPA DE: 379832`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445044-ic-plus-902' },
        update: { title: `IC PLUS 902`, description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445044 | REPA DE: 379830`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IC PLUS 902`, slug: '3445044-ic-plus-902', description: `Series: DIGITAL THERMOMETERS | REPA IT: 3445044 | REPA DE: 379830`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445415-ewplus-974' },
        update: { title: `EWPlus 974`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445415 | REPA DE: 381546`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EWPlus 974`, slug: '3445415-ewplus-974', description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445415 | REPA DE: 381546`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445601-idnext902p' },
        update: { title: `IDNEXT902P`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445601 | REPA DE: LF3445601`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDNEXT902P`, slug: '3445601-idnext902p', description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445601 | REPA DE: LF3445601`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445603-idnext961p' },
        update: { title: `IDNEXT961P`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445603 | REPA DE: LF3445603`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDNEXT961P`, slug: '3445603-idnext961p', description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445603 | REPA DE: LF3445603`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445605-idnext971pb' },
        update: { title: `IDNEXT971P/B`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445605 | REPA DE: LF3445605`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDNEXT971P/B`, slug: '3445605-idnext971pb', description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445605 | REPA DE: LF3445605`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445607-idnext974pb' },
        update: { title: `IDNEXT974P/B`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445607 | REPA DE: LF3445607`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDNEXT974P/B`, slug: '3445607-idnext974pb', description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445607 | REPA DE: LF3445607`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445609-idnext974pci' },
        update: { title: `IDNEXT974P/CI`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445609 | REPA DE: LF3445609`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDNEXT974P/CI`, slug: '3445609-idnext974pci', description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445609 | REPA DE: LF3445609`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445612-idnext978pc' },
        update: { title: `IDNEXT978P/C`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445612 | REPA DE: LF3445612`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDNEXT978P/C`, slug: '3445612-idnext978pc', description: `Series: ELECTRONIC CONTROLLERS ELIWELL EW-EW PLUS | REPA IT: 3445612 | REPA DE: LF3445612`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445375-idplus-902' },
        update: { title: `IDPLUS 902`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445375 | REPA DE: 378303`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDPLUS 902`, slug: '3445375-idplus-902', description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445375 | REPA DE: 378303`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445376-idplus-961' },
        update: { title: `IDPLUS 961`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445376 | REPA DE: 378298`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDPLUS 961`, slug: '3445376-idplus-961', description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445376 | REPA DE: 378298`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445377-idplus-971' },
        update: { title: `IDPLUS 971`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445377 | REPA DE: 378304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDPLUS 971`, slug: '3445377-idplus-971', description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445377 | REPA DE: 378304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445378-idplus-974' },
        update: { title: `IDPLUS 974`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445378 | REPA DE: 378299`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDPLUS 974`, slug: '3445378-idplus-974', description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445378 | REPA DE: 378299`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445389-idplus-978' },
        update: { title: `IDPLUS 978`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445389 | REPA DE: 378436`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IDPLUS 978`, slug: '3445389-idplus-978', description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 3445389 | REPA DE: 378436`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '344552-iwc720s' },
        update: { title: `IWC720S`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 344552 | REPA DE: 5 378142`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IWC720S`, slug: '344552-iwc720s', description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 344552 | REPA DE: 5 378142`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '344507-iwc750' },
        update: { title: `IWC750`, description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 344507 | REPA DE: 8 378139`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IWC750`, slug: '344507-iwc750', description: `Series: ELECTRONIC CONTROLLERS ELIWELL ID-ID PLUS | REPA IT: 344507 | REPA DE: 8 378139`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445038-ewem233' },
        update: { title: `EWEM233`, description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 3445038 | REPA DE: 379533`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EWEM233`, slug: '3445038-ewem233', description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 3445038 | REPA DE: 379533`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5061869-ewem243' },
        update: { title: `EWEM243`, description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 5061869 | REPA DE: 378140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EWEM243`, slug: '5061869-ewem243', description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 5061869 | REPA DE: 378140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2111317-10-poles' },
        update: { title: `10 poles`, description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 2111317 | REPA DE: 381400`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `10 poles`, slug: '2111317-10-poles', description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 2111317 | REPA DE: 381400`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445071-ewdr-983' },
        update: { title: `EWDR 983`, description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 3445071 | REPA DE: 378696`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EWDR 983`, slug: '3445071-ewdr-983', description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 3445071 | REPA DE: 378696`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445526-ewdr-985' },
        update: { title: `EWDR 985`, description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 3445526 | REPA DE: 378206`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EWDR 985`, slug: '3445526-ewdr-985', description: `Series: BOARDS DISPLAY ELIWELL IWK WIDE | REPA IT: 3445526 | REPA DE: 378206`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445443-xr03cx-5n0c1' },
        update: { title: `XR03CX-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445443 | REPA DE: LF3445443`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR03CX-5N0C1`, slug: '3445443-xr03cx-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445443 | REPA DE: LF3445443`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445207-xr04cx-5n0c1' },
        update: { title: `XR04CX-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445207 | REPA DE: LF3445207`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR04CX-5N0C1`, slug: '3445207-xr04cx-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445207 | REPA DE: LF3445207`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445170-xr20cx-0n0c1' },
        update: { title: `XR20CX-0N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445170 | REPA DE: 378700`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR20CX-0N0C1`, slug: '3445170-xr20cx-0n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445170 | REPA DE: 378700`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445172-xr30cx-0n0c1' },
        update: { title: `XR30CX-0N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445172 | REPA DE: 378736`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR30CX-0N0C1`, slug: '3445172-xr30cx-0n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445172 | REPA DE: 378736`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445174-xr40cx-0n0c1' },
        update: { title: `XR40CX-0N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445174 | REPA DE: LF3445174`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR40CX-0N0C1`, slug: '3445174-xr40cx-0n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445174 | REPA DE: LF3445174`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445298-xr60cx-0n0c3' },
        update: { title: `XR60CX-0N0C3`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445298 | REPA DE: LF3445298`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR60CX-0N0C3`, slug: '3445298-xr60cx-0n0c3', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445298 | REPA DE: LF3445298`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445297-xr60cx-5n0c1' },
        update: { title: `XR60CX-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445297 | REPA DE: 402144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR60CX-5N0C1`, slug: '3445297-xr60cx-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445297 | REPA DE: 402144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445248-xr70cx-0n0c8' },
        update: { title: `XR70CX-0N0C8`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445248 | REPA DE: LF3445248`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR70CX-0N0C8`, slug: '3445248-xr70cx-0n0c8', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445248 | REPA DE: LF3445248`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445428-xr72cx-0n0c8-u' },
        update: { title: `XR72CX-0N0C8-U`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445428 | REPA DE: 378492`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR72CX-0N0C8-U`, slug: '3445428-xr72cx-0n0c8-u', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 3445428 | REPA DE: 378492`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5140068-xr75cx-5n7i3' },
        update: { title: `XR75CX-5N7I3`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 5140068 | REPA DE: LF5140068`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR75CX-5N7I3`, slug: '5140068-xr75cx-5n7i3', description: `Series: ELECTRONIC CONTROLLERS DIXELL XR-CX E-CLASS | REPA IT: 5140068 | REPA DE: LF5140068`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5116646-xr20ch-5n0c1' },
        update: { title: `XR20CH-5N0C1`, description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 5116646 | REPA DE: 378532`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR20CH-5N0C1`, slug: '5116646-xr20ch-5n0c1', description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 5116646 | REPA DE: 378532`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445543-xr20ch-5g0c3' },
        update: { title: `XR20CH-5G0C3`, description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 3445543 | REPA DE: 378488`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR20CH-5G0C3`, slug: '3445543-xr20ch-5g0c3', description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 3445543 | REPA DE: 378488`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445452-xr60ch-5r0c1' },
        update: { title: `XR60CH-5R0C1`, description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 3445452 | REPA DE: LF3445452`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR60CH-5R0C1`, slug: '3445452-xr60ch-5r0c1', description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 3445452 | REPA DE: LF3445452`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445520-xr70ch-5n2c3' },
        update: { title: `XR70CH-5N2C3`, description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 3445520 | REPA DE: LF3445520`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR70CH-5N2C3`, slug: '3445520-xr70ch-5n2c3', description: `Series: ELECTRONIC CONTROLLER DIXELL UNIVERSAL R4 | REPA IT: 3445520 | REPA DE: LF3445520`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445178-xw20ls-5n0c1' },
        update: { title: `XW20LS-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445178 | REPA DE: 378222`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW20LS-5N0C1`, slug: '3445178-xw20ls-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445178 | REPA DE: 378222`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445453-xw20lrh-5n0c0-d' },
        update: { title: `XW20LRH-5N0C0-D`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445453 | REPA DE: LF3445453`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW20LRH-5N0C0-D`, slug: '3445453-xw20lrh-5n0c0-d', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445453 | REPA DE: LF3445453`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2104028-xw30ls-5n0c1' },
        update: { title: `XW30LS-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 2104028 | REPA DE: LF2104028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW30LS-5N0C1`, slug: '2104028-xw30ls-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 2104028 | REPA DE: LF2104028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5069423-xw30ls-5n0c0-n' },
        update: { title: `XW30LS-5N0C0-N`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 5069423 | REPA DE: LF5069423`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW30LS-5N0C0-N`, slug: '5069423-xw30ls-5n0c0-n', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 5069423 | REPA DE: LF5069423`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445197-xw30l-00000' },
        update: { title: `XW30L-00000`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445197 | REPA DE: 402193`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW30L-00000`, slug: '3445197-xw30l-00000', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445197 | REPA DE: 402193`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5066444-xw30lrh-5n1d0-d' },
        update: { title: `XW30LRH-5N1D0-D`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 5066444 | REPA DE: 378526`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW30LRH-5N1D0-D`, slug: '5066444-xw30lrh-5n1d0-d', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 5066444 | REPA DE: 378526`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445230-xw40l-5n0c1' },
        update: { title: `XW40L-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445230 | REPA DE: 379655`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW40L-5N0C1`, slug: '3445230-xw40l-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445230 | REPA DE: 379655`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445179-xw60ls-5n0c1' },
        update: { title: `XW60LS-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445179 | REPA DE: 378223`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW60LS-5N0C1`, slug: '3445179-xw60ls-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445179 | REPA DE: 378223`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445454-xw60lrh-5n0c0-d' },
        update: { title: `XW60LRH-5N0C0-D`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445454 | REPA DE: LF3445454`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW60LRH-5N0C0-D`, slug: '3445454-xw60lrh-5n0c0-d', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445454 | REPA DE: LF3445454`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445181-xw60l-5n0c1' },
        update: { title: `XW60L-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445181 | REPA DE: 378229`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW60L-5N0C1`, slug: '3445181-xw60l-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445181 | REPA DE: 378229`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445392-xw60l-5l0d0-x' },
        update: { title: `XW60L-5L0D0-X`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445392 | REPA DE: 379699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW60L-5L0D0-X`, slug: '3445392-xw60l-5l0d0-x', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445392 | REPA DE: 379699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2104961-xw60l-5n0d1-x' },
        update: { title: `XW60L-5N0D1-X`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 2104961 | REPA DE: LF2104961`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW60L-5N0D1-X`, slug: '2104961-xw60l-5n0d1-x', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 2104961 | REPA DE: LF2104961`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445539-xw70lh-5n0w0-b' },
        update: { title: `XW70LH-5N0W0-B`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445539 | REPA DE: 378530`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW70LH-5N0W0-B`, slug: '3445539-xw70lh-5n0w0-b', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445539 | REPA DE: 378530`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445257-xw220l-5n0c1' },
        update: { title: `XW220L-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445257 | REPA DE: 378388`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW220L-5N0C1`, slug: '3445257-xw220l-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445257 | REPA DE: 378388`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445231-xw260l-5n0c5' },
        update: { title: `XW260L-5N0C5`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445231 | REPA DE: 381580`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW260L-5N0C5`, slug: '3445231-xw260l-5n0c5', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445231 | REPA DE: 381580`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445251-xw264l-5n0c5' },
        update: { title: `XW264L-5N0C5`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445251 | REPA DE: 378386`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW264L-5N0C5`, slug: '3445251-xw264l-5n0c5', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445251 | REPA DE: 378386`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445237-xw271l-5n0c1' },
        update: { title: `XW271L-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445237 | REPA DE: LF3445237`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW271L-5N0C1`, slug: '3445237-xw271l-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-L/LS/LR/LRH | REPA IT: 3445237 | REPA DE: LF3445237`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445247-xw260k-5n0c0' },
        update: { title: `XW260K-5N0C0`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 3445247 | REPA DE: 378225`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW260K-5N0C0`, slug: '3445247-xw260k-5n0c0', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 3445247 | REPA DE: 378225`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '7100499-xw271k-5n0c0' },
        update: { title: `XW271K-5N0C0`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 7100499 | REPA DE: LF7100499`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW271K-5N0C0`, slug: '7100499-xw271k-5n0c0', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 7100499 | REPA DE: LF7100499`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445420-xm470k-510c1' },
        update: { title: `XM470K-510C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 3445420 | REPA DE: LF3445420`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XM470K-510C1`, slug: '3445420-xm470k-510c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 3445420 | REPA DE: LF3445420`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102991-xw60k-5l2c0' },
        update: { title: `XW60K-5L2C0`, description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 2102991 | REPA DE: LF2102991`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW60K-5L2C0`, slug: '2102991-xw60k-5l2c0', description: `Series: ELECTRONIC CONTROLLERS DIXELL XW-K | REPA IT: 2102991 | REPA DE: LF2102991`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5068548-cx620-000n0' },
        update: { title: `CX620-000N0`, description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 5068548 | REPA DE: 378640`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CX620-000N0`, slug: '5068548-cx620-000n0', description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 5068548 | REPA DE: 378640`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5052544-t640-000c0' },
        update: { title: `T640-000C0`, description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 5052544 | REPA DE: 378278`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `T640-000C0`, slug: '5052544-t640-000c0', description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 5052544 | REPA DE: 378278`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445348-t820-000c0' },
        update: { title: `T820-000C0`, description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 3445348 | REPA DE: 378442`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `T820-000C0`, slug: '3445348-t820-000c0', description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 3445348 | REPA DE: 378442`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445417-t840-100d0-x' },
        update: { title: `T840-100D0-X`, description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 3445417 | REPA DE: LF3445417`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `T840-100D0-X`, slug: '3445417-t840-100d0-x', description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 3445417 | REPA DE: LF3445417`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5051507-xw30v-5n0c1' },
        update: { title: `XW30V-5N0C1`, description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 5051507 | REPA DE: LF5051507`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW30V-5N0C1`, slug: '5051507-xw30v-5n0c1', description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 5051507 | REPA DE: LF5051507`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445301-xw60v-5n0c1' },
        update: { title: `XW60V-5N0C1`, description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 3445301 | REPA DE: 378423`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XW60V-5N0C1`, slug: '3445301-xw60v-5n0c1', description: `Series: DISPLAY BOARDS DIXELL C-T-V | REPA IT: 3445301 | REPA DE: 378423`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240991-xr30t' },
        update: { title: `XR30T`, description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 5240991 | REPA DE: LF5240991`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR30T`, slug: '5240991-xr30t', description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 5240991 | REPA DE: LF5240991`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240993-xr70t' },
        update: { title: `XR70T`, description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 5240993 | REPA DE: LF5240993`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR70T`, slug: '5240993-xr70t', description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 5240993 | REPA DE: LF5240993`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445369-xr30d-5n0c1' },
        update: { title: `XR30D-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 3445369 | REPA DE: LF3445369`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR30D-5N0C1`, slug: '3445369-xr30d-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 3445369 | REPA DE: LF3445369`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445371-xr60d-5n0c1' },
        update: { title: `XR60D-5N0C1`, description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 3445371 | REPA DE: 381567`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XR60D-5N0C1`, slug: '3445371-xr60d-5n0c1', description: `Series: ELECTRONIC CONTROLLERS DIXELL FULL TOUCH XR-T | REPA IT: 3445371 | REPA DE: 381567`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5104943-pjezsnh000-compact' },
        update: { title: `PJEZSNH000 COMPACT`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5104943 | REPA DE: 378030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PJEZSNH000 COMPACT`, slug: '5104943-pjezsnh000-compact', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5104943 | REPA DE: 378030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5057406-pjezs0p000' },
        update: { title: `PJEZS0P000`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5057406 | REPA DE: 378721`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PJEZS0P000`, slug: '5057406-pjezs0p000', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5057406 | REPA DE: 378721`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5975202-pyco1sn50p' },
        update: { title: `PYCO1SN50P`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5975202 | REPA DE: 378673`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PYCO1SN50P`, slug: '5975202-pyco1sn50p', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5975202 | REPA DE: 378673`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445216-pjezs0a000' },
        update: { title: `PJEZS0A000`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 3445216 | REPA DE: LF3445216`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PJEZS0A000`, slug: '3445216-pjezs0a000', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 3445216 | REPA DE: LF3445216`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2101745-pjezs0g000' },
        update: { title: `PJEZS0G000`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 2101745 | REPA DE: LF2101745`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PJEZS0G000`, slug: '2101745-pjezs0g000', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 2101745 | REPA DE: LF2101745`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445217-pjezc00000' },
        update: { title: `PJEZC00000`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 3445217 | REPA DE: 378690`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PJEZC00000`, slug: '3445217-pjezc00000', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 3445217 | REPA DE: 378690`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445439-pyia1z055p' },
        update: { title: `PYIA1Z055P`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 3445439 | REPA DE: LF3445439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PYIA1Z055P`, slug: '3445439-pyia1z055p', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 3445439 | REPA DE: LF3445439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5068601-pjezc0p000' },
        update: { title: `PJEZC0P000`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5068601 | REPA DE: 378475`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PJEZC0P000`, slug: '5068601-pjezc0p000', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 5068601 | REPA DE: 378475`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '7106435-pjezc0h000' },
        update: { title: `PJEZC0H000`, description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 7106435 | REPA DE: LF7106435`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PJEZC0H000`, slug: '7106435-pjezc0h000', description: `Series: ELECTRONIC CONTROLLERS CAREL PJ-PY | REPA IT: 7106435 | REPA DE: LF7106435`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445908-ir33s0ln00' },
        update: { title: `IR33S0LN00`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445908 | REPA DE: LF3445908`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IR33S0LN00`, slug: '3445908-ir33s0ln00', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445908 | REPA DE: LF3445908`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445204-ir33s0er00' },
        update: { title: `IR33S0ER00`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445204 | REPA DE: 378144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IR33S0ER00`, slug: '3445204-ir33s0er00', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445204 | REPA DE: 378144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '4091609-irelf0en215' },
        update: { title: `IRELF0EN215`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 4091609 | REPA DE: 379512`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IRELF0EN215`, slug: '4091609-irelf0en215', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 4091609 | REPA DE: 379512`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '4092355-irelf0hn245' },
        update: { title: `IRELF0HN245`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 4092355 | REPA DE: 379509`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IRELF0HN245`, slug: '4092355-irelf0hn245', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 4092355 | REPA DE: 379509`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '4091642-irelc0hn215' },
        update: { title: `IRELC0HN215`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 4091642 | REPA DE: LF4091642`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IRELC0HN215`, slug: '4091642-irelc0hn215', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 4091642 | REPA DE: LF4091642`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445211-ir33c0lb00' },
        update: { title: `IR33C0LB00`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445211 | REPA DE: 378181`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `IR33C0LB00`, slug: '3445211-ir33c0lb00', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445211 | REPA DE: 378181`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445223-pb00s0sa50-short' },
        update: { title: `PB00S0SA50 SHORT`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445223 | REPA DE: LF3445223`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PB00S0SA50 SHORT`, slug: '3445223-pb00s0sa50-short', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445223 | REPA DE: LF3445223`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445218-pb00c0sn30-short' },
        update: { title: `PB00C0SN30 SHORT`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445218 | REPA DE: LF3445218`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PB00C0SN30 SHORT`, slug: '3445218-pb00c0sn30-short', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445218 | REPA DE: LF3445218`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445488-pb00f0ha10' },
        update: { title: `PB00F0HA10`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445488 | REPA DE: LF3445488`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PB00F0HA10`, slug: '3445488-pb00f0ha10', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445488 | REPA DE: LF3445488`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445349-pb00h0hn00' },
        update: { title: `PB00H0HN00`, description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445349 | REPA DE: LF3445349`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PB00H0HN00`, slug: '3445349-pb00h0hn00', description: `Series: ELECTRONIC CONTROLLERS CAREL IR33 | REPA IT: 3445349 | REPA DE: LF3445349`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5090596-connection-cable-3000-mm' },
        update: { title: `connection cable 3000 mm`, description: `Series: ELECTRONIC CONTROLLERS CAREL POWERSPLIT PSB | REPA IT: 5090596 | REPA DE: LF5090596`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `connection cable 3000 mm`, slug: '5090596-connection-cable-3000-mm', description: `Series: ELECTRONIC CONTROLLERS CAREL POWERSPLIT PSB | REPA IT: 5090596 | REPA DE: LF5090596`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3390388-pstialr400' },
        update: { title: `PSTIALR400`, description: `Series: ELECTRONIC CONTROLLERS CAREL POWERSPLIT PSB | REPA IT: 3390388 | REPA DE: LF3390388`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PSTIALR400`, slug: '3390388-pstialr400', description: `Series: ELECTRONIC CONTROLLERS CAREL POWERSPLIT PSB | REPA IT: 3390388 | REPA DE: LF3390388`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445202-dn33f0et00' },
        update: { title: `DN33F0ET00`, description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 3445202 | REPA DE: LF3445202`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DN33F0ET00`, slug: '3445202-dn33f0et00', description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 3445202 | REPA DE: LF3445202`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445554-mx30m24ho0' },
        update: { title: `MX30M24HO0`, description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 3445554 | REPA DE: 378786`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MX30M24HO0`, slug: '3445554-mx30m24ho0', description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 3445554 | REPA DE: 378786`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5236610-erc112c-080g3218' },
        update: { title: `ERC112C-080G3218`, description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 5236610 | REPA DE: LF5236610`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ERC112C-080G3218`, slug: '5236610-erc112c-080g3218', description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 5236610 | REPA DE: LF5236610`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5236615-erc113d-080g3253' },
        update: { title: `ERC113D-080G3253`, description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 5236615 | REPA DE: LF5236615`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ERC113D-080G3253`, slug: '5236615-erc113d-080g3253', description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 5236615 | REPA DE: LF5236615`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5232408-erc211-080g3454' },
        update: { title: `ERC211-080G3454`, description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 5232408 | REPA DE: 379821`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ERC211-080G3454`, slug: '5232408-erc211-080g3454', description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 5232408 | REPA DE: 379821`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445576-erc214-080g3295' },
        update: { title: `ERC214-080G3295`, description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 3445576 | REPA DE: 381645`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ERC214-080G3295`, slug: '3445576-erc214-080g3295', description: `Series: ELECTRONIC CONTROLLERS CAREL DN | REPA IT: 3445576 | REPA DE: 381645`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445128-evk203n7' },
        update: { title: `EVK203N7`, description: `Series: ELECTRONIC CONTROLLERS EVCO EVK | REPA IT: 3445128 | REPA DE: 378154`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVK203N7`, slug: '3445128-evk203n7', description: `Series: ELECTRONIC CONTROLLERS EVCO EVK | REPA IT: 3445128 | REPA DE: 378154`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445480-ev3b31n7' },
        update: { title: `EV3B31N7`, description: `Series: ELECTRONIC CONTROLLERS EVCO EVK | REPA IT: 3445480 | REPA DE: 378444`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EV3B31N7`, slug: '3445480-ev3b31n7', description: `Series: ELECTRONIC CONTROLLERS EVCO EVK | REPA IT: 3445480 | REPA DE: 378444`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445482-ev3b33n7' },
        update: { title: `EV3B33N7`, description: `Series: ELECTRONIC CONTROLLERS EVCO EVK | REPA IT: 3445482 | REPA DE: 378445`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EV3B33N7`, slug: '3445482-ev3b33n7', description: `Series: ELECTRONIC CONTROLLERS EVCO EVK | REPA IT: 3445482 | REPA DE: 378445`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445515-ev3122n7' },
        update: { title: `EV3122N7`, description: `Series: ELECTRONICAL CONTROLLERS EVCO EV3 200 | REPA IT: 3445515 | REPA DE: LF3445515`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EV3122N7`, slug: '3445515-ev3122n7', description: `Series: ELECTRONICAL CONTROLLERS EVCO EV3 200 | REPA IT: 3445515 | REPA DE: LF3445515`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445517-ev3294n9' },
        update: { title: `EV3294N9`, description: `Series: ELECTRONICAL CONTROLLERS EVCO EV3 200 | REPA IT: 3445517 | REPA DE: 378631`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EV3294N9`, slug: '3445517-ev3294n9', description: `Series: ELECTRONICAL CONTROLLERS EVCO EV3 200 | REPA IT: 3445517 | REPA DE: 378631`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445483-evr203n7' },
        update: { title: `EVR203N7`, description: `Series: ELECTRONICAL CONTROLLERS EVCO EV3 200 | REPA IT: 3445483 | REPA DE: LF3445483`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVR203N7`, slug: '3445483-evr203n7', description: `Series: ELECTRONICAL CONTROLLERS EVCO EV3 200 | REPA IT: 3445483 | REPA DE: LF3445483`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445679-cd5-01whrw' },
        update: { title: `CD5-01WHRW`, description: `Series: ELECTRONICAL CONTROLLERS EVCO EVF | REPA IT: 3445679 | REPA DE: LF3445679`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CD5-01WHRW`, slug: '3445679-cd5-01whrw', description: `Series: ELECTRONICAL CONTROLLERS EVCO EVF | REPA IT: 3445679 | REPA DE: LF3445679`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102285-ltr-5csre-a' },
        update: { title: `LTR-5CSRE-A`, description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 2102285 | REPA DE: LF2102285`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LTR-5CSRE-A`, slug: '2102285-ltr-5csre-a', description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 2102285 | REPA DE: LF2102285`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445485-at1-5as5e-ag' },
        update: { title: `AT1-5AS5E-AG`, description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 3445485 | REPA DE: LF3445485`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AT1-5AS5E-AG`, slug: '3445485-at1-5as5e-ag', description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 3445485 | REPA DE: LF3445485`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5194673-at1-5bs6e-bgk' },
        update: { title: `AT1-5BS6E-BGK`, description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 5194673 | REPA DE: LF3445261`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AT1-5BS6E-BGK`, slug: '5194673-at1-5bs6e-bgk', description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 5194673 | REPA DE: LF3445261`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445235-at2-5bs4e-ag' },
        update: { title: `AT2-5BS4E-AG`, description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 3445235 | REPA DE: 379764`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AT2-5BS4E-AG`, slug: '3445235-at2-5bs4e-ag', description: `Series: ELECTRONIC CONTROLLERS LAE AC1-5 AT1-5 AT2-5 AR2-5 AD2-5 | REPA IT: 3445235 | REPA DE: 379764`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102101-10-ways-flat-cable-2-m' },
        update: { title: `10-ways flat cable - 2 m`, description: `Series: ELECTRONIC CONTROLLERS LAE AC1-27 BR1-27 | REPA IT: 2102101 | REPA DE: 403465`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `10-ways flat cable - 2 m`, slug: '2102101-10-ways-flat-cable-2-m', description: `Series: ELECTRONIC CONTROLLERS LAE AC1-27 BR1-27 | REPA IT: 2102101 | REPA DE: 403465`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445476-remote-display-du5s' },
        update: { title: `Remote display DU5S`, description: `Series: ELECTRONIC CONTROLLERS LAE BR1-28 | REPA IT: 3445476 | REPA DE: 381380`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `Remote display DU5S`, slug: '3445476-remote-display-du5s', description: `Series: ELECTRONIC CONTROLLERS LAE BR1-28 | REPA IT: 3445476 | REPA DE: 381380`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5115305-bd1-28c1s5w-b' },
        update: { title: `BD1-28C1S5W-B`, description: `Series: ELECTRONIC CONTROLLERS LAE BR1-28 | REPA IT: 5115305 | REPA DE: 378253`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `BD1-28C1S5W-B`, slug: '5115305-bd1-28c1s5w-b', description: `Series: ELECTRONIC CONTROLLERS LAE BR1-28 | REPA IT: 5115305 | REPA DE: 378253`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445288-remote-display-lcd-5s' },
        update: { title: `Remote display LCD-5S`, description: `Series: ELECTRONIC CONTROLLERS LAE BR1-28 | REPA IT: 3445288 | REPA DE: LF3445288`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `Remote display LCD-5S`, slug: '3445288-remote-display-lcd-5s', description: `Series: ELECTRONIC CONTROLLERS LAE BR1-28 | REPA IT: 3445288 | REPA DE: LF3445288`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445162-d14123' },
        update: { title: `D14123`, description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445162 | REPA DE: 379460`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `D14123`, slug: '3445162-d14123', description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445162 | REPA DE: 379460`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445163-d14212' },
        update: { title: `D14212`, description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445163 | REPA DE: 379797`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `D14212`, slug: '3445163-d14212', description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445163 | REPA DE: 379797`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445164-d14323' },
        update: { title: `D14323`, description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445164 | REPA DE: 379456`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `D14323`, slug: '3445164-d14323', description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445164 | REPA DE: 379456`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445550-rc31-6001-ii' },
        update: { title: `RC31-6001-II`, description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445550 | REPA DE: LF3445550`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RC31-6001-II`, slug: '3445550-rc31-6001-ii', description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3445550 | REPA DE: LF3445550`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3744059-rc33-2601-ii' },
        update: { title: `RC33-2601-II`, description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3744059 | REPA DE: LF3744059`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RC33-2601-II`, slug: '3744059-rc33-2601-ii', description: `Series: ELECTRONIC CONTROLLERS AKO D14 | REPA IT: 3744059 | REPA DE: LF3744059`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445185-z31a-gr' },
        update: { title: `Z31A-GR`, description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445185 | REPA DE: LF3445185`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `Z31A-GR`, slug: '3445185-z31a-gr', description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445185 | REPA DE: LF3445185`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445187-z31-gr' },
        update: { title: `Z31-GR`, description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445187 | REPA DE: LF3445187`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `Z31-GR`, slug: '3445187-z31-gr', description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445187 | REPA DE: LF3445187`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445239-tly25h' },
        update: { title: `TLY25H`, description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445239 | REPA DE: 378439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TLY25H`, slug: '3445239-tly25h', description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445239 | REPA DE: 378439`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445189-z31y-hrr' },
        update: { title: `Z31Y-HRR`, description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445189 | REPA DE: LF3445189`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `Z31Y-HRR`, slug: '3445189-z31y-hrr', description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445189 | REPA DE: LF3445189`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445191-y39-grrr' },
        update: { title: `Y39-GRRR`, description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445191 | REPA DE: 379210`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `Y39-GRRR`, slug: '3445191-y39-grrr', description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445191 | REPA DE: 379210`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445510-y39c-hrrr' },
        update: { title: `Y39C-HRRR`, description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445510 | REPA DE: LF3445510`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `Y39C-HRRR`, slug: '3445510-y39c-hrrr', description: `Series: ELECTRONIC CONTROLLERS ASCON TECNOLOGIC Z-Y | REPA IT: 3445510 | REPA DE: LF3445510`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445433-ref-fr-sm' },
        update: { title: `REF-FR-SM`, description: `Series: ELECTRONIC CONTROLLERS KIOUR | REPA IT: 3445433 | REPA DE: 379493`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `REF-FR-SM`, slug: '3445433-ref-fr-sm', description: `Series: ELECTRONIC CONTROLLERS KIOUR | REPA IT: 3445433 | REPA DE: 379493`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445431-ref-fr-sp' },
        update: { title: `REF-FR-SP`, description: `Series: ELECTRONIC CONTROLLERS KIOUR | REPA IT: 3445431 | REPA DE: 379492`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `REF-FR-SP`, slug: '3445431-ref-fr-sp', description: `Series: ELECTRONIC CONTROLLERS KIOUR | REPA IT: 3445431 | REPA DE: 379492`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977432-ekt853hbrdtlr-902' },
        update: { title: `EKT853HBRDTLR 902`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977432 | REPA DE: 703620`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EKT853HBRDTLR 902`, slug: '5977432-ekt853hbrdtlr-902', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977432 | REPA DE: 703620`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977433-ektdin53irdr230' },
        update: { title: `EKTDIN53IRDR230`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977433 | REPA DE: 703621`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EKTDIN53IRDR230`, slug: '5977433-ektdin53irdr230', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977433 | REPA DE: 703621`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977435-klt11bbjr230c' },
        update: { title: `KLT11BBJR230C`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977435 | REPA DE: 703623`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KLT11BBJR230C`, slug: '5977435-klt11bbjr230c', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977435 | REPA DE: 703623`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977426-klt11-dsr230c' },
        update: { title: `KLT11-DSR230C`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977426 | REPA DE: 703614`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KLT11-DSR230C`, slug: '5977426-klt11-dsr230c', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977426 | REPA DE: 703614`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977440-klt21mdr230' },
        update: { title: `KLT21MDR230`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977440 | REPA DE: 703628`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KLT21MDR230`, slug: '5977440-klt21mdr230', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977440 | REPA DE: 703628`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977429-klt23idr230c' },
        update: { title: `KLT23IDR230C`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977429 | REPA DE: 703617`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KLT23IDR230C`, slug: '5977429-klt23idr230c', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977429 | REPA DE: 703617`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977439-klt33stpr230c' },
        update: { title: `KLT33STPR230C`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977439 | REPA DE: 703627`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KLT33STPR230C`, slug: '5977439-klt33stpr230c', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977439 | REPA DE: 703627`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977441-klt11timr230-timer' },
        update: { title: `KLT11TIMR230 Timer`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977441 | REPA DE: 703629`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KLT11TIMR230 Timer`, slug: '5977441-klt11timr230-timer', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977441 | REPA DE: 703629`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977437-st23i-dr230' },
        update: { title: `ST23I-DR230`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977437 | REPA DE: 703625`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ST23I-DR230`, slug: '5977437-st23i-dr230', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977437 | REPA DE: 703625`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977422-ektbig01r230c' },
        update: { title: `EKTBIG01R230C`, description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977422 | REPA DE: 703610`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EKTBIG01R230C`, slug: '5977422-ektbig01r230c', description: `Series: ELECTRONIC CONTROLLERS KELD | REPA IT: 5977422 | REPA DE: 703610`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977443-sdtycantc20' },
        update: { title: `SDTYCANTC20`, description: `Series: PROBES KELD | REPA IT: 5977443 | REPA DE: 703631`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SDTYCANTC20`, slug: '5977443-sdtycantc20', description: `Series: PROBES KELD | REPA IT: 5977443 | REPA DE: 703631`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5977445-klsh03' },
        update: { title: `KLSH03`, description: `Series: PROBES KELD | REPA IT: 5977445 | REPA DE: 703633`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KLSH03`, slug: '5977445-klsh03', description: `Series: PROBES KELD | REPA IT: 5977445 | REPA DE: 703633`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445618-rb-8000p' },
        update: { title: `RB-8000P`, description: `Series: PROBES KELD | REPA IT: 3445618 | REPA DE: LF3445618`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RB-8000P`, slug: '3445618-rb-8000p', description: `Series: PROBES KELD | REPA IT: 3445618 | REPA DE: LF3445618`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445698-rdt-3210' },
        update: { title: `RDT-3210`, description: `Series: PROBES KELD | REPA IT: 3445698 | REPA DE: LF3445698`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RDT-3210`, slug: '3445698-rdt-3210', description: `Series: PROBES KELD | REPA IT: 3445698 | REPA DE: LF3445698`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445442' },
        update: { title: `3445442`, description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445442 | REPA DE: LF3445442`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445442`, slug: '3445442', description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445442 | REPA DE: LF3445442`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445407' },
        update: { title: `3445407`, description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445407 | REPA DE: LF3445407`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445407`, slug: '3445407', description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445407 | REPA DE: LF3445407`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445302' },
        update: { title: `3445302`, description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445302 | REPA DE: LF3445302`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445302`, slug: '3445302', description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445302 | REPA DE: LF3445302`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445304' },
        update: { title: `3445304`, description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445304 | REPA DE: 378557`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445304`, slug: '3445304', description: `Series: ACCESSORIES FOR CONTROLLERS | REPA IT: 3445304 | REPA DE: 378557`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445062' },
        update: { title: `3445062`, description: `REPA IT: 3445062 | REPA DE: LF3445062`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445062`, slug: '3445062', description: `REPA IT: 3445062 | REPA DE: LF3445062`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electronic-controllers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445058' },
        update: { title: `3445058`, description: `REPA IT: 3445058 | REPA DE: LF3445058`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445058`, slug: '3445058', description: `REPA IT: 3445058 | REPA DE: LF3445058`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-humidity-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3397235-ewhs-2840w' },
        update: { title: `EWHS 2840/W`, description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 3397235 | REPA DE: 378726`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EWHS 2840/W`, slug: '3397235-ewhs-2840w', description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 3397235 | REPA DE: 378726`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-humidity-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445169-xh20p' },
        update: { title: `XH20P`, description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 3445169 | REPA DE: 403390`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XH20P`, slug: '3445169-xh20p', description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 3445169 | REPA DE: 403390`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-humidity-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445053-fwpa-030' },
        update: { title: `FWPA 030`, description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 3445053 | REPA DE: LF3445053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FWPA 030`, slug: '3445053-fwpa-030', description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 3445053 | REPA DE: LF3445053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-humidity-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239662-alco-pt5b-30m-808362' },
        update: { title: `ALCO PT5B-30M 808362`, description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 5239662 | REPA DE: LF5239662`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ALCO PT5B-30M 808362`, slug: '5239662-alco-pt5b-30m-808362', description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 5239662 | REPA DE: LF5239662`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-humidity-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239664-alco-pt5b-50m-808365' },
        update: { title: `ALCO PT5B-50M 808365`, description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 5239664 | REPA DE: LF5239664`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ALCO PT5B-50M 808365`, slug: '5239664-alco-pt5b-50m-808365', description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 5239664 | REPA DE: LF5239664`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-humidity-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102429-carel-spkt0011c0' },
        update: { title: `CAREL SPKT0011C0`, description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 2102429 | REPA DE: LF2102429`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAREL SPKT0011C0`, slug: '2102429-carel-spkt0011c0', description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 2102429 | REPA DE: LF2102429`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-humidity-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239660-carel-spkt00b1c0' },
        update: { title: `CAREL SPKT00B1C0`, description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 5239660 | REPA DE: LF5239660`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `CAREL SPKT00B1C0`, slug: '5239660-carel-spkt00b1c0', description: `Series: EVHP 503 EWHS 2840/W EWHS 3040 XH20P DPPC110000 | REPA IT: 5239660 | REPA DE: LF5239660`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445107' },
        update: { title: `3445107`, description: `REPA IT: 3445107 | REPA DE: 378694`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445107`, slug: '3445107', description: `REPA IT: 3445107 | REPA DE: 378694`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445183' },
        update: { title: `3445183`, description: `REPA IT: 3445183 | REPA DE: LF3445183`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445183`, slug: '3445183', description: `REPA IT: 3445183 | REPA DE: LF3445183`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445157' },
        update: { title: `3445157`, description: `REPA IT: 3445157 | REPA DE: 378699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445157`, slug: '3445157', description: `REPA IT: 3445157 | REPA DE: 378699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445046' },
        update: { title: `3445046`, description: `REPA IT: 3445046 | REPA DE: 402200`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445046`, slug: '3445046', description: `REPA IT: 3445046 | REPA DE: 402200`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445028' },
        update: { title: `3445028`, description: `REPA IT: 3445028 | REPA DE: 379633`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445028`, slug: '3445028', description: `REPA IT: 3445028 | REPA DE: 379633`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445155' },
        update: { title: `3445155`, description: `REPA IT: 3445155 | REPA DE: 381569`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445155`, slug: '3445155', description: `REPA IT: 3445155 | REPA DE: 381569`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445154' },
        update: { title: `3445154`, description: `REPA IT: 3445154 | REPA DE: 381564`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445154`, slug: '3445154', description: `REPA IT: 3445154 | REPA DE: 381564`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445335' },
        update: { title: `3445335`, description: `REPA IT: 3445335 | REPA DE: 381590`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445335`, slug: '3445335', description: `REPA IT: 3445335 | REPA DE: 381590`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445380' },
        update: { title: `3445380`, description: `REPA IT: 3445380 | REPA DE: LF3445380`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445380`, slug: '3445380', description: `REPA IT: 3445380 | REPA DE: LF3445380`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'probes-temperature-probes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '2102338' },
        update: { title: `2102338`, description: `REPA IT: 2102338 | REPA DE: 378454`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `2102338`, slug: '2102338', description: `REPA IT: 2102338 | REPA DE: 378454`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'potentiometers-speed-regulators-for-fans-dixell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445074-fasec-33' },
        update: { title: `FASEC 33`, description: `Series: SPEED REGULATORS FOR FANS ELIWELL | REPA IT: 3445074 | REPA DE: 402945`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FASEC 33`, slug: '3445074-fasec-33', description: `Series: SPEED REGULATORS FOR FANS ELIWELL | REPA IT: 3445074 | REPA DE: 402945`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'potentiometers-speed-regulators-for-fans-dixell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445063-ptc-probe' },
        update: { title: `PTC PROBE`, description: `Series: SPEED REGULATORS FOR FANS ELIWELL | REPA IT: 3445063 | REPA DE: LF3445063`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PTC PROBE`, slug: '3445063-ptc-probe', description: `Series: SPEED REGULATORS FOR FANS ELIWELL | REPA IT: 3445063 | REPA DE: LF3445063`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445307-w09yhrrrb' },
        update: { title: `W09YHRRRB`, description: `Series: ELECTRICAL BOARDS ASCON TECNOLOGIC | REPA IT: 3445307 | REPA DE: 378234`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `W09YHRRRB`, slug: '3445307-w09yhrrrb', description: `Series: ELECTRICAL BOARDS ASCON TECNOLOGIC | REPA IT: 3445307 | REPA DE: 378234`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240837-xer160p-5n1040' },
        update: { title: `XER160P -5N1040`, description: `Series: ELECTRICAL BOARDS ASCON TECNOLOGIC | REPA IT: 5240837 | REPA DE: LF5240837`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XER160P -5N1040`, slug: '5240837-xer160p-5n1040', description: `Series: ELECTRICAL BOARDS ASCON TECNOLOGIC | REPA IT: 5240837 | REPA DE: LF5240837`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240839-xer261p-5n1040' },
        update: { title: `XER261P -5N1040`, description: `Series: ELECTRICAL BOARDS ASCON TECNOLOGIC | REPA IT: 5240839 | REPA DE: LF5240839`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XER261P -5N1040`, slug: '5240839-xer261p-5n1040', description: `Series: ELECTRICAL BOARDS ASCON TECNOLOGIC | REPA IT: 5240839 | REPA DE: LF5240839`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445165-3-14632' },
        update: { title: `14632`, description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 3445165 3`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `14632`, slug: '3445165-3-14632', description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 3445165 3`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '354500' },
        update: { title: `354500`, description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 354500`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `354500`, slug: '354500', description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 354500`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '354500-1' },
        update: { title: `354500`, description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 354500`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `354500`, slug: '354500-1', description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 354500`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '344564-ewcr-5030' },
        update: { title: `EWCR 5030`, description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 344564 | REPA DE: 0 LF3445640`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EWCR 5030`, slug: '344564-ewcr-5030', description: `Series: ELECTRICAL BOARDS AKO | REPA IT: 344564 | REPA DE: 0 LF3445640`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3545006-we00c2hn00' },
        update: { title: `WE00C2HN00`, description: `Series: ELECTRICAL BOARDS CAREL SMARTCELLA | REPA IT: 3545006 | REPA DE: 378549`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `WE00C2HN00`, slug: '3545006-we00c2hn00', description: `Series: ELECTRICAL BOARDS CAREL SMARTCELLA | REPA IT: 3545006 | REPA DE: 378549`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445214-md33d5fb00' },
        update: { title: `MD33D5FB00`, description: `Series: ELECTRICAL BOARDS CAREL SMARTCELLA | REPA IT: 3445214 | REPA DE: 378146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MD33D5FB00`, slug: '3445214-md33d5fb00', description: `Series: ELECTRICAL BOARDS CAREL SMARTCELLA | REPA IT: 3445214 | REPA DE: 378146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'electrical-boards' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445344' },
        update: { title: `3445344`, description: `Series: ELECTRICAL CONTROLLER PEGO ECP 202 EXPERT | REPA IT: 3445344 | REPA DE: LF3445344`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445344`, slug: '3445344', description: `Series: ELECTRICAL CONTROLLER PEGO ECP 202 EXPERT | REPA IT: 3445344 | REPA DE: LF3445344`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320137-p100cp-102d' },
        update: { title: `P100CP-102D`, description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 3320137 | REPA DE: LF3320137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `P100CP-102D`, slug: '3320137-p100cp-102d', description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 3320137 | REPA DE: LF3320137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320138-p100cp-106d' },
        update: { title: `P100CP-106D`, description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 3320138 | REPA DE: LF3320138`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `P100CP-106D`, slug: '3320138-p100cp-106d', description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 3320138 | REPA DE: LF3320138`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320152-acb-2ua574w' },
        update: { title: `ACB-2UA574W`, description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 3320152 | REPA DE: 542133`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ACB-2UA574W`, slug: '3320152-acb-2ua574w', description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 3320152 | REPA DE: 542133`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5038870-acb-2ub178' },
        update: { title: `ACB-2UB178`, description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 5038870 | REPA DE: LF5038870`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ACB-2UB178`, slug: '5038870-acb-2ub178', description: `Series: PRESSURE SWITCHES JOHNSON CONTROLS P100 | REPA IT: 5038870 | REPA DE: LF5038870`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320271-o17-r4705-dual-heavy-duty-pressure-controls' },
        update: { title: `O17-R4705 Dual Heavy Duty Pressure Controls`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320271 | REPA DE: LF3320271`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `O17-R4705 Dual Heavy Duty Pressure Controls`, slug: '3320271-o17-r4705-dual-heavy-duty-pressure-controls', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320271 | REPA DE: LF3320271`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320273-o17-r4759-dual-heavy-duty-pressure-controls' },
        update: { title: `O17-R4759 Dual Heavy Duty Pressure Controls`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320273 | REPA DE: LF3320273`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `O17-R4759 Dual Heavy Duty Pressure Controls`, slug: '3320273-o17-r4759-dual-heavy-duty-pressure-controls', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320273 | REPA DE: LF3320273`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5157973-o16-r6705-single-heavy-duty-low-pressure-control' },
        update: { title: `O16-R6705 Single Heavy Duty Low Pressure Control`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 5157973 | REPA DE: LF5157973`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `O16-R6705 Single Heavy Duty Low Pressure Control`, slug: '5157973-o16-r6705-single-heavy-duty-low-pressure-control', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 5157973 | REPA DE: LF5157973`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320282-o16-r6751-single-heavy-duty-high-pressure-control' },
        update: { title: `O16-R6751 Single Heavy Duty High Pressure Control`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320282 | REPA DE: LF3320282`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `O16-R6751 Single Heavy Duty High Pressure Control`, slug: '3320282-o16-r6751-single-heavy-duty-high-pressure-control', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320282 | REPA DE: LF3320282`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320289-lps-0-6-1-8-mini-low-pressure-switch' },
        update: { title: `LPS-0 6-1 8 Mini Low Pressure switch`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320289 | REPA DE: LF3320289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LPS-0 6-1 8 Mini Low Pressure switch`, slug: '3320289-lps-0-6-1-8-mini-low-pressure-switch', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320289 | REPA DE: LF3320289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320291-lps-3-8-5-9-mini-low-pressure-switch' },
        update: { title: `LPS-3 8-5 9 Mini Low Pressure switch`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320291 | REPA DE: LF3320291`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LPS-3 8-5 9 Mini Low Pressure switch`, slug: '3320291-lps-3-8-5-9-mini-low-pressure-switch', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320291 | REPA DE: LF3320291`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320293-hps-18-13-mini-high-pressure-switch' },
        update: { title: `HPS-18-13 Mini High Pressure Switch`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320293 | REPA DE: LF3320293`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `HPS-18-13 Mini High Pressure Switch`, slug: '3320293-hps-18-13-mini-high-pressure-switch', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320293 | REPA DE: LF3320293`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320280-hps-28-21-mini-high-pressure-switch' },
        update: { title: `HPS-28-21 Mini High Pressure Switch`, description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320280 | REPA DE: LF3320280`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `HPS-28-21 Mini High Pressure Switch`, slug: '3320280-hps-28-21-mini-high-pressure-switch', description: `Series: PRESSURE SWITCHES AND MINI-PRESSURE SWITCHES ROBERTSHAW RANCO | REPA IT: 3320280 | REPA DE: LF3320280`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320253-kp5-060-5133' },
        update: { title: `KP5 060-5133`, description: `Series: PRESSURE SWITCHES DANFOSS SERIES KP | REPA IT: 3320253 | REPA DE: LF3320253`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KP5 060-5133`, slug: '3320253-kp5-060-5133', description: `Series: PRESSURE SWITCHES DANFOSS SERIES KP | REPA IT: 3320253 | REPA DE: LF3320253`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320254-kp7w-060-1190' },
        update: { title: `KP7W 060-1190`, description: `Series: PRESSURE SWITCHES DANFOSS SERIES KP | REPA IT: 3320254 | REPA DE: 541467`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KP7W 060-1190`, slug: '3320254-kp7w-060-1190', description: `Series: PRESSURE SWITCHES DANFOSS SERIES KP | REPA IT: 3320254 | REPA DE: 541467`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'pressure-switches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3320256-kp17w-060-1275' },
        update: { title: `KP17W 060-1275`, description: `Series: PRESSURE SWITCHES DANFOSS SERIES KP | REPA IT: 3320256 | REPA DE: 541469`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KP17W 060-1275`, slug: '3320256-kp17w-060-1275', description: `Series: PRESSURE SWITCHES DANFOSS SERIES KP | REPA IT: 3320256 | REPA DE: 541469`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120156-10203' },
        update: { title: `1020/3`, description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120156 | REPA DE: 370788`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1020/3`, slug: '3120156-10203', description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120156 | REPA DE: 370788`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120159-10704' },
        update: { title: `1070/4`, description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120159 | REPA DE: 370153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1070/4`, slug: '3120159-10704', description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120159 | REPA DE: 370153`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120912-10282' },
        update: { title: `1028/2`, description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120912 | REPA DE: 370151`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1028/2`, slug: '3120912-10282', description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120912 | REPA DE: 370151`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120158-1068m10' },
        update: { title: `1068/M10`, description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120158 | REPA DE: 370383`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1068/M10`, slug: '3120158-1068m10', description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120158 | REPA DE: 370383`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120389-10683' },
        update: { title: `1068/3`, description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120389 | REPA DE: LF3120389`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1068/3`, slug: '3120389-10683', description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120389 | REPA DE: LF3120389`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120390-10784' },
        update: { title: `1078/4`, description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120390 | REPA DE: LF3120390`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1078/4`, slug: '3120390-10784', description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120390 | REPA DE: LF3120390`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120578-1028v2se' },
        update: { title: `1028V/2S.E`, description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120578 | REPA DE: 370805`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1028V/2S.E`, slug: '3120578-1028v2se', description: `Series: SOLENOID VALVES CASTEL NC | REPA IT: 3120578 | REPA DE: 370805`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120189-9300ra4' },
        update: { title: `9300/RA4`, description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 3120189 | REPA DE: 371301`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `9300/RA4`, slug: '3120189-9300ra4', description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 3120189 | REPA DE: 371301`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5057408-9300ra7' },
        update: { title: `9300/RA7`, description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 5057408 | REPA DE: 371414`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `9300/RA7`, slug: '5057408-9300ra7', description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 5057408 | REPA DE: 371414`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120323-9110ra6' },
        update: { title: `9110/RA6`, description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 3120323 | REPA DE: 371084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `9110/RA6`, slug: '3120323-9110ra6', description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 3120323 | REPA DE: 371084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120573-9150exr02' },
        update: { title: `9150EX/R02`, description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 3120573 | REPA DE: LF3120573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `9150EX/R02`, slug: '3120573-9150exr02', description: `Series: COILS AND CONNECTORS CASTEL | REPA IT: 3120573 | REPA DE: LF3120573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120212-v8f3' },
        update: { title: `V8F3`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120212 | REPA DE: LF3120212`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `V8F3`, slug: '3120212-v8f3', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120212 | REPA DE: LF3120212`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120218-v13f4' },
        update: { title: `V13F4`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120218 | REPA DE: LF3120218`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `V13F4`, slug: '3120218-v13f4', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120218 | REPA DE: LF3120218`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120221-v19sm16' },
        update: { title: `V19SM16`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120221 | REPA DE: LF3120221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `V19SM16`, slug: '3120221-v19sm16', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120221 | REPA DE: LF3120221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1199215-wb80' },
        update: { title: `WB8.0`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 1199215 | REPA DE: LF1199215`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `WB8.0`, slug: '1199215-wb80', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 1199215 | REPA DE: LF1199215`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1120361-yb09' },
        update: { title: `YB09`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 1120361 | REPA DE: 371033`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YB09`, slug: '1120361-yb09', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 1120361 | REPA DE: 371033`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120917-yb14' },
        update: { title: `YB14`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120917 | REPA DE: 371098`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `YB14`, slug: '3120917-yb14', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120917 | REPA DE: 371098`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '4085847-zb15' },
        update: { title: `ZB15`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 4085847 | REPA DE: 371330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ZB15`, slug: '4085847-zb15', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 4085847 | REPA DE: 371330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120044-a-22' },
        update: { title: `A-22`, description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120044 | REPA DE: 371091`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `A-22`, slug: '3120044-a-22', description: `Series: SOLENOID VALVES PARKER NC REFRIGERATION | REPA IT: 3120044 | REPA DE: 371091`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120338-evr3-32f1207' },
        update: { title: `EVR3-32F1207`, description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120338 | REPA DE: 370160`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVR3-32F1207`, slug: '3120338-evr3-32f1207', description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120338 | REPA DE: 370160`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120339-evr6-32l1213' },
        update: { title: `EVR6-32L1213`, description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120339 | REPA DE: 370287`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVR6-32L1213`, slug: '3120339-evr6-32l1213', description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120339 | REPA DE: 370287`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120616-evr10-32l1218' },
        update: { title: `EVR10-32L1218`, description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120616 | REPA DE: 370289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EVR10-32L1218`, slug: '3120616-evr10-32l1218', description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120616 | REPA DE: 370289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120607-18f7958' },
        update: { title: `18F7958`, description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120607 | REPA DE: LF3120607`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `18F7958`, slug: '3120607-18f7958', description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120607 | REPA DE: LF3120607`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'solenoid-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120208-18f6193' },
        update: { title: `18F6193`, description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120208 | REPA DE: 371293`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `18F6193`, slug: '3120208-18f6193', description: `Series: SOLENOID VALVES DANFOSS EVR NC | REPA IT: 3120208 | REPA DE: 371293`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '7100513' },
        update: { title: `7100513`, description: `REPA IT: 7100513 | REPA DE: 750793`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `7100513`, slug: '7100513', description: `REPA IT: 7100513 | REPA DE: 750793`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660001' },
        update: { title: `3660001`, description: `REPA IT: 3660001 | REPA DE: LF3660001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3660001`, slug: '3660001', description: `REPA IT: 3660001 | REPA DE: LF3660001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660009' },
        update: { title: `3660009`, description: `REPA IT: 3660009 | REPA DE: LF3660009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3660009`, slug: '3660009', description: `REPA IT: 3660009 | REPA DE: LF3660009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '7100512' },
        update: { title: `7100512`, description: `REPA IT: 7100512 | REPA DE: LF7100512`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `7100512`, slug: '7100512', description: `REPA IT: 7100512 | REPA DE: LF7100512`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660007' },
        update: { title: `3660007`, description: `REPA IT: 3660007 | REPA DE: 750617`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3660007`, slug: '3660007', description: `REPA IT: 3660007 | REPA DE: 750617`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160240' },
        update: { title: `3160240`, description: `REPA IT: 3160240 | REPA DE: 750619`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3160240`, slug: '3160240', description: `REPA IT: 3160240 | REPA DE: 750619`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160244' },
        update: { title: `3160244`, description: `REPA IT: 3160244 | REPA DE: 750276`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3160244`, slug: '3160244', description: `REPA IT: 3160244 | REPA DE: 750276`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5038187' },
        update: { title: `5038187`, description: `REPA IT: 5038187 | REPA DE: 750047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5038187`, slug: '5038187', description: `REPA IT: 5038187 | REPA DE: 750047`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660003' },
        update: { title: `3660003`, description: `REPA IT: 3660003 | REPA DE: 750791`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3660003`, slug: '3660003', description: `REPA IT: 3660003 | REPA DE: 750791`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5038189' },
        update: { title: `5038189`, description: `REPA IT: 5038189 | REPA DE: 750232`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5038189`, slug: '5038189', description: `REPA IT: 5038189 | REPA DE: 750232`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660004' },
        update: { title: `3660004`, description: `REPA IT: 3660004 | REPA DE: LF3660004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3660004`, slug: '3660004', description: `REPA IT: 3660004 | REPA DE: LF3660004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160270-mg112' },
        update: { title: `MG112`, description: `REPA IT: 3160270 | REPA DE: LF3160270`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MG112`, slug: '3160270-mg112', description: `REPA IT: 3160270 | REPA DE: LF3160270`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160272-mg122' },
        update: { title: `MG122`, description: `REPA IT: 3160272 | REPA DE: LF3160272`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MG122`, slug: '3160272-mg122', description: `REPA IT: 3160272 | REPA DE: LF3160272`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160274-mg224' },
        update: { title: `MG224`, description: `REPA IT: 3160274 | REPA DE: LF3160274`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MG224`, slug: '3160274-mg224', description: `REPA IT: 3160274 | REPA DE: LF3160274`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160276-mg234' },
        update: { title: `MG234`, description: `REPA IT: 3160276 | REPA DE: LF3160276`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MG234`, slug: '3160276-mg234', description: `REPA IT: 3160276 | REPA DE: LF3160276`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-copper-filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160278-mg345' },
        update: { title: `MG345`, description: `REPA IT: 3160278 | REPA DE: LF3160278`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MG345`, slug: '3160278-mg345', description: `REPA IT: 3160278 | REPA DE: LF3160278`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160246-43052f' },
        update: { title: `4305/2F`, description: `REPA IT: 3160246 | REPA DE: 750426`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4305/2F`, slug: '3160246-43052f', description: `REPA IT: 3160246 | REPA DE: 750426`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160922-43083f' },
        update: { title: `4308/3F`, description: `REPA IT: 3160922 | REPA DE: 750083`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4308/3F`, slug: '3160922-43083f', description: `REPA IT: 3160922 | REPA DE: 750083`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660102-df3032s' },
        update: { title: `DF303/2S`, description: `REPA IT: 3660102 | REPA DE: 750038`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DF303/2S`, slug: '3660102-df3032s', description: `REPA IT: 3660102 | REPA DE: 750038`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660103-df3052s' },
        update: { title: `DF305/2S`, description: `REPA IT: 3660103 | REPA DE: 750039`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DF305/2S`, slug: '3660103-df3052s', description: `REPA IT: 3660103 | REPA DE: 750039`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660095-df3162' },
        update: { title: `DF316/2`, description: `REPA IT: 3660095 | REPA DE: 750079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DF316/2`, slug: '3660095-df3162', description: `REPA IT: 3660095 | REPA DE: 750079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5124240-df3053' },
        update: { title: `DF305/3`, description: `REPA IT: 5124240 | REPA DE: 750042`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DF305/3`, slug: '5124240-df3053', description: `REPA IT: 5124240 | REPA DE: 750042`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660096-df3163' },
        update: { title: `DF316/3`, description: `REPA IT: 3660096 | REPA DE: 750046`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DF316/3`, slug: '3660096-df3163', description: `REPA IT: 3660096 | REPA DE: 750046`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160923-43165' },
        update: { title: `4316/5`, description: `REPA IT: 3160923 | REPA DE: 750084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `4316/5`, slug: '3160923-43165', description: `REPA IT: 3160923 | REPA DE: 750084`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-anti-acid-dehydrator-filters-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160550-df3305' },
        update: { title: `DF330/5`, description: `REPA IT: 3160550 | REPA DE: LF3160550`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DF330/5`, slug: '3160550-df3305', description: `REPA IT: 3160550 | REPA DE: LF3160550`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660019-di305n2s' },
        update: { title: `DI305N/2S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660019 | REPA DE: LF3660019`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI305N/2S`, slug: '3660019-di305n2s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660019 | REPA DE: LF3660019`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660023-di305n3s' },
        update: { title: `DI305N/3S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660023 | REPA DE: LF3660023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI305N/3S`, slug: '3660023-di305n3s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660023 | REPA DE: LF3660023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5148854-di308n2' },
        update: { title: `DI308N/2`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 5148854 | REPA DE: LF5148854`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI308N/2`, slug: '5148854-di308n2', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 5148854 | REPA DE: LF5148854`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660026-di308n3' },
        update: { title: `DI308N/3`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660026 | REPA DE: LF3660026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI308N/3`, slug: '3660026-di308n3', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660026 | REPA DE: LF3660026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660028-di308nm10s' },
        update: { title: `DI308N/M10S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660028 | REPA DE: LF3660028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI308N/M10S`, slug: '3660028-di308nm10s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660028 | REPA DE: LF3660028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660030-di308n4' },
        update: { title: `DI308N/4`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660030 | REPA DE: LF3660030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI308N/4`, slug: '3660030-di308n4', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660030 | REPA DE: LF3660030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660032-di316n3' },
        update: { title: `DI316N/3`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660032 | REPA DE: LF3660032`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI316N/3`, slug: '3660032-di316n3', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660032 | REPA DE: LF3660032`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660034-di316nm10s' },
        update: { title: `DI316N/M10S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660034 | REPA DE: LF3660034`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI316N/M10S`, slug: '3660034-di316nm10s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660034 | REPA DE: LF3660034`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660021-di316n4' },
        update: { title: `DI316N/4`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660021 | REPA DE: LF3660021`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI316N/4`, slug: '3660021-di316n4', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660021 | REPA DE: LF3660021`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660036-di316n5' },
        update: { title: `DI316N/5`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660036 | REPA DE: LF3660036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI316N/5`, slug: '3660036-di316n5', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660036 | REPA DE: LF3660036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660038-di330n4s' },
        update: { title: `DI330N/4S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660038 | REPA DE: LF3660038`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI330N/4S`, slug: '3660038-di330n4s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660038 | REPA DE: LF3660038`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660040-di330n5s' },
        update: { title: `DI330N/5S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660040 | REPA DE: LF3660040`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI330N/5S`, slug: '3660040-di330n5s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660040 | REPA DE: LF3660040`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660042-di330n6s' },
        update: { title: `DI330N/6S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660042 | REPA DE: LF3660042`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI330N/6S`, slug: '3660042-di330n6s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660042 | REPA DE: LF3660042`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660044-di341n4s' },
        update: { title: `DI341N/4S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660044 | REPA DE: LF3660044`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI341N/4S`, slug: '3660044-di341n4s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660044 | REPA DE: LF3660044`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660046-di341n5s' },
        update: { title: `DI341N/5S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660046 | REPA DE: LF3660046`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI341N/5S`, slug: '3660046-di341n5s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660046 | REPA DE: LF3660046`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660048-di341n7s' },
        update: { title: `DI341N/7S`, description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660048 | REPA DE: LF3660048`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DI341N/7S`, slug: '3660048-di341n7s', description: `Series: REFRIGERATION FILTERS WITH HUMIDITY INDICATOR | REPA IT: 3660048 | REPA DE: LF3660048`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160497-dcl-052' },
        update: { title: `DCL 052`, description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3160497 | REPA DE: 750664`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DCL 052`, slug: '3160497-dcl-052', description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3160497 | REPA DE: 750664`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660011-dcl-052s' },
        update: { title: `DCL 052S`, description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660011 | REPA DE: 750672`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DCL 052S`, slug: '3660011-dcl-052s', description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660011 | REPA DE: 750672`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660012-dcl-082s' },
        update: { title: `DCL 082S`, description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660012 | REPA DE: 750671`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DCL 082S`, slug: '3660012-dcl-082s', description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660012 | REPA DE: 750671`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3160549-dcl-053' },
        update: { title: `DCL 053`, description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3160549 | REPA DE: 750663`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DCL 053`, slug: '3160549-dcl-053', description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3160549 | REPA DE: 750663`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660013-dcl-083s' },
        update: { title: `DCL 083S`, description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660013 | REPA DE: 750670`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DCL 083S`, slug: '3660013-dcl-083s', description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660013 | REPA DE: 750670`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660014-dcl-163s' },
        update: { title: `DCL 163S`, description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660014 | REPA DE: LF3660014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DCL 163S`, slug: '3660014-dcl-163s', description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660014 | REPA DE: LF3660014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3660015-dcl-164s' },
        update: { title: `DCL 164S`, description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660015 | REPA DE: LF3660015`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `DCL 164S`, slug: '3660015-dcl-164s', description: `Series: ANTI-ACID DEHYDRATOR FILTERS DANFOSS | REPA IT: 3660015 | REPA DE: LF3660015`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3201025-391033' },
        update: { title: `3910/33`, description: `REPA IT: 3201025 | REPA DE: LF3201025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3910/33`, slug: '3201025-391033', description: `REPA IT: 3201025 | REPA DE: LF3201025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3201014-395022' },
        update: { title: `3950/22`, description: `REPA IT: 3201014 | REPA DE: 750070`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3950/22`, slug: '3201014-395022', description: `REPA IT: 3201014 | REPA DE: 750070`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3201016-395044' },
        update: { title: `3950/44`, description: `REPA IT: 3201016 | REPA DE: 750072`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3950/44`, slug: '3201016-395044', description: `REPA IT: 3201016 | REPA DE: 750072`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3201019-39402' },
        update: { title: `3940/2`, description: `REPA IT: 3201019 | REPA DE: 750417`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3940/2`, slug: '3201019-39402', description: `REPA IT: 3201019 | REPA DE: 750417`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3201039-39403' },
        update: { title: `3940/3`, description: `REPA IT: 3201039 | REPA DE: 750419`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3940/3`, slug: '3201039-39403', description: `REPA IT: 3201039 | REPA DE: 750419`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3201040-39404' },
        update: { title: `3940/4`, description: `REPA IT: 3201040 | REPA DE: 750421`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3940/4`, slug: '3201040-39404', description: `REPA IT: 3201040 | REPA DE: 750421`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3221467-sgn10' },
        update: { title: `SGN10`, description: `REPA IT: 3221467 | REPA DE: 750413`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SGN10`, slug: '3221467-sgn10', description: `REPA IT: 3221467 | REPA DE: 750413`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3221465-sgn10s' },
        update: { title: `SGN10S`, description: `REPA IT: 3221465 | REPA DE: 750066`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SGN10S`, slug: '3221465-sgn10s', description: `REPA IT: 3221465 | REPA DE: 750066`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-moisture-indicators-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3101001-sgn12s' },
        update: { title: `SGN12S`, description: `REPA IT: 3101001 | REPA DE: LF3101001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SGN12S`, slug: '3101001-sgn12s', description: `REPA IT: 3101001 | REPA DE: LF3101001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-humidity-indicators-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3101007-syj6' },
        update: { title: `SYJ6`, description: `REPA IT: 3101007 | REPA DE: LF3101007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SYJ6`, slug: '3101007-syj6', description: `REPA IT: 3101007 | REPA DE: LF3101007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-humidity-indicators-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3101008-syj10' },
        update: { title: `SYJ10`, description: `REPA IT: 3101008 | REPA DE: LF3101008`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SYJ10`, slug: '3101008-syj10', description: `REPA IT: 3101008 | REPA DE: LF3101008`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'filters-humidity-indicators-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3101006-syj16' },
        update: { title: `SYJ16`, description: `REPA IT: 3101006 | REPA DE: LF3101006`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `SYJ16`, slug: '3101006-syj16', description: `REPA IT: 3101006 | REPA DE: LF3101006`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-retention-valves-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150022-31322' },
        update: { title: `3132/2`, description: `REPA IT: 3150022 | REPA DE: 750561`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3132/2`, slug: '3150022-31322', description: `REPA IT: 3150022 | REPA DE: 750561`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-retention-valves-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150024-3132m12' },
        update: { title: `3132/M12`, description: `REPA IT: 3150024 | REPA DE: 750559`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3132/M12`, slug: '3150024-3132m12', description: `REPA IT: 3150024 | REPA DE: 750559`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-retention-valves-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150026-3132m18' },
        update: { title: `3132/M18`, description: `REPA IT: 3150026 | REPA DE: LF3150026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3132/M18`, slug: '3150026-3132m18', description: `REPA IT: 3150026 | REPA DE: LF3150026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-retention-valves-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150017-38m-12m' },
        update: { title: `3/8"M - 1/2"M`, description: `REPA IT: 3150017 | REPA DE: LF3150017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3/8"M - 1/2"M`, slug: '3150017-38m-12m', description: `REPA IT: 3150017 | REPA DE: LF3150017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-retention-valves-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150053-tub' },
        update: { title: `TUB`, description: `REPA IT: 3150053 | REPA DE: LF3150053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TUB`, slug: '3150053-tub', description: `REPA IT: 3150053 | REPA DE: LF3150053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-retention-valves-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150054-tub' },
        update: { title: `TUB`, description: `REPA IT: 3150054 | REPA DE: LF3150054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TUB`, slug: '3150054-tub', description: `REPA IT: 3150054 | REPA DE: LF3150054`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-retention-valves-castel' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150066-tub' },
        update: { title: `TUB`, description: `REPA IT: 3150066 | REPA DE: LF3150066`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TUB`, slug: '3150066-tub', description: `REPA IT: 3150066 | REPA DE: LF3150066`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5238770-td1' },
        update: { title: `TD1`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5238770 | REPA DE: LF5238770`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TD1`, slug: '5238770-td1', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5238770 | REPA DE: LF5238770`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5238772-td1' },
        update: { title: `TD1`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5238772 | REPA DE: LF5238772`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TD1`, slug: '5238772-td1', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5238772 | REPA DE: LF5238772`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150112-tn2' },
        update: { title: `TN2`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150112 | REPA DE: 750523`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TN2`, slug: '3150112-tn2', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150112 | REPA DE: 750523`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150113-ten2' },
        update: { title: `TEN2`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150113 | REPA DE: 750810`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TEN2`, slug: '3150113-ten2', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150113 | REPA DE: 750810`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150043-ts2' },
        update: { title: `TS2`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150043 | REPA DE: 750014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TS2`, slug: '3150043-ts2', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150043 | REPA DE: 750014`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150111-ts2' },
        update: { title: `TS2`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150111 | REPA DE: 750801`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TS2`, slug: '3150111-ts2', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150111 | REPA DE: 750801`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150163-tes2-nl' },
        update: { title: `TES2 NL`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150163 | REPA DE: LF3150163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TES2 NL`, slug: '3150163-tes2-nl', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150163 | REPA DE: LF3150163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150143-tes2' },
        update: { title: `TES2`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150143 | REPA DE: LF3150143`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TES2`, slug: '3150143-tes2', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150143 | REPA DE: LF3150143`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150110-tes2-nl' },
        update: { title: `TES2 NL`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150110 | REPA DE: LF3150110`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TES2 NL`, slug: '3150110-tes2-nl', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 3150110 | REPA DE: LF3150110`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5137654-t2' },
        update: { title: `T2`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5137654 | REPA DE: LF5137654`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `T2`, slug: '5137654-t2', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5137654 | REPA DE: LF5137654`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5133322-ts2' },
        update: { title: `TS2`, description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5133322 | REPA DE: 750521`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TS2`, slug: '5133322-ts2', description: `Series: THERMOSTATIC VALVES DANFOSS GAS R290 | REPA IT: 5133322 | REPA DE: 750521`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150046-00' },
        update: { title: `00`, description: `REPA IT: 3150046 | REPA DE: 750021`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `00`, slug: '3150046-00', description: `REPA IT: 3150046 | REPA DE: 750021`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150048-02' },
        update: { title: `02`, description: `REPA IT: 3150048 | REPA DE: 750023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `02`, slug: '3150048-02', description: `REPA IT: 3150048 | REPA DE: 750023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150050-04' },
        update: { title: `04`, description: `REPA IT: 3150050 | REPA DE: 750483`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `04`, slug: '3150050-04', description: `REPA IT: 3150050 | REPA DE: 750483`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150052-06' },
        update: { title: `06`, description: `REPA IT: 3150052 | REPA DE: 750485`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `06`, slug: '3150052-06', description: `REPA IT: 3150052 | REPA DE: 750485`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150135-00' },
        update: { title: `00`, description: `REPA IT: 3150135 | REPA DE: LF3150135`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `00`, slug: '3150135-00', description: `REPA IT: 3150135 | REPA DE: LF3150135`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150137-02' },
        update: { title: `02`, description: `REPA IT: 3150137 | REPA DE: LF3150137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `02`, slug: '3150137-02', description: `REPA IT: 3150137 | REPA DE: LF3150137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150138-04' },
        update: { title: `04`, description: `REPA IT: 3150138 | REPA DE: LF3150138`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `04`, slug: '3150138-04', description: `REPA IT: 3150138 | REPA DE: LF3150138`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150140-06' },
        update: { title: `06`, description: `REPA IT: 3150140 | REPA DE: LF3150140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `06`, slug: '3150140-06', description: `REPA IT: 3150140 | REPA DE: LF3150140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-nozzles-danfoss' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150142' },
        update: { title: `3150142`, description: `REPA IT: 3150142 | REPA DE: LF3150142`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150142`, slug: '3150142', description: `REPA IT: 3150142 | REPA DE: LF3150142`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5033701-amvx' },
        update: { title: `AMVX`, description: `REPA IT: 5033701 | REPA DE: 750445`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AMVX`, slug: '5033701-amvx', description: `REPA IT: 5033701 | REPA DE: 750445`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150116-tmv' },
        update: { title: `TMV`, description: `REPA IT: 3150116 | REPA DE: LF3150116`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TMV`, slug: '3150116-tmv', description: `REPA IT: 3150116 | REPA DE: LF3150116`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150038-tmv' },
        update: { title: `TMV`, description: `REPA IT: 3150038 | REPA DE: 750017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TMV`, slug: '3150038-tmv', description: `REPA IT: 3150038 | REPA DE: 750017`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150132-tmvx' },
        update: { title: `TMVX`, description: `REPA IT: 3150132 | REPA DE: LF3150132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `TMVX`, slug: '3150132-tmvx', description: `REPA IT: 3150132 | REPA DE: LF3150132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150120-vd-05' },
        update: { title: `VD 0.5`, description: `REPA IT: 3150120 | REPA DE: LF3150120`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VD 0.5`, slug: '3150120-vd-05', description: `REPA IT: 3150120 | REPA DE: LF3150120`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150122-vd-10' },
        update: { title: `VD 1.0`, description: `REPA IT: 3150122 | REPA DE: 750026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VD 1.0`, slug: '3150122-vd-10', description: `REPA IT: 3150122 | REPA DE: 750026`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150124-vd-20' },
        update: { title: `VD 2.0`, description: `REPA IT: 3150124 | REPA DE: LF3150124`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VD 2.0`, slug: '3150124-vd-20', description: `REPA IT: 3150124 | REPA DE: LF3150124`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150126-vd-30' },
        update: { title: `VD 3.0`, description: `REPA IT: 3150126 | REPA DE: LF3150126`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VD 3.0`, slug: '3150126-vd-30', description: `REPA IT: 3150126 | REPA DE: LF3150126`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-honeywell-amv' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150128-vd-45' },
        update: { title: `VD 4.5`, description: `REPA IT: 3150128 | REPA DE: LF3150128`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VD 4.5`, slug: '3150128-vd-45', description: `REPA IT: 3150128 | REPA DE: LF3150128`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150145-rfka03-34-21' },
        update: { title: `RFKA03-3.4-21`, description: `REPA IT: 3150145 | REPA DE: LF3150145`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKA03-3.4-21`, slug: '3150145-rfka03-34-21', description: `REPA IT: 3150145 | REPA DE: LF3150145`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150147-rfka04-40-23' },
        update: { title: `RFKA04-4.0-23`, description: `REPA IT: 3150147 | REPA DE: 750813`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKA04-4.0-23`, slug: '3150147-rfka04-40-23', description: `REPA IT: 3150147 | REPA DE: 750813`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150152-rfka04e-40-17' },
        update: { title: `RFKA04E-4.0-17`, description: `REPA IT: 3150152 | REPA DE: 750817`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKA04E-4.0-17`, slug: '3150152-rfka04e-40-17', description: `REPA IT: 3150152 | REPA DE: 750817`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120698-rfkh03-48-03' },
        update: { title: `RFKH03-4.8-03`, description: `REPA IT: 3120698 | REPA DE: LF3120698`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH03-4.8-03`, slug: '3120698-rfkh03-48-03', description: `REPA IT: 3120698 | REPA DE: LF3120698`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120699-rfkh03e-48-15-rfk-24074' },
        update: { title: `RFKH03E-4.8-15 RFK-24074`, description: `REPA IT: 3120699 | REPA DE: LF3120699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH03E-4.8-15 RFK-24074`, slug: '3120699-rfkh03e-48-15-rfk-24074', description: `REPA IT: 3120699 | REPA DE: LF3120699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120696-rfkh04e-29-17' },
        update: { title: `RFKH04E-2.9-17`, description: `REPA IT: 3120696 | REPA DE: LF3120696`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH04E-2.9-17`, slug: '3120696-rfkh04e-29-17', description: `REPA IT: 3120696 | REPA DE: LF3120696`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5238170-rfkh05e-76-36' },
        update: { title: `RFKH05E-7.6-36`, description: `REPA IT: 5238170 | REPA DE: LF5238170`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH05E-7.6-36`, slug: '5238170-rfkh05e-76-36', description: `REPA IT: 5238170 | REPA DE: LF5238170`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5238171-rfkh08e-61-47' },
        update: { title: `RFKH08E-6.1-47`, description: `REPA IT: 5238171 | REPA DE: LF5238171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH08E-6.1-47`, slug: '5238171-rfkh08e-61-47', description: `REPA IT: 5238171 | REPA DE: LF5238171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5238175-rfkh11e-45-53' },
        update: { title: `RFKH11E-4.5-53`, description: `REPA IT: 5238175 | REPA DE: LF5238175`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH11E-4.5-53`, slug: '5238175-rfkh11e-45-53', description: `REPA IT: 5238175 | REPA DE: LF5238175`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150154-rfkh11-45-321' },
        update: { title: `RFKH11-4.5-321`, description: `REPA IT: 3150154 | REPA DE: 750676`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH11-4.5-321`, slug: '3150154-rfkh11-45-321', description: `REPA IT: 3150154 | REPA DE: 750676`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5193163-rfkh20e-43-78' },
        update: { title: `RFKH20E-4.3-78`, description: `REPA IT: 5193163 | REPA DE: LF5193163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH20E-4.3-78`, slug: '5193163-rfkh20e-43-78', description: `REPA IT: 5193163 | REPA DE: LF5193163`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150164-rfkh-023-00' },
        update: { title: `RFKH-023-00`, description: `REPA IT: 3150164 | REPA DE: LF3150164`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH-023-00`, slug: '3150164-rfkh-023-00', description: `REPA IT: 3150164 | REPA DE: LF3150164`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150166-rfkh-023-02' },
        update: { title: `RFKH-023-02`, description: `REPA IT: 3150166 | REPA DE: LF3150166`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH-023-02`, slug: '3150166-rfkh-023-02', description: `REPA IT: 3150166 | REPA DE: LF3150166`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150168-rfkh-023-04' },
        update: { title: `RFKH-023-04`, description: `REPA IT: 3150168 | REPA DE: LF3150168`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH-023-04`, slug: '3150168-rfkh-023-04', description: `REPA IT: 3150168 | REPA DE: LF3150168`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-thermostatic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150170-rfkh-023-06' },
        update: { title: `RFKH-023-06`, description: `REPA IT: 3150170 | REPA DE: LF3150170`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFKH-023-06`, slug: '3150170-rfkh-023-06', description: `REPA IT: 3150170 | REPA DE: LF3150170`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-weld-adapters-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150181' },
        update: { title: `3150181`, description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150181 | REPA DE: LF3150181`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150181`, slug: '3150181', description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150181 | REPA DE: LF3150181`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-weld-adapters-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150226-rfgb06-035-522' },
        update: { title: `RFGB06-0.35-522`, description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150226 | REPA DE: LF3150226`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFGB06-0.35-522`, slug: '3150226-rfgb06-035-522', description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150226 | REPA DE: LF3150226`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-weld-adapters-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150229-rfgb06e-035-523' },
        update: { title: `RFGB06E-0.35-523`, description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150229 | REPA DE: LF3150229`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFGB06E-0.35-523`, slug: '3150229-rfgb06e-035-523', description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150229 | REPA DE: LF3150229`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-weld-adapters-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150231-rfgb06e-10-470' },
        update: { title: `RFGB06E-1.0-470`, description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150231 | REPA DE: LF3150231`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `RFGB06E-1.0-470`, slug: '3150231-rfgb06e-10-470', description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150231 | REPA DE: LF3150231`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-weld-adapters-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150209-e2v05z' },
        update: { title: `E2V05Z`, description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150209 | REPA DE: LF3150209`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `E2V05Z`, slug: '3150209-e2v05z', description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150209 | REPA DE: LF3150209`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-weld-adapters-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150207-e2v11z' },
        update: { title: `E2V11Z`, description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150207 | REPA DE: LF3150207`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `E2V11Z`, slug: '3150207-e2v11z', description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150207 | REPA DE: LF3150207`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-weld-adapters-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150206-e2v18z' },
        update: { title: `E2V18Z`, description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150206 | REPA DE: LF3150206`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `E2V18Z`, slug: '3150206-e2v18z', description: `Series: THERMOSTATIC VALVES SANHUA - R290 | REPA IT: 3150206 | REPA DE: LF3150206`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150215' },
        update: { title: `3150215`, description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150215 | REPA DE: LF3150215`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150215`, slug: '3150215', description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150215 | REPA DE: LF3150215`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150214' },
        update: { title: `3150214`, description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150214 | REPA DE: LF3150214`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150214`, slug: '3150214', description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150214 | REPA DE: LF3150214`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150212' },
        update: { title: `3150212`, description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150212 | REPA DE: LF3150212`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150212`, slug: '3150212', description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150212 | REPA DE: LF3150212`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150219-akv-10p2' },
        update: { title: `AKV 10P2`, description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150219 | REPA DE: LF3150219`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AKV 10P2`, slug: '3150219-akv-10p2', description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150219 | REPA DE: LF3150219`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150221-akv-10p4' },
        update: { title: `AKV 10P4`, description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150221 | REPA DE: LF3150221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `AKV 10P4`, slug: '3150221-akv-10p4', description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150221 | REPA DE: LF3150221`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120208' },
        update: { title: `3120208`, description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3120208 | REPA DE: LF3120208`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3120208`, slug: '3120208', description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3120208 | REPA DE: LF3120208`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150224' },
        update: { title: `3150224`, description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150224 | REPA DE: LF3150224`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150224`, slug: '3150224', description: `Series: ELECTRONIC VALVES CAREL - SPARE PARTS | REPA IT: 3150224 | REPA DE: LF3150224`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150194-lpf08d-003' },
        update: { title: `LPF08D-003`, description: `REPA IT: 3150194 | REPA DE: LF3150194`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LPF08D-003`, slug: '3150194-lpf08d-003', description: `REPA IT: 3150194 | REPA DE: LF3150194`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150197-lpf10d-004' },
        update: { title: `LPF10D-004`, description: `REPA IT: 3150197 | REPA DE: LF3150197`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LPF10D-004`, slug: '3150197-lpf10d-004', description: `REPA IT: 3150197 | REPA DE: LF3150197`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150217-lpf18d-003' },
        update: { title: `LPF18D-003`, description: `REPA IT: 3150217 | REPA DE: LF3150217`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LPF18D-003`, slug: '3150217-lpf18d-003', description: `REPA IT: 3150217 | REPA DE: LF3150217`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150201' },
        update: { title: `3150201`, description: `REPA IT: 3150201 | REPA DE: LF3150201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150201`, slug: '3150201', description: `REPA IT: 3150201 | REPA DE: LF3150201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3150200' },
        update: { title: `3150200`, description: `REPA IT: 3150200 | REPA DE: LF3150200`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3150200`, slug: '3150200', description: `REPA IT: 3150200 | REPA DE: LF3150200`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3397254' },
        update: { title: `3397254`, description: `REPA IT: 3397254 | REPA DE: LF3397254`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3397254`, slug: '3397254', description: `REPA IT: 3397254 | REPA DE: LF3397254`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3397255' },
        update: { title: `3397255`, description: `REPA IT: 3397255 | REPA DE: LF3397255`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3397255`, slug: '3397255', description: `REPA IT: 3397255 | REPA DE: LF3397255`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'valves-electronic-valves-sanhua' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3120747' },
        update: { title: `3120747`, description: `REPA IT: 3120747 | REPA DE: LF3120747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3120747`, slug: '3120747', description: `REPA IT: 3120747 | REPA DE: LF3120747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'liquid-receivers' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3370001' },
        update: { title: `3370001`, description: `Series: LIQUID RECEIVERS | REPA IT: 3370001 | REPA DE: LF3370001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3370001`, slug: '3370001', description: `Series: LIQUID RECEIVERS | REPA IT: 3370001 | REPA DE: LF3370001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3370005' },
        update: { title: `3370005`, description: `Series: TAPS ROTALOCK | REPA IT: 3370005 | REPA DE: LF3370005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3370005`, slug: '3370005', description: `Series: TAPS ROTALOCK | REPA IT: 3370005 | REPA DE: LF3370005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348912-607223m10' },
        update: { title: `6072/23M10`, description: `Series: TAPS ROTALOCK | REPA IT: 3348912 | REPA DE: LF3348912`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6072/23M10`, slug: '3348912-607223m10', description: `Series: TAPS ROTALOCK | REPA IT: 3348912 | REPA DE: LF3348912`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348901-64102' },
        update: { title: `6410/2`, description: `REPA IT: 3348901 | REPA DE: 750552`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6410/2`, slug: '3348901-64102', description: `REPA IT: 3348901 | REPA DE: 750552`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348903-64104' },
        update: { title: `6410/4`, description: `REPA IT: 3348903 | REPA DE: 750554`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6410/4`, slug: '3348903-64104', description: `REPA IT: 3348903 | REPA DE: 750554`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348906-6420m10' },
        update: { title: `6420/M10`, description: `REPA IT: 3348906 | REPA DE: 750556`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6420/M10`, slug: '3348906-6420m10', description: `REPA IT: 3348906 | REPA DE: 750556`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348908-64205' },
        update: { title: `6420/5`, description: `REPA IT: 3348908 | REPA DE: LF3348908`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6420/5`, slug: '3348908-64205', description: `REPA IT: 3348908 | REPA DE: LF3348908`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348910-6420m22' },
        update: { title: `6420/M22`, description: `REPA IT: 3348910 | REPA DE: LF3348910`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6420/M22`, slug: '3348910-6420m22', description: `REPA IT: 3348910 | REPA DE: LF3348910`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348916-6570m10' },
        update: { title: `6570/M10`, description: `REPA IT: 3348916 | REPA DE: 750535`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6570/M10`, slug: '3348916-6570m10', description: `REPA IT: 3348916 | REPA DE: 750535`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348918-65705' },
        update: { title: `6570/5`, description: `REPA IT: 3348918 | REPA DE: 750537`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6570/5`, slug: '3348918-65705', description: `REPA IT: 3348918 | REPA DE: 750537`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'gas-taps-and-accessories' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3348920-65707' },
        update: { title: `6570/7`, description: `REPA IT: 3348920 | REPA DE: LF3348920`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `6570/7`, slug: '3348920-65707', description: `REPA IT: 3348920 | REPA DE: LF3348920`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'capillaries-capillaries' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046013' },
        update: { title: `3046013`, description: `REPA IT: 3046013 | REPA DE: 696968`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046013`, slug: '3046013', description: `REPA IT: 3046013 | REPA DE: 696968`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'capillaries-capillaries' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046014' },
        update: { title: `3046014`, description: `REPA IT: 3046014 | REPA DE: 694843`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046014`, slug: '3046014', description: `REPA IT: 3046014 | REPA DE: 694843`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'capillaries-capillaries' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046015' },
        update: { title: `3046015`, description: `REPA IT: 3046015 | REPA DE: 696778`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046015`, slug: '3046015', description: `REPA IT: 3046015 | REPA DE: 696778`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'capillaries-capillaries' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046025-kk2l25' },
        update: { title: `KK2L25`, description: `REPA IT: 3046025 | REPA DE: LF3046025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `KK2L25`, slug: '3046025-kk2l25', description: `REPA IT: 3046025 | REPA DE: LF3046025`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046016' },
        update: { title: `3046016`, description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3046016 | REPA DE: LF3046016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046016`, slug: '3046016', description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3046016 | REPA DE: LF3046016`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449168' },
        update: { title: `3449168`, description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449168 | REPA DE: LF3449168`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449168`, slug: '3449168', description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449168 | REPA DE: LF3449168`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046019' },
        update: { title: `3046019`, description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3046019 | REPA DE: LF3046019`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046019`, slug: '3046019', description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3046019 | REPA DE: LF3046019`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449601' },
        update: { title: `3449601`, description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449601 | REPA DE: LF3449601`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449601`, slug: '3449601', description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449601 | REPA DE: LF3449601`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449603' },
        update: { title: `3449603`, description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449603 | REPA DE: LF3449603`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449603`, slug: '3449603', description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449603 | REPA DE: LF3449603`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449605' },
        update: { title: `3449605`, description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449605 | REPA DE: LF3449605`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449605`, slug: '3449605', description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449605 | REPA DE: LF3449605`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449192' },
        update: { title: `3449192`, description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449192 | REPA DE: LF3449192`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449192`, slug: '3449192', description: `Series: REFRIGERATION CAPILLARY TUBE | REPA IT: 3449192 | REPA DE: LF3449192`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449296' },
        update: { title: `3449296`, description: `Series: INSULATED COPPER PIPE | REPA IT: 3449296 | REPA DE: 694750`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449296`, slug: '3449296', description: `Series: INSULATED COPPER PIPE | REPA IT: 3449296 | REPA DE: 694750`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449198' },
        update: { title: `3449198`, description: `Series: INSULATED COPPER PIPE | REPA IT: 3449198 | REPA DE: LF3449198`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449198`, slug: '3449198', description: `Series: INSULATED COPPER PIPE | REPA IT: 3449198 | REPA DE: LF3449198`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046049' },
        update: { title: `3046049`, description: `Series: INSULATED COPPER PIPE | REPA IT: 3046049 | REPA DE: LF3046049`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046049`, slug: '3046049', description: `Series: INSULATED COPPER PIPE | REPA IT: 3046049 | REPA DE: LF3046049`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'vibration-isolators-for-copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046003-vtg12' },
        update: { title: `VTG12`, description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046003 | REPA DE: LF3046003`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VTG12`, slug: '3046003-vtg12', description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046003 | REPA DE: LF3046003`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'vibration-isolators-for-copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046005-vtg18' },
        update: { title: `VTG18`, description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046005 | REPA DE: LF3046005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VTG18`, slug: '3046005-vtg18', description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046005 | REPA DE: LF3046005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'vibration-isolators-for-copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046007-vtg28' },
        update: { title: `VTG28`, description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046007 | REPA DE: LF3046007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VTG28`, slug: '3046007-vtg28', description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046007 | REPA DE: LF3046007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'vibration-isolators-for-copper-pipes' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046009-vtg42' },
        update: { title: `VTG42`, description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046009 | REPA DE: LF3046009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VTG42`, slug: '3046009-vtg42', description: `Series: VIBRATION ISOLATORS FOR COPPER PIPE | REPA IT: 3046009 | REPA DE: LF3046009`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449173-xg-09x012' },
        update: { title: `XG 09X012`, description: `REPA IT: 3449173 | REPA DE: LF3449173`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 09X012`, slug: '3449173-xg-09x012', description: `REPA IT: 3449173 | REPA DE: LF3449173`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449175-xg-09x018' },
        update: { title: `XG 09X018`, description: `REPA IT: 3449175 | REPA DE: LF3449175`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 09X018`, slug: '3449175-xg-09x018', description: `REPA IT: 3449175 | REPA DE: LF3449175`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449177-xg-13x010' },
        update: { title: `XG 13X010`, description: `REPA IT: 3449177 | REPA DE: LF3449177`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 13X010`, slug: '3449177-xg-13x010', description: `REPA IT: 3449177 | REPA DE: LF3449177`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449180-xg-13x018' },
        update: { title: `XG 13X018`, description: `REPA IT: 3449180 | REPA DE: LF3449180`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 13X018`, slug: '3449180-xg-13x018', description: `REPA IT: 3449180 | REPA DE: LF3449180`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3180026-xg-09x012e' },
        update: { title: `XG 09X012/E`, description: `REPA IT: 3180026 | REPA DE: 694747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 09X012/E`, slug: '3180026-xg-09x012e', description: `REPA IT: 3180026 | REPA DE: 694747`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3180028-xg-09x018e' },
        update: { title: `XG 09X018/E`, description: `REPA IT: 3180028 | REPA DE: LF3180028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 09X018/E`, slug: '3180028-xg-09x018e', description: `REPA IT: 3180028 | REPA DE: LF3180028`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3180029-xg-13x010e' },
        update: { title: `XG 13X010/E`, description: `REPA IT: 3180029 | REPA DE: LF3180029`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 13X010/E`, slug: '3180029-xg-13x010e', description: `REPA IT: 3180029 | REPA DE: LF3180029`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3180031-xg-13x015e' },
        update: { title: `XG 13X015/E`, description: `REPA IT: 3180031 | REPA DE: LF3180031`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 13X015/E`, slug: '3180031-xg-13x015e', description: `REPA IT: 3180031 | REPA DE: LF3180031`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'insulators-insulation-pipe-2-m-armacell' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449190-xg-13x022e' },
        update: { title: `XG 13X022/E`, description: `REPA IT: 3449190 | REPA DE: LF3449190`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `XG 13X022/E`, slug: '3449190-xg-13x022e', description: `REPA IT: 3449190 | REPA DE: LF3449190`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'mechanical-microswitches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5047787-ef831611' },
        update: { title: `EF83161.1`, description: `Series: MICROSWITCHES CROUZET SERIES V3-83161 WITH ACTUATOR | REPA IT: 5047787 | REPA DE: LF5047787`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `EF83161.1`, slug: '5047787-ef831611', description: `Series: MICROSWITCHES CROUZET SERIES V3-83161 WITH ACTUATOR | REPA IT: 5047787 | REPA DE: LF5047787`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'mechanical-microswitches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240355-d42x' },
        update: { title: `D42X`, description: `Series: MICROSWITCHES CROUZET SERIES V3-83161 WITH ACTUATOR | REPA IT: 3240355 | REPA DE: 347674`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `D42X`, slug: '3240355-d42x', description: `Series: MICROSWITCHES CROUZET SERIES V3-83161 WITH ACTUATOR | REPA IT: 3240355 | REPA DE: 347674`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'mechanical-microswitches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5061167-e65' },
        update: { title: `E65`, description: `Series: MICROSWITCHES CROUZET SERIES V3-83161 WITH ACTUATOR | REPA IT: 5061167 | REPA DE: LF5061167`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `E65`, slug: '5061167-e65', description: `Series: MICROSWITCHES CROUZET SERIES V3-83161 WITH ACTUATOR | REPA IT: 5061167 | REPA DE: LF5061167`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'mechanical-microswitches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1240120-mkv11d15' },
        update: { title: `MKV11D15`, description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 1240120 | REPA DE: 348145`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MKV11D15`, slug: '1240120-mkv11d15', description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 1240120 | REPA DE: 348145`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'mechanical-microswitches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '9240007-mkv11d30' },
        update: { title: `MKV11D30`, description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 9240007 | REPA DE: LF9240007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MKV11D30`, slug: '9240007-mkv11d30', description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 9240007 | REPA DE: LF9240007`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'mechanical-microswitches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3803136-mkv11d40' },
        update: { title: `MKV11D40`, description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 3803136 | REPA DE: LF3803136`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MKV11D40`, slug: '3803136-mkv11d40', description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 3803136 | REPA DE: LF3803136`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'mechanical-microswitches' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3240155-fr530-a' },
        update: { title: `FR530-A`, description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 3240155 | REPA DE: 345144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `FR530-A`, slug: '3240155-fr530-a', description: `Series: MICROSWITCHES PIZZATO SERIES MK | REPA IT: 3240155 | REPA DE: 345144`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compensation-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3526241-va-90' },
        update: { title: `VA 90`, description: `Series: COMPENSATION VALVES VA | REPA IT: 3526241 | REPA DE: LF3526241`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VA 90`, slug: '3526241-va-90', description: `Series: COMPENSATION VALVES VA | REPA IT: 3526241 | REPA DE: LF3526241`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compensation-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3526800-minielebar-tn' },
        update: { title: `MINIELEBAR TN`, description: `Series: COMPENSATION VALVES VA | REPA IT: 3526800 | REPA DE: 750332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `MINIELEBAR TN`, slug: '3526800-minielebar-tn', description: `Series: COMPENSATION VALVES VA | REPA IT: 3526800 | REPA DE: 750332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'compensation-valves' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3526801-elebar-tn' },
        update: { title: `ELEBAR TN`, description: `Series: COMPENSATION VALVES VA | REPA IT: 3526801 | REPA DE: 750327`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `ELEBAR TN`, slug: '3526801-elebar-tn', description: `Series: COMPENSATION VALVES VA | REPA IT: 3526801 | REPA DE: 750327`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3526812' },
        update: { title: `3526812`, description: `REPA IT: 3526812 | REPA DE: 750340`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3526812`, slug: '3526812', description: `REPA IT: 3526812 | REPA DE: 750340`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394112' },
        update: { title: `3394112`, description: `REPA IT: 3394112 | REPA DE: LF3394112`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394112`, slug: '3394112', description: `REPA IT: 3394112 | REPA DE: LF3394112`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5146198' },
        update: { title: `5146198`, description: `REPA IT: 5146198 | REPA DE: LF5146198`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5146198`, slug: '5146198', description: `REPA IT: 5146198 | REPA DE: LF5146198`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349514' },
        update: { title: `3349514`, description: `REPA IT: 3349514 | REPA DE: LF3349514`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349514`, slug: '3349514', description: `REPA IT: 3349514 | REPA DE: LF3349514`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349515' },
        update: { title: `3349515`, description: `REPA IT: 3349515 | REPA DE: LF3349515`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349515`, slug: '3349515', description: `REPA IT: 3349515 | REPA DE: LF3349515`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349647' },
        update: { title: `3349647`, description: `REPA IT: 3349647 | REPA DE: LF3349647`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349647`, slug: '3349647', description: `REPA IT: 3349647 | REPA DE: LF3349647`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3528042' },
        update: { title: `3528042`, description: `REPA IT: 3528042 | REPA DE: LF3528042`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3528042`, slug: '3528042', description: `REPA IT: 3528042 | REPA DE: LF3528042`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349516' },
        update: { title: `3349516`, description: `REPA IT: 3349516 | REPA DE: LF3349516`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349516`, slug: '3349516', description: `REPA IT: 3349516 | REPA DE: LF3349516`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349673' },
        update: { title: `3349673`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349673 | REPA DE: LF3349673`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349673`, slug: '3349673', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349673 | REPA DE: LF3349673`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349669' },
        update: { title: `3349669`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349669 | REPA DE: LF3349669`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349669`, slug: '3349669', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349669 | REPA DE: LF3349669`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5148741' },
        update: { title: `5148741`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5148741 | REPA DE: 750581`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5148741`, slug: '5148741', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5148741 | REPA DE: 750581`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349672' },
        update: { title: `3349672`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349672 | REPA DE: LF3349672`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349672`, slug: '3349672', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349672 | REPA DE: LF3349672`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349525' },
        update: { title: `3349525`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349525 | REPA DE: 750573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349525`, slug: '3349525', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349525 | REPA DE: 750573`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5166217' },
        update: { title: `5166217`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5166217 | REPA DE: LF5166217`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5166217`, slug: '5166217', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5166217 | REPA DE: LF5166217`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5166219' },
        update: { title: `5166219`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5166219 | REPA DE: LF5166219`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5166219`, slug: '5166219', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5166219 | REPA DE: LF5166219`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5166220' },
        update: { title: `5166220`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5166220 | REPA DE: LF5166220`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5166220`, slug: '5166220', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5166220 | REPA DE: LF5166220`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349438' },
        update: { title: `3349438`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349438 | REPA DE: LF3349438`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349438`, slug: '3349438', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349438 | REPA DE: LF3349438`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349678' },
        update: { title: `3349678`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349678 | REPA DE: LF3349678`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3349678`, slug: '3349678', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 3349678 | REPA DE: LF3349678`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5146199' },
        update: { title: `5146199`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5146199 | REPA DE: LF5146199`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5146199`, slug: '5146199', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5146199 | REPA DE: LF5146199`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5146201' },
        update: { title: `5146201`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5146201 | REPA DE: LF5146201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5146201`, slug: '5146201', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5146201 | REPA DE: LF5146201`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5129171-loktool-mb-10' },
        update: { title: `LOKTOOL MB 10`, description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5129171 | REPA DE: LF5129171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LOKTOOL MB 10`, slug: '5129171-loktool-mb-10', description: `Series: VULKAN LOKRING STRAIGHT BRASS CONNECTORS - TYPE 00 | REPA IT: 5129171 | REPA DE: LF5129171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394264-lokprep-65g' },
        update: { title: `LOKPREP 65G`, description: `Series: VULKAN LOKRING ASSEMBLY TOOLS | REPA IT: 3394264 | REPA DE: 890053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LOKPREP 65G`, slug: '3394264-lokprep-65g', description: `Series: VULKAN LOKRING ASSEMBLY TOOLS | REPA IT: 3394264 | REPA DE: 890053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3508022-lokpress-mini-bc-eu' },
        update: { title: `LOKPRESS Mini BC EU`, description: `Series: VULKAN LOKRING ASSEMBLY TOOLS | REPA IT: 3508022 | REPA DE: LF3508022`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `LOKPRESS Mini BC EU`, slug: '3508022-lokpress-mini-bc-eu', description: `Series: VULKAN LOKRING ASSEMBLY TOOLS | REPA IT: 3508022 | REPA DE: LF3508022`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3349600-starter-kit-sk-ra-01' },
        update: { title: `STARTER KIT SK-RA-01`, description: `Series: VULKAN LOKRING ASSEMBLY TOOLS | REPA IT: 3349600 | REPA DE: 890287`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `STARTER KIT SK-RA-01`, slug: '3349600-starter-kit-sk-ra-01', description: `Series: VULKAN LOKRING ASSEMBLY TOOLS | REPA IT: 3349600 | REPA DE: 890287`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3505095' },
        update: { title: `3505095`, description: `REPA IT: 3505095 | REPA DE: LF3505095`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3505095`, slug: '3505095', description: `REPA IT: 3505095 | REPA DE: LF3505095`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3388004' },
        update: { title: `3388004`, description: `REPA IT: 3388004 | REPA DE: LF3388004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3388004`, slug: '3388004', description: `REPA IT: 3388004 | REPA DE: LF3388004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394114' },
        update: { title: `3394114`, description: `REPA IT: 3394114 | REPA DE: 802237`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394114`, slug: '3394114', description: `REPA IT: 3394114 | REPA DE: 802237`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394290' },
        update: { title: `3394290`, description: `REPA IT: 3394290 | REPA DE: LF3394290`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394290`, slug: '3394290', description: `REPA IT: 3394290 | REPA DE: LF3394290`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394132' },
        update: { title: `3394132`, description: `REPA IT: 3394132 | REPA DE: LF3394132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394132`, slug: '3394132', description: `REPA IT: 3394132 | REPA DE: LF3394132`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394288' },
        update: { title: `3394288`, description: `REPA IT: 3394288 | REPA DE: LF3394288`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394288`, slug: '3394288', description: `REPA IT: 3394288 | REPA DE: LF3394288`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394293' },
        update: { title: `3394293`, description: `REPA IT: 3394293 | REPA DE: LF3394293`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394293`, slug: '3394293', description: `REPA IT: 3394293 | REPA DE: LF3394293`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394292' },
        update: { title: `3394292`, description: `REPA IT: 3394292 | REPA DE: LF3394292`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394292`, slug: '3394292', description: `REPA IT: 3394292 | REPA DE: LF3394292`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394294' },
        update: { title: `3394294`, description: `REPA IT: 3394294 | REPA DE: LF3394294`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394294`, slug: '3394294', description: `REPA IT: 3394294 | REPA DE: LF3394294`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394133' },
        update: { title: `3394133`, description: `REPA IT: 3394133 | REPA DE: LF3394133`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394133`, slug: '3394133', description: `REPA IT: 3394133 | REPA DE: LF3394133`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394146' },
        update: { title: `3394146`, description: `REPA IT: 3394146 | REPA DE: LF3394146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394146`, slug: '3394146', description: `REPA IT: 3394146 | REPA DE: LF3394146`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3505225' },
        update: { title: `3505225`, description: `REPA IT: 3505225 | REPA DE: LF3505225`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3505225`, slug: '3505225', description: `REPA IT: 3505225 | REPA DE: LF3505225`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394134' },
        update: { title: `3394134`, description: `REPA IT: 3394134 | REPA DE: LF3394134`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394134`, slug: '3394134', description: `REPA IT: 3394134 | REPA DE: LF3394134`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394289' },
        update: { title: `3394289`, description: `REPA IT: 3394289 | REPA DE: LF3394289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394289`, slug: '3394289', description: `REPA IT: 3394289 | REPA DE: LF3394289`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394139' },
        update: { title: `3394139`, description: `REPA IT: 3394139 | REPA DE: LF3394139`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394139`, slug: '3394139', description: `REPA IT: 3394139 | REPA DE: LF3394139`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394137' },
        update: { title: `3394137`, description: `REPA IT: 3394137 | REPA DE: LF3394137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394137`, slug: '3394137', description: `REPA IT: 3394137 | REPA DE: LF3394137`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394299' },
        update: { title: `3394299`, description: `REPA IT: 3394299 | REPA DE: LF3394299`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394299`, slug: '3394299', description: `REPA IT: 3394299 | REPA DE: LF3394299`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394140' },
        update: { title: `3394140`, description: `REPA IT: 3394140 | REPA DE: LF3394140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394140`, slug: '3394140', description: `REPA IT: 3394140 | REPA DE: LF3394140`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394135' },
        update: { title: `3394135`, description: `REPA IT: 3394135 | REPA DE: LF3394135`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394135`, slug: '3394135', description: `REPA IT: 3394135 | REPA DE: LF3394135`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240325' },
        update: { title: `5240325`, description: `REPA IT: 5240325 | REPA DE: LF5240325`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5240325`, slug: '5240325', description: `REPA IT: 5240325 | REPA DE: LF5240325`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240327' },
        update: { title: `5240327`, description: `REPA IT: 5240327 | REPA DE: LF5240327`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5240327`, slug: '5240327', description: `REPA IT: 5240327 | REPA DE: LF5240327`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3786286' },
        update: { title: `3786286`, description: `REPA IT: 3786286 | REPA DE: LF3786286`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3786286`, slug: '3786286', description: `REPA IT: 3786286 | REPA DE: LF3786286`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3786461' },
        update: { title: `3786461`, description: `REPA IT: 3786461 | REPA DE: LF3786461`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3786461`, slug: '3786461', description: `REPA IT: 3786461 | REPA DE: LF3786461`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3093005' },
        update: { title: `3093005`, description: `REPA IT: 3093005 | REPA DE: LF3093005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3093005`, slug: '3093005', description: `REPA IT: 3093005 | REPA DE: LF3093005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240330' },
        update: { title: `5240330`, description: `REPA IT: 5240330 | REPA DE: LF5240330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5240330`, slug: '5240330', description: `REPA IT: 5240330 | REPA DE: LF5240330`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240332' },
        update: { title: `5240332`, description: `REPA IT: 5240332 | REPA DE: LF5240332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5240332`, slug: '5240332', description: `REPA IT: 5240332 | REPA DE: LF5240332`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394066' },
        update: { title: `3394066`, description: `REPA IT: 3394066 | REPA DE: LF3394066`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394066`, slug: '3394066', description: `REPA IT: 3394066 | REPA DE: LF3394066`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394064' },
        update: { title: `3394064`, description: `REPA IT: 3394064 | REPA DE: LF3394064`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394064`, slug: '3394064', description: `REPA IT: 3394064 | REPA DE: LF3394064`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5146681' },
        update: { title: `5146681`, description: `REPA IT: 5146681 | REPA DE: LF5146681`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5146681`, slug: '5146681', description: `REPA IT: 5146681 | REPA DE: LF5146681`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5061727' },
        update: { title: `5061727`, description: `REPA IT: 5061727 | REPA DE: LF5061727`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5061727`, slug: '5061727', description: `REPA IT: 5061727 | REPA DE: LF5061727`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3092417' },
        update: { title: `3092417`, description: `REPA IT: 3092417 | REPA DE: LF3092417`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3092417`, slug: '3092417', description: `REPA IT: 3092417 | REPA DE: LF3092417`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239693' },
        update: { title: `5239693`, description: `REPA IT: 5239693 | REPA DE: LF5239693`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5239693`, slug: '5239693', description: `REPA IT: 5239693 | REPA DE: LF5239693`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239695' },
        update: { title: `5239695`, description: `REPA IT: 5239695 | REPA DE: LF5239695`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5239695`, slug: '5239695', description: `REPA IT: 5239695 | REPA DE: LF5239695`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239697' },
        update: { title: `5239697`, description: `REPA IT: 5239697 | REPA DE: LF5239697`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5239697`, slug: '5239697', description: `REPA IT: 5239697 | REPA DE: LF5239697`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239699' },
        update: { title: `5239699`, description: `REPA IT: 5239699 | REPA DE: LF5239699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5239699`, slug: '5239699', description: `REPA IT: 5239699 | REPA DE: LF5239699`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239701' },
        update: { title: `5239701`, description: `REPA IT: 5239701 | REPA DE: LF5239701`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5239701`, slug: '5239701', description: `REPA IT: 5239701 | REPA DE: LF5239701`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5239704' },
        update: { title: `5239704`, description: `REPA IT: 5239704 | REPA DE: LF5239704`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5239704`, slug: '5239704', description: `REPA IT: 5239704 | REPA DE: LF5239704`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449170' },
        update: { title: `3449170`, description: `Series: CAPILLARIES | REPA IT: 3449170 | REPA DE: 696904`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449170`, slug: '3449170', description: `Series: CAPILLARIES | REPA IT: 3449170 | REPA DE: 696904`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449168-1' },
        update: { title: `3449168`, description: `Series: CAPILLARIES | REPA IT: 3449168 | REPA DE: LF3449168`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449168`, slug: '3449168-1', description: `Series: CAPILLARIES | REPA IT: 3449168 | REPA DE: LF3449168`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449169' },
        update: { title: `3449169`, description: `Series: CAPILLARIES | REPA IT: 3449169 | REPA DE: LF3449169`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449169`, slug: '3449169', description: `Series: CAPILLARIES | REPA IT: 3449169 | REPA DE: LF3449169`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046030' },
        update: { title: `3046030`, description: `Series: CAPILLARIES | REPA IT: 3046030 | REPA DE: LF3046030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046030`, slug: '3046030', description: `Series: CAPILLARIES | REPA IT: 3046030 | REPA DE: LF3046030`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3350922' },
        update: { title: `3350922`, description: `Series: CAPILLARIES | REPA IT: 3350922 | REPA DE: LF3350922`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3350922`, slug: '3350922', description: `Series: CAPILLARIES | REPA IT: 3350922 | REPA DE: LF3350922`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394378' },
        update: { title: `3394378`, description: `Series: CAPILLARIES | REPA IT: 3394378 | REPA DE: LF3394378`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394378`, slug: '3394378', description: `Series: CAPILLARIES | REPA IT: 3394378 | REPA DE: LF3394378`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3350036' },
        update: { title: `3350036`, description: `Series: CAPILLARIES | REPA IT: 3350036 | REPA DE: LF3350036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3350036`, slug: '3350036', description: `Series: CAPILLARIES | REPA IT: 3350036 | REPA DE: LF3350036`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394505' },
        update: { title: `3394505`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394505 | REPA DE: LF3394505`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394505`, slug: '3394505', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394505 | REPA DE: LF3394505`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394091' },
        update: { title: `3394091`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394091 | REPA DE: LF3394091`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394091`, slug: '3394091', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394091 | REPA DE: LF3394091`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394933' },
        update: { title: `3394933`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394933 | REPA DE: LF3394933`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394933`, slug: '3394933', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394933 | REPA DE: LF3394933`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394284' },
        update: { title: `3394284`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394284 | REPA DE: LF3394284`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394284`, slug: '3394284', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394284 | REPA DE: LF3394284`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394161' },
        update: { title: `3394161`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394161 | REPA DE: LF3394161`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394161`, slug: '3394161', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394161 | REPA DE: LF3394161`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394391' },
        update: { title: `3394391`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394391 | REPA DE: LF3394391`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394391`, slug: '3394391', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394391 | REPA DE: LF3394391`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394171' },
        update: { title: `3394171`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394171 | REPA DE: LF3394171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394171`, slug: '3394171', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394171 | REPA DE: LF3394171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394162' },
        update: { title: `3394162`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394162 | REPA DE: LF3394162`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394162`, slug: '3394162', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394162 | REPA DE: LF3394162`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394224' },
        update: { title: `3394224`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394224 | REPA DE: LF3394224`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394224`, slug: '3394224', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394224 | REPA DE: LF3394224`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394932' },
        update: { title: `3394932`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394932 | REPA DE: LF3394932`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394932`, slug: '3394932', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394932 | REPA DE: LF3394932`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394164' },
        update: { title: `3394164`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394164 | REPA DE: LF3394164`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394164`, slug: '3394164', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394164 | REPA DE: LF3394164`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5137223' },
        update: { title: `5137223`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 5137223 | REPA DE: 541634`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5137223`, slug: '5137223', description: `Series: MEASURING INSTRUMENTS | REPA IT: 5137223 | REPA DE: 541634`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394415' },
        update: { title: `3394415`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394415 | REPA DE: LF3394415`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394415`, slug: '3394415', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3394415 | REPA DE: LF3394415`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3023345' },
        update: { title: `3023345`, description: `Series: MEASURING INSTRUMENTS | REPA IT: 3023345 | REPA DE: LF3023345`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3023345`, slug: '3023345', description: `Series: MEASURING INSTRUMENTS | REPA IT: 3023345 | REPA DE: LF3023345`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394903' },
        update: { title: `3394903`, description: `REPA IT: 3394903 | REPA DE: LF3394903`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394903`, slug: '3394903', description: `REPA IT: 3394903 | REPA DE: LF3394903`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394123' },
        update: { title: `3394123`, description: `REPA IT: 3394123 | REPA DE: LF3394123`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394123`, slug: '3394123', description: `REPA IT: 3394123 | REPA DE: LF3394123`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394124' },
        update: { title: `3394124`, description: `REPA IT: 3394124 | REPA DE: LF3394124`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394124`, slug: '3394124', description: `REPA IT: 3394124 | REPA DE: LF3394124`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394905' },
        update: { title: `3394905`, description: `REPA IT: 3394905 | REPA DE: 890304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394905`, slug: '3394905', description: `REPA IT: 3394905 | REPA DE: 890304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3032001' },
        update: { title: `3032001`, description: `REPA IT: 3032001 | REPA DE: 802232`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3032001`, slug: '3032001', description: `REPA IT: 3032001 | REPA DE: 802232`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394264' },
        update: { title: `3394264`, description: `REPA IT: 3394264 | REPA DE: 890053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394264`, slug: '3394264', description: `REPA IT: 3394264 | REPA DE: 890053`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3420013' },
        update: { title: `3420013`, description: `REPA IT: 3420013 | REPA DE: LF3420013`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3420013`, slug: '3420013', description: `REPA IT: 3420013 | REPA DE: LF3420013`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3420005' },
        update: { title: `3420005`, description: `Series: LEAK DETECTORS | REPA IT: 3420005 | REPA DE: 801911`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3420005`, slug: '3420005', description: `Series: LEAK DETECTORS | REPA IT: 3420005 | REPA DE: 801911`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3420007' },
        update: { title: `3420007`, description: `Series: LEAK DETECTORS | REPA IT: 3420007 | REPA DE: 802171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3420007`, slug: '3420007', description: `Series: LEAK DETECTORS | REPA IT: 3420007 | REPA DE: 802171`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394240' },
        update: { title: `3394240`, description: `Series: LEAK DETECTORS | REPA IT: 3394240 | REPA DE: LF3394240`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394240`, slug: '3394240', description: `Series: LEAK DETECTORS | REPA IT: 3394240 | REPA DE: LF3394240`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394174' },
        update: { title: `3394174`, description: `Series: LEAK DETECTORS | REPA IT: 3394174 | REPA DE: 802234`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394174`, slug: '3394174', description: `Series: LEAK DETECTORS | REPA IT: 3394174 | REPA DE: 802234`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394176' },
        update: { title: `3394176`, description: `Series: LEAK DETECTORS | REPA IT: 3394176 | REPA DE: LF3394176`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394176`, slug: '3394176', description: `Series: LEAK DETECTORS | REPA IT: 3394176 | REPA DE: LF3394176`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394239' },
        update: { title: `3394239`, description: `Series: LEAK DETECTORS | REPA IT: 3394239 | REPA DE: LF3394239`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394239`, slug: '3394239', description: `Series: LEAK DETECTORS | REPA IT: 3394239 | REPA DE: LF3394239`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5420005' },
        update: { title: `5420005`, description: `Series: LEAK DETECTORS | REPA IT: 5420005 | REPA DE: LF5420005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5420005`, slug: '5420005', description: `Series: LEAK DETECTORS | REPA IT: 5420005 | REPA DE: LF5420005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5420001' },
        update: { title: `5420001`, description: `Series: LEAK DETECTORS | REPA IT: 5420001 | REPA DE: LF5420001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5420001`, slug: '5420001', description: `Series: LEAK DETECTORS | REPA IT: 5420001 | REPA DE: LF5420001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5420004' },
        update: { title: `5420004`, description: `Series: LEAK DETECTORS | REPA IT: 5420004 | REPA DE: LF5420004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5420004`, slug: '5420004', description: `Series: LEAK DETECTORS | REPA IT: 5420004 | REPA DE: LF5420004`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394119' },
        update: { title: `3394119`, description: `Series: LEAK DETECTORS | REPA IT: 3394119 | REPA DE: LF3394119`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394119`, slug: '3394119', description: `Series: LEAK DETECTORS | REPA IT: 3394119 | REPA DE: LF3394119`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394157' },
        update: { title: `3394157`, description: `Series: LEAK DETECTORS | REPA IT: 3394157 | REPA DE: LF3394157`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394157`, slug: '3394157', description: `Series: LEAK DETECTORS | REPA IT: 3394157 | REPA DE: LF3394157`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235280' },
        update: { title: `5235280`, description: `Series: LEAK DETECTORS | REPA IT: 5235280 | REPA DE: LF5235280`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5235280`, slug: '5235280', description: `Series: LEAK DETECTORS | REPA IT: 5235280 | REPA DE: LF5235280`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394108' },
        update: { title: `3394108`, description: `Series: PRESSURE GAUGES | REPA IT: 3394108 | REPA DE: LF3394108`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394108`, slug: '3394108', description: `Series: PRESSURE GAUGES | REPA IT: 3394108 | REPA DE: LF3394108`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394107' },
        update: { title: `3394107`, description: `Series: PRESSURE GAUGES | REPA IT: 3394107 | REPA DE: LF3394107`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394107`, slug: '3394107', description: `Series: PRESSURE GAUGES | REPA IT: 3394107 | REPA DE: LF3394107`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3245023' },
        update: { title: `3245023`, description: `Series: PRESSURE GAUGES | REPA IT: 3245023 | REPA DE: LF3245023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3245023`, slug: '3245023', description: `Series: PRESSURE GAUGES | REPA IT: 3245023 | REPA DE: LF3245023`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394089' },
        update: { title: `3394089`, description: `Series: PRESSURE GAUGES | REPA IT: 3394089 | REPA DE: LF3394089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394089`, slug: '3394089', description: `Series: PRESSURE GAUGES | REPA IT: 3394089 | REPA DE: LF3394089`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394304' },
        update: { title: `3394304`, description: `Series: PRESSURE GAUGES | REPA IT: 3394304 | REPA DE: LF3394304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394304`, slug: '3394304', description: `Series: PRESSURE GAUGES | REPA IT: 3394304 | REPA DE: LF3394304`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394334' },
        update: { title: `3394334`, description: `Series: PRESSURE GAUGES | REPA IT: 3394334 | REPA DE: LF3394334`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394334`, slug: '3394334', description: `Series: PRESSURE GAUGES | REPA IT: 3394334 | REPA DE: LF3394334`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3245037' },
        update: { title: `3245037`, description: `Series: PRESSURE GAUGES | REPA IT: 3245037 | REPA DE: 800310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3245037`, slug: '3245037', description: `Series: PRESSURE GAUGES | REPA IT: 3245037 | REPA DE: 800310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394308' },
        update: { title: `3394308`, description: `Series: PRESSURE GAUGES | REPA IT: 3394308 | REPA DE: LF3394308`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394308`, slug: '3394308', description: `Series: PRESSURE GAUGES | REPA IT: 3394308 | REPA DE: LF3394308`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3245024' },
        update: { title: `3245024`, description: `Series: ACCESSORIES | REPA IT: 3245024 | REPA DE: LF3245024`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3245024`, slug: '3245024', description: `Series: ACCESSORIES | REPA IT: 3245024 | REPA DE: LF3245024`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449902' },
        update: { title: `3449902`, description: `Series: ACCESSORIES | REPA IT: 3449902 | REPA DE: LF3449902`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449902`, slug: '3449902', description: `Series: ACCESSORIES | REPA IT: 3449902 | REPA DE: LF3449902`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449077' },
        update: { title: `3449077`, description: `Series: ACCESSORIES | REPA IT: 3449077 | REPA DE: LF3449077`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449077`, slug: '3449077', description: `Series: ACCESSORIES | REPA IT: 3449077 | REPA DE: LF3449077`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449068' },
        update: { title: `3449068`, description: `Series: ACCESSORIES | REPA IT: 3449068 | REPA DE: LF3449068`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449068`, slug: '3449068', description: `Series: ACCESSORIES | REPA IT: 3449068 | REPA DE: LF3449068`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449075' },
        update: { title: `3449075`, description: `Series: ACCESSORIES | REPA IT: 3449075 | REPA DE: LF3449075`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449075`, slug: '3449075', description: `Series: ACCESSORIES | REPA IT: 3449075 | REPA DE: LF3449075`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3786284' },
        update: { title: `3786284`, description: `Series: ACCESSORIES | REPA IT: 3786284 | REPA DE: 800374`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3786284`, slug: '3786284', description: `Series: ACCESSORIES | REPA IT: 3786284 | REPA DE: 800374`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3245027' },
        update: { title: `3245027`, description: `Series: ACCESSORIES | REPA IT: 3245027 | REPA DE: LF3245027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3245027`, slug: '3245027', description: `Series: ACCESSORIES | REPA IT: 3245027 | REPA DE: LF3245027`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394310' },
        update: { title: `3394310`, description: `Series: ACCESSORIES | REPA IT: 3394310 | REPA DE: LF3394310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394310`, slug: '3394310', description: `Series: ACCESSORIES | REPA IT: 3394310 | REPA DE: LF3394310`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3786822' },
        update: { title: `3786822`, description: `Series: ACCESSORIES | REPA IT: 3786822 | REPA DE: LF3786822`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3786822`, slug: '3786822', description: `Series: ACCESSORIES | REPA IT: 3786822 | REPA DE: LF3786822`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394116' },
        update: { title: `3394116`, description: `Series: ACCESSORIES | REPA IT: 3394116 | REPA DE: 107947`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394116`, slug: '3394116', description: `Series: ACCESSORIES | REPA IT: 3394116 | REPA DE: 107947`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394249' },
        update: { title: `3394249`, description: `Series: ACCESSORIES | REPA IT: 3394249 | REPA DE: LF3394249`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394249`, slug: '3394249', description: `Series: ACCESSORIES | REPA IT: 3394249 | REPA DE: LF3394249`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449099' },
        update: { title: `3449099`, description: `Series: ACCESSORIES | REPA IT: 3449099 | REPA DE: LF3449099`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449099`, slug: '3449099', description: `Series: ACCESSORIES | REPA IT: 3449099 | REPA DE: LF3449099`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449080' },
        update: { title: `3449080`, description: `Series: ACCESSORIES | REPA IT: 3449080 | REPA DE: LF3449080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449080`, slug: '3449080', description: `Series: ACCESSORIES | REPA IT: 3449080 | REPA DE: LF3449080`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3449069' },
        update: { title: `3449069`, description: `Series: ACCESSORIES | REPA IT: 3449069 | REPA DE: LF3449069`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3449069`, slug: '3449069', description: `Series: ACCESSORIES | REPA IT: 3449069 | REPA DE: LF3449069`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394095' },
        update: { title: `3394095`, description: `Series: ACCESSORIES | REPA IT: 3394095 | REPA DE: LF3394095`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394095`, slug: '3394095', description: `Series: ACCESSORIES | REPA IT: 3394095 | REPA DE: LF3394095`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3529901-pf80vr1' },
        update: { title: `PF80/VR1`, description: `Series: VACUUM METERS | REPA IT: 3529901 | REPA DE: LF3529901`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `PF80/VR1`, slug: '3529901-pf80vr1', description: `Series: VACUUM METERS | REPA IT: 3529901 | REPA DE: LF3529901`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394241-bl80vr1k1' },
        update: { title: `BL80/VR1/K1`, description: `Series: VACUUM METERS | REPA IT: 3394241 | REPA DE: LF3394241`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `BL80/VR1/K1`, slug: '3394241-bl80vr1k1', description: `Series: VACUUM METERS | REPA IT: 3394241 | REPA DE: LF3394241`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394079-vg64' },
        update: { title: `VG64`, description: `Series: VACUUM METERS | REPA IT: 3394079 | REPA DE: LF3394079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `VG64`, slug: '3394079-vg64', description: `Series: VACUUM METERS | REPA IT: 3394079 | REPA DE: LF3394079`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3122644' },
        update: { title: `3122644`, description: `Series: VACUUM METERS | REPA IT: 3122644 | REPA DE: 801999`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3122644`, slug: '3122644', description: `Series: VACUUM METERS | REPA IT: 3122644 | REPA DE: 801999`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3425001' },
        update: { title: `3425001`, description: `Series: VACUUM METERS | REPA IT: 3425001 | REPA DE: LF3425001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3425001`, slug: '3425001', description: `Series: VACUUM METERS | REPA IT: 3425001 | REPA DE: LF3425001`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394070' },
        update: { title: `3394070`, description: `Series: VACUUM METERS | REPA IT: 3394070 | REPA DE: LF3394070`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394070`, slug: '3394070', description: `Series: VACUUM METERS | REPA IT: 3394070 | REPA DE: LF3394070`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5240321' },
        update: { title: `5240321`, description: `Series: VACUUM METERS | REPA IT: 5240321 | REPA DE: LF5240321`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5240321`, slug: '5240321', description: `Series: VACUUM METERS | REPA IT: 5240321 | REPA DE: LF5240321`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235744' },
        update: { title: `5235744`, description: `Series: VACUUM METERS | REPA IT: 5235744 | REPA DE: LF5235744`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5235744`, slug: '5235744', description: `Series: VACUUM METERS | REPA IT: 5235744 | REPA DE: LF5235744`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394077' },
        update: { title: `3394077`, description: `Series: VACUUM METERS | REPA IT: 3394077 | REPA DE: LF3394077`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394077`, slug: '3394077', description: `Series: VACUUM METERS | REPA IT: 3394077 | REPA DE: LF3394077`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3180121' },
        update: { title: `3180121`, description: `Series: VACUUM METERS | REPA IT: 3180121 | REPA DE: LF3180121`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3180121`, slug: '3180121', description: `Series: VACUUM METERS | REPA IT: 3180121 | REPA DE: LF3180121`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394383' },
        update: { title: `3394383`, description: `Series: GAS RECOVERY UNITS | REPA IT: 3394383 | REPA DE: LF3394383`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394383`, slug: '3394383', description: `Series: GAS RECOVERY UNITS | REPA IT: 3394383 | REPA DE: LF3394383`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394266' },
        update: { title: `3394266`, description: `Series: GAS RECOVERY UNITS | REPA IT: 3394266 | REPA DE: LF3394266`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394266`, slug: '3394266', description: `Series: GAS RECOVERY UNITS | REPA IT: 3394266 | REPA DE: LF3394266`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3394348' },
        update: { title: `3394348`, description: `Series: GAS RECOVERY UNITS | REPA IT: 3394348 | REPA DE: LF3394348`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3394348`, slug: '3394348', description: `Series: GAS RECOVERY UNITS | REPA IT: 3394348 | REPA DE: LF3394348`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3405002' },
        update: { title: `3405002`, description: `Series: GAS RECOVERY UNITS | REPA IT: 3405002 | REPA DE: LF3405002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3405002`, slug: '3405002', description: `Series: GAS RECOVERY UNITS | REPA IT: 3405002 | REPA DE: LF3405002`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '1017901' },
        update: { title: `1017901`, description: `Series: GAS RECOVERY UNITS | REPA IT: 1017901 | REPA DE: LF1017901`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `1017901`, slug: '1017901', description: `Series: GAS RECOVERY UNITS | REPA IT: 1017901 | REPA DE: LF1017901`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3017005' },
        update: { title: `3017005`, description: `Series: GAS RECOVERY UNITS | REPA IT: 3017005 | REPA DE: LF3017005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3017005`, slug: '3017005', description: `Series: GAS RECOVERY UNITS | REPA IT: 3017005 | REPA DE: LF3017005`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5154224' },
        update: { title: `5154224`, description: `Series: GAS RECOVERY UNITS | REPA IT: 5154224 | REPA DE: LF5154224`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5154224`, slug: '5154224', description: `Series: GAS RECOVERY UNITS | REPA IT: 5154224 | REPA DE: LF5154224`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'refrigeration-tools' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '5235885' },
        update: { title: `5235885`, description: `Series: GAS RECOVERY UNITS | REPA IT: 5235885 | REPA DE: 776354`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `5235885`, slug: '5235885', description: `Series: GAS RECOVERY UNITS | REPA IT: 5235885 | REPA DE: 776354`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'hvac-hvac' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3391100' },
        update: { title: `3391100`, description: `REPA IT: 3391100 | REPA DE: LF3391100`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3391100`, slug: '3391100', description: `REPA IT: 3391100 | REPA DE: LF3391100`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'hvac-hvac' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3445678' },
        update: { title: `3445678`, description: `REPA IT: 3445678 | REPA DE: LF3445678`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3445678`, slug: '3445678', description: `REPA IT: 3445678 | REPA DE: LF3445678`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'hvac-hvac' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3122649' },
        update: { title: `3122649`, description: `REPA IT: 3122649 | REPA DE: LF3122649`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3122649`, slug: '3122649', description: `REPA IT: 3122649 | REPA DE: LF3122649`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }
  {
    const cat = await prisma.category.findUnique({ where: { slug: 'hvac-hvac' } });
    if (cat) {
      await prisma.product.upsert({
        where: { slug: '3046049-1' },
        update: { title: `3046049`, description: `REPA IT: 3046049 | REPA DE: LF3046049`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
        create: { title: `3046049`, slug: '3046049-1', description: `REPA IT: 3046049 | REPA DE: LF3046049`, price: 0, images: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600'], categoryId: cat.id },
      });
    }
  }

  await applyScrapedProductImages();
  console.log(`Products seeded: ${1041}`);
  console.log('Done.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
