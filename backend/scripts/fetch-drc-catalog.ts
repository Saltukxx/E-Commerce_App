/**
 * fetch-drc-catalog.ts
 *
 * Pulls all products and categories from the DRC WooCommerce Store API
 * into scripts/drc-catalog.json (resumable).
 *
 * Usage:
 *   cd backend
 *   npm run fetch:drc
 *   DRY_RUN=1 npm run fetch:drc
 */

import * as fs from 'fs';
import {
  CATALOG_PATH,
  DRC_BASE_URL,
  DELAY_MS,
  DrcCatalog,
  DrcCategory,
  DrcProduct,
  FetchProgress,
  PER_PAGE,
  WcCategory,
  WcProduct,
  fetchJson,
  loadFetchProgress,
  normalizeProduct,
  saveCatalog,
  saveFetchProgress,
  sleep,
} from './drc-utils';

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

async function fetchAllCategories(): Promise<WcCategory[]> {
  const categories: WcCategory[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${DRC_BASE_URL}/products/categories?per_page=${PER_PAGE}&page=${page}`;
    console.log(`  categories page ${page}/${totalPages} ...`);
    const { data, headers } = await fetchJson<WcCategory[]>(url);
    categories.push(...data);
    totalPages = Number(headers.get('x-wp-totalpages') ?? 1);
    page++;
    if (page <= totalPages) await sleep(DELAY_MS);
  }

  return categories;
}

async function fetchProductPage(page: number): Promise<{ products: WcProduct[]; totalPages: number }> {
  const url = `${DRC_BASE_URL}/products?per_page=${PER_PAGE}&page=${page}`;
  const { data, headers } = await fetchJson<WcProduct[]>(url);
  const totalPages = Number(headers.get('x-wp-totalpages') ?? 1);
  return { products: data, totalPages };
}

async function main() {
  console.log(`Source: ${DRC_BASE_URL}`);
  console.log(`Output: ${CATALOG_PATH}`);
  console.log(`DRY_RUN=${DRY_RUN}\n`);

  const progress = loadFetchProgress();
  let catalog: DrcCatalog = {
    fetchedAt: new Date().toISOString(),
    source: DRC_BASE_URL,
    categories: [],
    products: [],
  };

  if (progress.categoriesDone || progress.productPagesDone.length > 0) {
    try {
      const existing = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')) as DrcCatalog;
      catalog = existing;
      console.log(`Resuming from checkpoint (${catalog.products.length} products cached).\n`);
    } catch {
      console.log('Starting fresh catalog.\n');
    }
  }

  let wcCategories: WcCategory[] = catalog.categories.map((c) => ({
    id: c.wcId,
    name: c.name,
    slug: c.slug,
    parent: c.parentWcId,
    count: 0,
  }));

  if (!progress.categoriesDone) {
    console.log('[1/2] Fetching categories...');
    wcCategories = await fetchAllCategories();
    catalog.categories = wcCategories.map(
      (c): DrcCategory => ({
        wcId: c.id,
        name: c.name,
        slug: c.slug,
        parentWcId: c.parent,
      }),
    );
    progress.categoriesDone = true;
    saveFetchProgress(progress);
    saveCatalog(catalog);
    console.log(`    ${catalog.categories.length} categories saved.\n`);
  } else {
    console.log(`[1/2] Categories already fetched (${catalog.categories.length}).\n`);
  }

  console.log('[2/2] Fetching products...');
  const donePages = new Set(progress.productPagesDone);
  let totalPages = progress.totalProductPages ?? 1;
  let skippedNoSku = 0;

  for (let page = 1; page <= totalPages; page++) {
    if (donePages.has(page)) {
      console.log(`  page ${page}/${totalPages} — skipped (cached)`);
      continue;
    }

    console.log(`  page ${page}/${totalPages} ...`);
    const { products, totalPages: reportedTotal } = await fetchProductPage(page);
    totalPages = reportedTotal;
    progress.totalProductPages = totalPages;

    for (const product of products) {
      const normalized = normalizeProduct(product, wcCategories);
      if (!normalized) {
        skippedNoSku++;
        console.warn(`    ⚠ skipped wcId=${product.id} — missing SKU (${product.name})`);
        continue;
      }
      catalog.products.push(normalized);
    }

    progress.productPagesDone.push(page);
    catalog.fetchedAt = new Date().toISOString();
    saveFetchProgress(progress);
    saveCatalog(catalog);

    if (page < totalPages) await sleep(DELAY_MS);
  }

  if (DRY_RUN) {
    console.log('\nDry run complete — catalog file was updated during fetch.');
  }

  console.log('\nFetch complete.');
  console.log(`Categories: ${catalog.categories.length}`);
  console.log(`Products:   ${catalog.products.length}`);
  console.log(`Skipped (no SKU): ${skippedNoSku}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
