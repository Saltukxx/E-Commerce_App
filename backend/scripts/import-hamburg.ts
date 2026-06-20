/**
 * import-hamburg.ts
 *
 * Reads HamburgDepo_Stoklu_Urunler_08052026.xlsx and upserts all products
 * (with their categories) into the Prisma/PostgreSQL database.
 *
 * HOW TO RUN:
 *   cd backend
 *   npm install xlsx          # if not already installed
 *   npx ts-node --transpile-only scripts/import-hamburg.ts
 *
 * BEHAVIOUR:
 *   - Categories  → upsert by slug  (create if missing, skip if exists)
 *   - Products    → upsert by id    (create if missing, update price/title/etc. if exists)
 *   - Price       → stored as euro-cents  (Sale € × 100, rounded to nearest cent)
 *   - Slug        → URL-safe title + "-" + DB#  (guaranteed unique)
 *   - Images      → left unchanged on update; set to [] on first create
 */

import 'dotenv/config';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { resolveStoreId } from './resolve-store';

// ─── Config ───────────────────────────────────────────────────────────────────

const EXCEL_PATH = path.resolve(
  __dirname,
  '../../HamburgDepo_Stoklu_Urunler_08052026.xlsx',
);
const SHEET_NAME = 'Tüm Stoklu Ürünler';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert any string to a URL-safe slug */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

/** Euros → integer cents */
function toCents(eur: number): number {
  return Math.round((eur || 0) * 100);
}

/** Build a category slug from its name */
function categorySlug(name: string): string {
  return slugify(name).substring(0, 60);
}

/** Default placeholder image per category (feel free to extend) */
const CATEGORY_IMAGES: Record<string, string> = {
  'kompresörler':         'https://placehold.co/400x300?text=Kompres%C3%B6r',
  'kompresör > scroll':   'https://placehold.co/400x300?text=Scroll+Kompres%C3%B6r',
  'kondenser üniteleri':  'https://placehold.co/400x300?text=Kondenser',
  'evaporatörler':        'https://placehold.co/400x300?text=Evaparat%C3%B6r',
  'soğutma grupları':     'https://placehold.co/400x300?text=So%C4%9Futma+Grubu',
  'soğutma yağları':      'https://placehold.co/400x300?text=Ya%C4%9F',
  'elektronik kontrolörler': 'https://placehold.co/400x300?text=Kontrolor',
  'genleşme vanaları':    'https://placehold.co/400x300?text=Vana',
  'fan motorları':        'https://placehold.co/400x300?text=Fan+Motoru',
  'klima sistemleri':     'https://placehold.co/400x300?text=Klima',
  'soğutucu akışkanlar':  'https://placehold.co/400x300?text=Gaz',
  'likit tanklar':        'https://placehold.co/400x300?text=Tank',
  'panel':                'https://placehold.co/400x300?text=Panel',
  'buzdolapları ve vitrinler': 'https://placehold.co/400x300?text=Buzdolabi',
  'soğuk oda kapıları':   'https://placehold.co/400x300?text=Kapi',
  'soğuk oda aksesuarları': 'https://placehold.co/400x300?text=Aksesuar',
  'izolasyonlu borular':  'https://placehold.co/400x300?text=Boru',
  'izolasyonlar ve bantlar': 'https://placehold.co/400x300?text=Izolasyon',
  'vanalar ve regülatörler': 'https://placehold.co/400x300?text=Vana',
  'pompa ve drenaj':      'https://placehold.co/400x300?text=Pompa',
  'elektrik malzemeleri': 'https://placehold.co/400x300?text=Elektrik',
  'hat aksesuarları':     'https://placehold.co/400x300?text=Aksesuar',
  'filtreler & kurutucular': 'https://placehold.co/400x300?text=Filtre',
};

function categoryImage(name: string): string {
  const key = name.toLowerCase();
  return CATEGORY_IMAGES[key] ?? 'https://placehold.co/400x300?text=Urun';
}

// ─── Parse Excel ──────────────────────────────────────────────────────────────

function parseExcel(): HamburgRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[SHEET_NAME];
  if (!ws) throw new Error(`Sheet "${SHEET_NAME}" not found in workbook`);

  // sheet_to_json skips the first 3 rows automatically because they have no header
  // We tell it the header row is row 4 (index 3)
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    range: 3, // start from row 4 (0-indexed = 3) which is the header row
  });

  const rows: HamburgRow[] = [];

  for (const r of raw) {
    const dbId = Number(r['DB#']);
    if (!dbId || isNaN(dbId)) continue;

    const title = String(r['Ürün Adı'] ?? '').trim();
    if (!title) continue;

    const saleEur = Number(r['Sale (€)'] ?? 0);
    // Skip products with no sale price (shouldn't happen in this file but just in case)
    if (!saleEur || saleEur <= 0) continue;

    rows.push({
      dbId,
      brand:        String(r['Marka'] ?? '').trim(),
      categoryName: String(r['Kategori'] ?? 'Diğer').trim(),
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[1/2] Reading Excel file...');
  const rows = parseExcel();
  console.log(`    Found ${rows.length} products with prices.\n`);

  const prisma = new PrismaClient();
  const storeId = await resolveStoreId(prisma);
  const storeSlug = process.env.STORE_SLUG?.trim() || 'durmusbaba';
  console.log(`    Target store: ${storeSlug} (id=${storeId})\n`);

  // ── Step 1: Upsert Categories ──────────────────────────────────────────────
  console.log('[2/3] Upserting categories...');

  const uniqueCategories = Array.from(new Set(rows.map((r) => r.categoryName)));
  const categoryIdMap = new Map<string, number>(); // categoryName → DB id

  for (const name of uniqueCategories) {
    const slug = categorySlug(name);
    const category = await prisma.category.upsert({
      where:  { slug },
      update: {}, // don't overwrite existing name/image
      create: {
        name,
        slug,
        image: categoryImage(name),
      },
    });
    categoryIdMap.set(name, category.id);
    console.log(`    ✓ Category "${name}" → id=${category.id}`);
  }

  console.log(`\n    ${uniqueCategories.length} categories ready.\n`);

  // ── Step 2: Upsert Products ────────────────────────────────────────────────
  console.log('[3/3] Upserting products...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const categoryId = categoryIdMap.get(row.categoryName);
    if (!categoryId) {
      console.warn(`    ⚠ Skipping "${row.title}" — category not found`);
      skipped++;
      continue;
    }

    const slug      = `${slugify(row.title)}-${row.dbId}`;
    const priceInt  = toCents(row.saleEur);
    const description = [
      row.brand ? `Marka: ${row.brand}` : null,
      `Birim: ${row.unit}`,
      row.stock ? `Stok: ${row.stock} ${row.unit}` : null,
      row.costEur ? `Maliyet: €${row.costEur.toFixed(2)}` : null,
      row.listEur ? `Liste Fiyatı: €${row.listEur.toFixed(2)}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const existing = await prisma.product.findUnique({ where: { id: row.dbId } });

    if (existing) {
      // Update title, price, description, category — but leave images untouched
      await prisma.product.update({
        where: { id: row.dbId },
        data: {
          title:       row.title,
          slug,
          description,
          price:       priceInt,
          categoryId,
          storeId,
          status:      'active',
        },
      });
      updated++;
    } else {
      // Create with explicit id so it matches the Hamburg DB#
      await prisma.product.create({
        data: {
          id:          row.dbId,
          title:       row.title,
          slug,
          description,
          price:       priceInt,
          images:      [],
          categoryId,
          storeId,
          status:      'active',
        },
      });
      created++;
    }

    if ((created + updated + skipped) % 20 === 0) {
      console.log(`    … ${created + updated + skipped} / ${rows.length} done`);
    }
  }

  await prisma.$disconnect();

  console.log('\n======================================');
  console.log(`  Created : ${created} products`);
  console.log(`  Updated : ${updated} products`);
  console.log(`  Skipped : ${skipped} products`);
  console.log('======================================');
  console.log('\nDone! Run the backend and check the product list.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
