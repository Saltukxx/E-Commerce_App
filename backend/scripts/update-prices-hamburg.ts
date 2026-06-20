/**
 * update-prices-hamburg.ts
 *
 * Reads HamburgDepo_Stoklu_Urunler_08052026.xlsx and updates product prices
 * in the database. Matching strategy (in order):
 *   1. Exact ID match (DB#)
 *   2. Exact title match
 *   3. Case-insensitive title match
 * If no match found, the product is created as new.
 *
 * HOW TO RUN:
 *   cd backend
 *   npx ts-node --transpile-only scripts/update-prices-hamburg.ts
 */

import 'dotenv/config';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { resolveStoreId } from './resolve-store';

const EXCEL_PATH = path.resolve(
  __dirname,
  '../HamburgDepo_Stoklu_Urunler_08052026.xlsx',
);
const SHEET_NAME = 'Tum Stoklu Urunler';

interface HamburgRow {
  dbId: number;
  brand: string;
  categoryName: string;
  title: string;
  unit: string;
  stock: number;
  costEur: number;
  saleEur: number;
  listEur: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function toCents(eur: number): number {
  return Math.round((eur || 0) * 100);
}

function categorySlug(name: string): string {
  return slugify(name).substring(0, 60);
}

function parseExcel(): HamburgRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);

  // Try both sheet name variants (with and without Turkish chars)
  const ws = wb.Sheets['Tum Stoklu Urunler'] ||
             wb.Sheets['Tüm Stoklu Ürünler'] ||
             wb.Sheets[wb.SheetNames[1]];

  if (!ws) throw new Error('Sheet not found. Available: ' + wb.SheetNames.join(', '));

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { range: 3 });

  const rows: HamburgRow[] = [];
  for (const r of raw) {
    const dbId = Number(r['DB#']);
    if (!dbId || isNaN(dbId)) continue;
    const title = String(r['Urun Adi'] ?? r['Ürün Adı'] ?? '').trim();
    if (!title) continue;
    const saleEur = Number(r['Sale (€)'] ?? r['Sale (EUR)'] ?? 0);
    if (!saleEur || saleEur <= 0) continue;

    rows.push({
      dbId,
      brand:        String(r['Marka'] ?? '').trim(),
      categoryName: String(r['Kategori'] ?? 'Diger').trim(),
      title,
      unit:         String(r['Birim'] ?? 'adet').trim(),
      stock:        Number(r['Stok'] ?? 0),
      costEur:      Number(r['Cost (€)'] ?? 0),
      saleEur,
      listEur:      Number(r['List (€)'] ?? 0),
    });
  }
  return rows;
}

async function main() {
  console.log('[1/3] Reading Excel...');
  const rows = parseExcel();
  console.log('      Found ' + rows.length + ' products with prices.\n');

  const prisma = new PrismaClient();
  const storeId = await resolveStoreId(prisma);
  console.log(`Target store id=${storeId}\n`);

  // Load existing products for this store
  console.log('[2/3] Loading existing products from database...');
  const allProducts = await prisma.product.findMany({
    where: { storeId },
    select: { id: true, title: true },
  });
  const byId    = new Map(allProducts.map((p) => [p.id, p]));
  const byTitle = new Map(allProducts.map((p) => [p.title.toLowerCase().trim(), p]));
  console.log('      ' + allProducts.length + ' products loaded.\n');

  // Upsert categories
  const categoryIdMap = new Map<string, number>();
  const uniqueCategories = Array.from(new Set(rows.map((r) => r.categoryName)));
  for (const name of uniqueCategories) {
    const slug = categorySlug(name);
    const cat = await prisma.category.upsert({
      where:  { slug },
      update: {},
      create: { name, slug, image: 'https://placehold.co/400x300?text=Urun' },
    });
    categoryIdMap.set(name, cat.id);
  }

  console.log('[3/3] Updating prices...');

  let matched = 0;
  let created = 0;
  let skipped = 0;

  const report: Array<{ title: string; matchType: string; oldPrice?: number; newPrice: number }> = [];

  for (const row of rows) {
    const newPriceCents = toCents(row.saleEur);
    const categoryId = categoryIdMap.get(row.categoryName)!;

    // --- Match strategy 1: exact ID ---
    if (byId.has(row.dbId)) {
      const existing = byId.get(row.dbId)!;
      const old = await prisma.product.findUnique({ where: { id: row.dbId }, select: { price: true } });
      await prisma.product.update({
        where: { id: row.dbId },
        data: { price: newPriceCents, categoryId },
      });
      report.push({ title: existing.title, matchType: 'ID', oldPrice: old?.price, newPrice: newPriceCents });
      matched++;
      continue;
    }

    // --- Match strategy 2: exact title (case-insensitive) ---
    const titleKey = row.title.toLowerCase().trim();
    if (byTitle.has(titleKey)) {
      const existing = byTitle.get(titleKey)!;
      const old = await prisma.product.findUnique({ where: { id: existing.id }, select: { price: true } });
      await prisma.product.update({
        where: { id: existing.id },
        data: { price: newPriceCents, categoryId },
      });
      report.push({ title: existing.title, matchType: 'Title', oldPrice: old?.price, newPrice: newPriceCents });
      matched++;
      continue;
    }

    // --- Match strategy 3: partial title (contains key words) ---
    const words = titleKey.split(' ').filter((w) => w.length > 4);
    let partialMatch = null;
    for (const [key, product] of byTitle.entries()) {
      const matchCount = words.filter((w) => key.includes(w)).length;
      if (matchCount >= 3) {
        partialMatch = product;
        break;
      }
    }

    if (partialMatch) {
      const old = await prisma.product.findUnique({ where: { id: partialMatch.id }, select: { price: true } });
      await prisma.product.update({
        where: { id: partialMatch.id },
        data: { price: newPriceCents, categoryId },
      });
      report.push({ title: partialMatch.title, matchType: 'Partial', oldPrice: old?.price, newPrice: newPriceCents });
      matched++;
      continue;
    }

    // --- No match: create new product ---
    const slug = slugify(row.title) + '-' + row.dbId;
    const description = [
      row.brand ? 'Marka: ' + row.brand : null,
      'Birim: ' + row.unit,
      row.stock ? 'Stok: ' + row.stock + ' ' + row.unit : null,
    ].filter(Boolean).join(' | ');

    await prisma.product.create({
      data: {
        id:          row.dbId,
        storeId,
        title:       row.title,
        slug,
        description,
        price:       newPriceCents,
        images:      [],
        categoryId,
      },
    }).catch(async () => {
      // ID conflict — create without explicit ID
      await prisma.product.create({
        data: {
          storeId,
          title:       row.title,
          slug:        slug + '-new',
          description,
          price:       newPriceCents,
          images:      [],
          categoryId,
        },
      });
    });

    report.push({ title: row.title, matchType: 'Created', newPrice: newPriceCents });
    created++;
  }

  await prisma.$disconnect();

  // Print report
  console.log('\n======================================');
  console.log('  Updated (matched) : ' + matched);
  console.log('  Created (new)     : ' + created);
  console.log('  Skipped           : ' + skipped);
  console.log('======================================\n');

  console.log('Match breakdown:');
  const byType = report.reduce<Record<string, number>>((acc, r) => {
    acc[r.matchType] = (acc[r.matchType] || 0) + 1;
    return acc;
  }, {});
  for (const [type, count] of Object.entries(byType)) {
    console.log('  ' + type + ': ' + count);
  }

  console.log('\nSample updates:');
  report.slice(0, 10).forEach((r) => {
    const oldStr = r.oldPrice != null ? 'EUR ' + (r.oldPrice / 100).toFixed(2) : 'none';
    const newStr = 'EUR ' + (r.newPrice / 100).toFixed(2);
    console.log('  [' + r.matchType + '] ' + r.title.substring(0, 50) + ' | ' + oldStr + ' -> ' + newStr);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
