/**
 * Replace the product catalogue with the rows from an Excel file.
 *
 * Expected columns:
 *   Artikel, Marke, Kategorie, Bestand, Einkauf, Liste, Netto/Verkauf, Minimum, Lagercode
 *
 * Behaviour:
 *   - Upserts categories by slug.
 *   - Upserts products by stable Lagercode slug.
 *   - Uses Liste as the only customer-facing sale price stored in Product.price.
 *   - Keeps only customer-safe catalogue text in Product.description.
 *   - Keeps images on matching products.
 *   - Deletes products whose Lagercode slug is not present in the file.
 *   - Deletes empty categories afterwards.
 *
 * Usage:
 *   cd backend
 *   DRY_RUN=1 CATALOG_XLSX="../export/duzgun_urun_listesi_20260509.xlsx" npm run sync:products
 *   CATALOG_XLSX="../export/duzgun_urun_listesi_20260509.xlsx" npm run sync:products
 */

import 'dotenv/config';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { resolveStoreId } from './resolve-store';

const DEFAULT_EXCEL_PATH = path.resolve(
  __dirname,
  '../../export/duzgun_urun_listesi_20260509.xlsx',
);

const EXCEL_PATH = process.env.CATALOG_XLSX?.trim()
  ? path.resolve(process.cwd(), process.env.CATALOG_XLSX)
  : DEFAULT_EXCEL_PATH;

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

interface CatalogueRow {
  artikel: string;
  marke: string;
  kategorie: string;
  bestand: string;
  einkaufCents: number;
  listeCents: number;
  verkaufCents: number;
  minimum: string;
  lagercode: string;
}

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
    .substring(0, 90);
}

function categorySlug(name: string): string {
  return slugify(name).substring(0, 60) || 'sonstige';
}

function productSlug(row: CatalogueRow): string {
  return slugify(row.lagercode || row.artikel);
}

function cents(value: unknown): number {
  if (typeof value === 'number') return Math.round(value * 100);
  const raw = String(value ?? '')
    .replace('€', '')
    .replace(/\s/g, '')
    .trim();
  if (!raw) return 0;

  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized: string;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    normalized = raw
      .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
  } else if (lastComma >= 0) {
    normalized = raw.replace(/\./g, '').replace(',', '.');
  } else if (lastDot >= 0) {
    const digitsAfterDot = raw.length - lastDot - 1;
    normalized =
      digitsAfterDot > 0 && digitsAfterDot <= 2
        ? raw.replace(/,/g, '')
        : raw.replace(/\./g, '');
  } else {
    normalized = raw;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function cell(row: Record<string, unknown>, key: string): string {
  return String(row[key] ?? '').trim();
}

function parseExcel(): CatalogueRow[] {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`No sheet found in ${EXCEL_PATH}`);

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  });

  const rows: CatalogueRow[] = [];
  const seenCodes = new Set<string>();

  for (const raw of rawRows) {
    const artikel = cell(raw, 'Artikel');
    const lagercode = cell(raw, 'Lagercode');
    if (!artikel || !lagercode) continue;

    const codeKey = lagercode.toLocaleLowerCase('tr-TR');
    if (seenCodes.has(codeKey)) {
      throw new Error(`Duplicate Lagercode in Excel: ${lagercode}`);
    }
    seenCodes.add(codeKey);

    rows.push({
      artikel,
      marke: cell(raw, 'Marke'),
      kategorie: cell(raw, 'Kategorie') || 'Sonstige',
      bestand: cell(raw, 'Bestand'),
      einkaufCents: cents(raw['Einkauf']),
      listeCents: cents(raw['Liste']),
      verkaufCents: cents(raw['Netto/Verkauf']),
      minimum: cell(raw, 'Minimum'),
      lagercode,
    });
  }

  return rows;
}

function euro(centsValue: number): string {
  return (centsValue / 100).toFixed(2);
}

function description(row: CatalogueRow): string {
  return [
    `Artikel: ${row.artikel}`,
    row.marke ? `Marke: ${row.marke}` : null,
    row.kategorie ? `Kategorie: ${row.kategorie}` : null,
  ]
    .filter(Boolean)
    .join(' | ');
}

async function main() {
  const rows = parseExcel();
  const desiredSlugs = rows.map(productSlug);

  console.log(`Excel: ${EXCEL_PATH}`);
  console.log(`Rows: ${rows.length}`);
  console.log(`DRY_RUN=${DRY_RUN}`);

  if (rows.length === 0) {
    throw new Error('Excel has no valid product rows. Aborting.');
  }

  const prisma = new PrismaClient();
  const storeId = await resolveStoreId(prisma);
  const storeSlug = process.env.STORE_SLUG?.trim() || 'durmusbaba';
  console.log(`Store: ${storeSlug} (id=${storeId})`);

  try {
    const currentProductCount = await prisma.product.count();
    const productsToDelete = await prisma.product.count({
      where: { storeId, slug: { notIn: desiredSlugs } },
    });

    console.log(`Current DB products: ${currentProductCount}`);
    console.log(`Products not in Excel and to be deleted: ${productsToDelete}`);

    if (DRY_RUN) {
      console.log('\nDry run only. No database changes were made.');
      return;
    }

    let upserted = 0;
    await prisma.$transaction(
      async (tx) => {
        const categoryIds = new Map<string, number>();

        for (const row of rows) {
          const catSlug = categorySlug(row.kategorie);
          const category = await tx.category.upsert({
            where: { slug: catSlug },
            update: { name: row.kategorie },
            create: {
              name: row.kategorie,
              slug: catSlug,
              image: 'https://placehold.co/400x300?text=Urun',
            },
          });
          categoryIds.set(row.kategorie, category.id);
        }

        for (const row of rows) {
          const slug = productSlug(row);
          const existing = await tx.product.findUnique({
            where: { storeId_slug: { storeId, slug } },
            select: { images: true },
          });
          const categoryId = categoryIds.get(row.kategorie);
          if (!categoryId) throw new Error(`Missing category: ${row.kategorie}`);

          await tx.product.upsert({
            where: { storeId_slug: { storeId, slug } },
            update: {
              title: row.artikel,
              description: description(row),
              price: row.listeCents,
              categoryId,
              images: existing?.images ?? [],
              status: 'active',
            },
            create: {
              title: row.artikel,
              slug,
              description: description(row),
              price: row.listeCents,
              images: [],
              categoryId,
              storeId,
              status: 'active',
            },
          });
          upserted++;
        }

        await tx.product.deleteMany({
          where: { storeId, slug: { notIn: desiredSlugs } },
        });

        await tx.category.deleteMany({
          where: { products: { none: {} } },
        });
      },
      { timeout: 120_000 },
    );

    const finalProductCount = await prisma.product.count();
    const finalCategoryCount = await prisma.category.count();

    console.log('\nSync complete.');
    console.log(`Upserted products: ${upserted}`);
    console.log(`Final products: ${finalProductCount}`);
    console.log(`Final categories: ${finalCategoryCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
