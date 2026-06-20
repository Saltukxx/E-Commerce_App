/**
 * verify-drc-images.ts
 *
 * Checks product ↔ image alignment across catalog JSON, local files, and DB.
 *
 * Usage:
 *   cd backend
 *   npx ts-node --transpile-only scripts/verify-drc-images.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  UPLOADS_DIR,
  loadCatalog,
  localImageFilename,
  productSlugFromSku,
} from './drc-utils';
import { resolveStoreId } from './resolve-store';

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function findLocalFile(sku: string): string | null {
  for (const ext of EXTENSIONS) {
    const filename = localImageFilename(sku, ext);
    const full = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(full) && fs.statSync(full).size >= 2048) return filename;
  }
  return null;
}

function imageUrlMatchesSku(imageUrl: string | undefined, sku: string): boolean {
  if (!imageUrl) return false;
  const lower = imageUrl.toLowerCase();
  const safe = sku.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  return lower.includes(safe.toLowerCase()) || EXTENSIONS.some((ext) => lower.includes(`${safe}${ext}`));
}

async function main() {
  const catalog = loadCatalog();
  const prisma = new PrismaClient();
  const storeId = await resolveStoreId(prisma);

  const dbProducts = await prisma.product.findMany({
    where: { storeId },
    select: { slug: true, title: true, images: true },
  });

  // Build slug → DB row (slug is from SKU)
  const dbBySlug = new Map(dbProducts.map((p) => [p.slug, p]));

  let catalogHasUrl = 0;
  let localOk = 0;
  let localMissing = 0;
  let dbOk = 0;
  let dbMissing = 0;
  let dbMismatch = 0;
  let slugMissingInDb = 0;

  const missingLocal: string[] = [];
  const missingDbImage: string[] = [];
  const dbImageMismatch: string[] = [];
  const notInDb: string[] = [];

  for (const product of catalog.products) {
    const slug = productSlugFromSku(product.sku, product.productSlug);
    if (product.imageUrl) catalogHasUrl++;

    const localFile = findLocalFile(product.sku);
    if (localFile) {
      localOk++;
    } else {
      localMissing++;
      if (missingLocal.length < 20) missingLocal.push(product.sku);
    }

    const dbRow = dbBySlug.get(slug);
    if (!dbRow) {
      slugMissingInDb++;
      if (notInDb.length < 10) notInDb.push(`${product.sku} (${slug})`);
      continue;
    }

    const dbImage = dbRow.images[0];
    if (!dbImage) {
      dbMissing++;
      if (missingDbImage.length < 20) missingDbImage.push(product.sku);
    } else if (localFile && !dbImage.includes(localFile.replace(/\\/g, '/'))) {
      // DB should reference the local filename
      const base = path.basename(localFile);
      if (!dbImage.includes(base)) {
        dbMismatch++;
        if (dbImageMismatch.length < 20) {
          dbImageMismatch.push(`${product.sku}: db=${dbImage.slice(0, 80)} local=${base}`);
        }
      } else {
        dbOk++;
      }
    } else if (localFile) {
      dbOk++;
    } else if (dbImage) {
      // remote or old path still set
      dbOk++;
    }
  }

  // Sample: compare catalog imageUrl host vs DB path for 5 random products
  const samples = catalog.products.filter((p) => p.imageUrl).slice(0, 5);
  console.log('=== Sample spot-check (catalog URL → local file → DB) ===\n');
  for (const p of samples) {
    const slug = productSlugFromSku(p.sku, p.productSlug);
    const local = findLocalFile(p.sku);
    const db = dbBySlug.get(slug);
    console.log(`SKU: ${p.sku}`);
    console.log(`  Title: ${p.title.slice(0, 60)}...`);
    console.log(`  Catalog URL: ${p.imageUrl?.slice(0, 70)}...`);
    console.log(`  Local file:  ${local ?? 'MISSING'}`);
    console.log(`  DB image:    ${db?.images[0] ?? 'MISSING'}`);
    console.log('');
  }

  console.log('=== Summary ===\n');
  console.log(`Catalog products:        ${catalog.products.length}`);
  console.log(`With image URL in API:   ${catalogHasUrl}`);
  console.log(`Local file present:      ${localOk}`);
  console.log(`Local file MISSING:      ${localMissing}`);
  console.log(`In DB with matching img: ${dbOk}`);
  console.log(`In DB, no image:         ${dbMissing}`);
  console.log(`In DB, path mismatch:    ${dbMismatch}`);
  console.log(`Catalog SKU not in DB:   ${slugMissingInDb}`);
  console.log(`DB products total:       ${dbProducts.length}`);

  if (missingLocal.length) {
    console.log('\nMissing local (first 20 SKUs):', missingLocal.join(', '));
  }
  if (missingDbImage.length) {
    console.log('\nDB missing image (first 20):', missingDbImage.join(', '));
  }
  if (dbImageMismatch.length) {
    console.log('\nDB/local mismatch samples:');
    dbImageMismatch.forEach((line) => console.log(`  ${line}`));
  }

  const pass =
    localMissing === 0 &&
    dbMissing === 0 &&
    dbMismatch === 0 &&
    slugMissingInDb === 0 &&
    dbProducts.length === catalog.products.length;

  console.log(pass ? '\n✓ PASS — products and images align.' : '\n✗ ISSUES found — see above.');
  await prisma.$disconnect();
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
