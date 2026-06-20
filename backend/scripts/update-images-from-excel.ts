/**
 * update-images-from-excel.ts
 *
 * Reads urunler_mit_bildern_DE.xlsx (produced by fetch_images.py),
 * matches each product to the database by title (case-insensitive),
 * and sets the images[] field to the public URL of the uploaded image.
 *
 * HOW TO RUN (after images are uploaded to the server):
 *   cd backend
 *   SERVER_URL=http://167.172.168.81:3001 npx ts-node --transpile-only scripts/update-images-from-excel.ts
 *
 * Images must be accessible at:
 *   <SERVER_URL>/uploads/products/<ITEM-XXXXX>.jpg
 */

import 'dotenv/config';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const EXCEL_PATH = path.resolve(
  __dirname,
  '../../export/urunler_mit_bildern_DE.xlsx',
);

const SERVER_URL = (process.env.SERVER_URL || 'http://167.172.168.81:3001').replace(/\/$/, '');

interface ExcelRow {
  lagercode: string;
  titleTr: string;
  titleDe: string;
  imgFile: string;
  status: string;
}

function parseExcel(): ExcelRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets['Produkte DE'] || wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  const rows: ExcelRow[] = [];
  for (const r of raw) {
    const imgFile = String(r['Bild-Datei'] ?? '').trim();
    const status  = String(r['Status'] ?? '').trim();
    if (!imgFile || !['ok', 'cached'].includes(status)) continue;
    rows.push({
      lagercode: String(r['Lagercode'] ?? '').trim(),
      titleTr:   String(r['Artikel (TR)'] ?? '').trim(),
      titleDe:   String(r['Artikel (DE)'] ?? '').trim(),
      imgFile,
      status,
    });
  }
  return rows;
}

async function main() {
  console.log('[1/3] Reading Excel...');
  const rows = parseExcel();
  console.log('      ' + rows.length + ' products with images.\n');

  const prisma = new PrismaClient();

  console.log('[2/3] Loading products from database...');
  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true },
  });
  const byTitle = new Map(
    allProducts.map((p) => [p.title.toLowerCase().trim(), p]),
  );
  console.log('      ' + allProducts.length + ' products loaded.\n');

  console.log('[3/3] Updating image URLs...');
  let updated = 0;
  let notFound = 0;

  for (const row of rows) {
    const filename = path.basename(row.imgFile);
    const imageUrl = SERVER_URL + '/uploads/products/' + filename;

    // Match by Turkish title first, then German title
    const product =
      byTitle.get(row.titleTr.toLowerCase().trim()) ||
      byTitle.get(row.titleDe.toLowerCase().trim());

    if (!product) {
      console.log('  [NOT FOUND] ' + row.titleTr.substring(0, 60));
      notFound++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data:  { images: [imageUrl] },
    });

    console.log('  [OK] ' + product.title.substring(0, 55) + ' -> ' + filename);
    updated++;
  }

  await prisma.$disconnect();

  console.log('\n======================================');
  console.log('  Updated   : ' + updated);
  console.log('  Not found : ' + notFound);
  console.log('======================================');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
