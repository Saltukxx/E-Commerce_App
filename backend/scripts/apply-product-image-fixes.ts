/**
 * apply-product-image-fixes.ts
 *
 * Ensures each product's images[] points to the hosted upload URL for its Lagercode.
 * Run after fix-product-images.py and after syncing uploads/products to the server.
 *
 * Usage:
 *   cd backend
 *   DATABASE_URL=... SERVER_URL=http://167.172.168.81:3001 \
 *     npx ts-node --transpile-only scripts/apply-product-image-fixes.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const RESULTS_PATH = path.resolve(__dirname, 'image-fix-results.json');
const SERVER_URL = (process.env.SERVER_URL || 'http://167.172.168.81:3001').replace(/\/$/, '');

interface FixResult {
  lagercode: string;
  filename: string;
  titleDe?: string;
  status: string;
  imageUrl?: string;
}

function extractLagercode(description: string): string | null {
  const match = description.match(/Lagercode:\s*([A-Z0-9\-]+)/i);
  return match?.[1]?.trim() ?? null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error('image-fix-results.json not found. Run fix-product-images.py first.');
    process.exit(1);
  }

  const results: FixResult[] = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
  const byCode = new Map(
    results
      .filter((item) => item.status === 'ok' || item.status === 'skipped_existing')
      .map((item) => [item.lagercode.toUpperCase(), item]),
  );

  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({
    select: { id: true, title: true, description: true, images: true },
  });

  let updated = 0;
  let missing = 0;

  for (const product of products) {
    const code = extractLagercode(product.description);
    if (!code) continue;

    const fix = byCode.get(code.toUpperCase());
    if (!fix) {
      missing++;
      continue;
    }

    const imageUrl = fix.imageUrl || `${SERVER_URL}/uploads/products/${fix.filename}`;
    if (product.images.length === 1 && product.images[0] === imageUrl) {
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { images: [imageUrl] },
    });
    updated++;
    console.log(`  [OK] ${product.title.slice(0, 60)} -> ${fix.filename}`);
  }

  await prisma.$disconnect();

  console.log('\n======================================');
  console.log(`  Updated : ${updated}`);
  console.log(`  Missing : ${missing}`);
  console.log('======================================');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
