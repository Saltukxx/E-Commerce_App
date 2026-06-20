/**
 * import-hamburg-prices.ts
 *
 * Reads HamburgDepo Excel and updates ONLY Product.price (euro cents) for rows
 * that match existing catalogue products by title. Does not create/delete products
 * or change slug, description, category, images.
 *
 * Matching (in order):
 *   1) Exact: trim(Ürün Adı) === trim(Product.title)
 *   2) Case-insensitive exact (Turkish-safe lower fold)
 *   3) Substring: Product.title appears inside Ürün Adı, length >= MIN_SUBSTRING_LEN,
 *      and exactly one Hamburg row is the shortest title among rows that contain
 *      that product title (reduces ambiguity).
 *
 * HOW TO RUN (from backend/, DATABASE_URL set):
 *   npx ts-node --transpile-only scripts/import-hamburg-prices.ts
 *   DRY_RUN=1 npx ts-node --transpile-only scripts/import-hamburg-prices.ts
 *   HAMBURG_XLSX=/path/to/file.xlsx npx ts-node --transpile-only scripts/import-hamburg-prices.ts
 */

import 'dotenv/config';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { resolveStoreId } from './resolve-store';

const SHEET_NAME = 'Tüm Stoklu Ürünler';

const EXCEL_PATH =
  process.env.HAMBURG_XLSX?.trim() ||
  path.resolve(__dirname, '../../HamburgDepo_Stoklu_Urunler_08052026.xlsx');

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const MIN_SUBSTRING_LEN = Math.max(3, parseInt(process.env.MIN_SUBSTRING_LEN || '5', 10) || 5);

interface HamburgRow {
  title: string;
  saleEur: number;
}

function toCents(eur: number): number {
  return Math.round((eur || 0) * 100);
}

/** Lowercase fold for Turkish + trim (for case-insensitive exact match only). */
function fold(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ');
}

function parseExcel(): HamburgRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[SHEET_NAME];
  if (!ws) throw new Error(`Sheet "${SHEET_NAME}" not found in workbook`);

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { range: 3 });
  const rows: HamburgRow[] = [];

  for (const r of raw) {
    const title = String(r['Ürün Adı'] ?? '').trim();
    if (!title) continue;
    const saleEur = Number(r['Sale (€)'] ?? 0);
    if (!saleEur || saleEur <= 0) continue;
    rows.push({ title, saleEur });
  }

  return rows;
}

function pickShortestUnique(candidates: HamburgRow[]): HamburgRow | null {
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => a.title.length - b.title.length);
  if (sorted.length === 1) return sorted[0];
  if (sorted[0].title.length < sorted[1].title.length) return sorted[0];
  return null;
}

async function main() {
  console.log(`Excel: ${EXCEL_PATH}`);
  console.log(`DRY_RUN=${DRY_RUN} MIN_SUBSTRING_LEN=${MIN_SUBSTRING_LEN}\n`);

  const hamburgRows = parseExcel();
  console.log(`Hamburg rows with Sale > 0: ${hamburgRows.length}`);

  const prisma = new PrismaClient();
  const storeId = await resolveStoreId(prisma);
  console.log(`Target store id=${storeId}`);
  const products = await prisma.product.findMany({
    where: { storeId },
    select: { id: true, title: true, price: true },
  });
  console.log(`DB products: ${products.length}\n`);

  const exactKey = new Map<string, HamburgRow>();
  const foldKey = new Map<string, HamburgRow>();
  for (const h of hamburgRows) {
    if (!exactKey.has(h.title)) exactKey.set(h.title, h);
    const k = fold(h.title);
    if (!foldKey.has(k)) foldKey.set(k, h);
  }

  let updated = 0;
  let skippedNoMatch = 0;
  let skippedAmbiguous = 0;
  const ambLog: string[] = [];
  const noMatchSample: string[] = [];

  for (const p of products) {
    const t = p.title.trim();
    let pick: HamburgRow | null = null;
    let how = '';

    const ex = exactKey.get(t);
    if (ex) {
      pick = ex;
      how = 'exact';
    } else {
      const fk = foldKey.get(fold(t));
      if (fk && fold(fk.title) === fold(t)) {
        pick = fk;
        how = 'case_insensitive';
      }
    }

    if (!pick && t.length >= MIN_SUBSTRING_LEN) {
      const subs = hamburgRows.filter((h) => h.title.includes(t));
      const chosen = pickShortestUnique(subs);
      if (chosen) {
        pick = chosen;
        how = 'substring';
      } else if (subs.length > 1) {
        skippedAmbiguous++;
        if (ambLog.length < 30) {
          ambLog.push(`id=${p.id} title="${t}" → ${subs.length} Hamburg rows contain this title`);
        }
        continue;
      }
    }

    if (!pick) {
      skippedNoMatch++;
      if (noMatchSample.length < 15) noMatchSample.push(`id=${p.id} "${t}"`);
      continue;
    }

    const cents = toCents(pick.saleEur);
    if (cents === p.price) continue;

    if (DRY_RUN) {
      const hSnippet =
        pick.title.length > 70 ? `${pick.title.slice(0, 70)}…` : pick.title;
      console.log(
        `[DRY] would update id=${p.id} "${t}" price ${p.price}→${cents} (${how}; Hamburg="${hSnippet}")`,
      );
    } else {
      await prisma.product.update({
        where: { id: p.id },
        data: { price: cents },
      });
    }
    updated++;
  }

  await prisma.$disconnect();

  console.log('\n========== import-hamburg-prices ==========');
  console.log(`Updated:           ${updated}${DRY_RUN ? ' (dry run)' : ''}`);
  console.log(`No Hamburg match:  ${skippedNoMatch}`);
  console.log(`Ambiguous substring: ${skippedAmbiguous}`);
  if (ambLog.length) {
    console.log('\nAmbiguous examples:');
    ambLog.forEach((l) => console.log(`  ${l}`));
  }
  if (noMatchSample.length && skippedNoMatch > 0) {
    console.log('\nUnmatched DB title samples (catalogue has no Hamburg line for these names):');
    noMatchSample.forEach((l) => console.log(`  ${l}`));
  }
  console.log('===========================================\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
