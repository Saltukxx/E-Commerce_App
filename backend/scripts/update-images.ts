/**
 * update-images.ts
 *
 * Reads the scraped image-results.json and bulk-updates product image URLs
 * in the database via Prisma. Matches on the REPA IT code stored in the
 * product description.
 *
 * HOW TO RUN (after scrape-images.ts has finished):
 *   cd backend
 *   npx ts-node --transpile-only scripts/update-images.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_PATH = path.resolve(__dirname, 'image-results.json');
const MANUAL_IMAGE_OVERRIDES: Record<string, string> = {
  // The scraper did not return an image for L30HL; use the matching Cubigel L-series compressor image.
  '3070371':
    'https://www.amifrigo.com/media/catalog/product/cache/1/image/650x/040ec09b1e35df139433887a97daa66f/l/-/l-compressor_1_1_2_1.png',
};

interface ScrapeResult {
  repaItCode: string;
  model: string;
  imageUrl: string | null;
  productUrl?: string | null;
  status: 'found' | 'not_found' | 'error';
}

async function main() {
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error('image-results.json not found. Run scrape-images.ts first.');
    process.exit(1);
  }

  const results: ScrapeResult[] = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
  const found = results.filter((r) => (r.status === 'found' && r.imageUrl) || MANUAL_IMAGE_OVERRIDES[r.repaItCode]);

  console.log(`Loaded ${results.length} results. ${found.length} have images.`);

  const prisma = new PrismaClient();

  let updated = 0;
  let unchanged = 0;
  let notMatched = 0;

  for (const result of found) {
    const imageUrl = MANUAL_IMAGE_OVERRIDES[result.repaItCode] ?? result.imageUrl;
    if (!imageUrl) continue;

    // Products are keyed by REPA IT code stored in description as "REPA IT: XXXXXXX"
    const products = await prisma.product.findMany({
      where: {
        description: { contains: `REPA IT: ${result.repaItCode}` },
      },
    });

    if (products.length === 0) {
      notMatched++;
      continue;
    }

    for (const product of products) {
      if (product.images.length === 1 && product.images[0] === imageUrl) {
        unchanged++;
        continue;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { images: [imageUrl] },
      });

      updated++;

      if (updated % 50 === 0) {
        console.log(`  Updated ${updated} products so far...`);
      }
    }
  }

  await prisma.$disconnect();

  console.log('\n════════════════════════════════');
  console.log(`  Updated   : ${updated} products`);
  console.log(`  Unchanged : ${unchanged} products`);
  console.log(`  Not found : ${notMatched} (no DB match)`);
  console.log('════════════════════════════════');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
