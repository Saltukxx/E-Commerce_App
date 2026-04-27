/**
 * scrape-images.ts
 *
 * Launches a real Chromium browser via Playwright and scrapes product images
 * from gev-online.com (REPA GEV shop) using each product's REPA IT code.
 *
 * HOW TO RUN:
 *   cd backend
 *   npm install playwright xlsx           # one-time
 *   npx playwright install chromium       # one-time
 *   npx ts-node --transpile-only scripts/scrape-images.ts
 *
 * OUTPUT:
 *   scripts/image-results.json    ← scraped image URLs, keyed by REPA IT code
 *   scripts/scrape-progress.json  ← progress checkpoint (safe to re-run)
 *
 * The script is RESUMABLE: if interrupted, re-running continues where it left off.
 */

import { chromium } from 'playwright';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// ── Config ──────────────────────────────────────────────────────────────────

const EXCEL_PATH = path.resolve(__dirname, '../../Refrigeration Catalogue 2025 - Product Data (1).xlsx');
const RESULTS_PATH = path.resolve(__dirname, 'image-results.json');
const PROGRESS_PATH = path.resolve(__dirname, 'scrape-progress.json');

const BASE_URL = 'https://www.gev-online.com';
const SEARCH_URL = (query: string) =>
  `${BASE_URL}/en/webshop/search?searchterm=${encodeURIComponent(query)}`;

// Delay between requests — be respectful to the server
const DELAY_MS = 2500;

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductRow {
  repaItCode: string;
  model: string;
  category: string;
}

interface ScrapeResult {
  repaItCode: string;
  model: string;
  imageUrl: string | null;
  productUrl: string | null;
  status: 'found' | 'not_found' | 'error';
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function loadExcel(): ProductRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets['All Products'];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  const products: ProductRow[] = [];
  for (const row of rows) {
    const repaItCode = String(row['REPA IT Code'] ?? '').trim();
    if (!repaItCode || repaItCode === 'undefined') continue;
    products.push({
      repaItCode,
      model: String(row['Model'] ?? '').trim(),
      category: String(row['Category'] ?? '').trim(),
    });
  }
  return products;
}

function loadProgress(): Set<string> {
  if (!fs.existsSync(PROGRESS_PATH)) return new Set();
  const data = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8')) as string[];
  return new Set(data);
}

function saveProgress(done: Set<string>): void {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify([...done], null, 2));
}

function loadResults(): Map<string, ScrapeResult> {
  if (!fs.existsSync(RESULTS_PATH)) return new Map();
  const data = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8')) as ScrapeResult[];
  return new Map(data.map((r) => [r.repaItCode, r]));
}

function saveResults(results: Map<string, ScrapeResult>): void {
  fs.writeFileSync(RESULTS_PATH, JSON.stringify([...results.values()], null, 2));
}

// ── Main scraping logic ──────────────────────────────────────────────────────

async function scrapeProduct(
  page: import('playwright').Page,
  product: ProductRow,
): Promise<ScrapeResult> {
  const { repaItCode, model, category } = product;

  try {
    // Navigate to GEV search for this REPA IT code
    await page.goto(SEARCH_URL(repaItCode), { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait briefly for JS to hydrate
    await sleep(1500);

    // ── Strategy 1: direct product link from search results ──
    // GEV search results show product cards — try to find the first one
    const productLink = await page
      .locator('a[href*="/webshop/"], a[href*="/product/"], a[href*="/artikel/"]')
      .first()
      .getAttribute('href')
      .catch(() => null);

    let productUrl: string | null = null;
    if (productLink) {
      productUrl = productLink.startsWith('http') ? productLink : `${BASE_URL}${productLink}`;

      // Navigate to the product detail page for a higher-quality image
      await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(1000);
    }

    // ── Strategy 2: find product image on whichever page we ended up on ──
    // Try multiple common image selectors used by e-commerce platforms
    const imageSelectors = [
      'img.product-image',
      'img.article-image',
      '.product-detail img',
      '.product-image-container img',
      '.article-image img',
      '.product img[src*="product"]',
      '.product img[src*="article"]',
      'img[alt*="' + repaItCode + '"]',
      model ? 'img[alt*="' + model + '"]' : null,
      // Generic fallback — largest image on page that isn't a logo/banner
      'main img:not([src*="logo"]):not([src*="banner"]):not([src*="icon"])',
    ].filter(Boolean) as string[];

    let imageUrl: string | null = null;

    for (const selector of imageSelectors) {
      try {
        const src = await page.locator(selector).first().getAttribute('src');
        if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('placeholder')) {
          imageUrl = src;
          break;
        }
        // Handle relative URLs
        if (src && src.startsWith('/')) {
          imageUrl = `${BASE_URL}${src}`;
          break;
        }
      } catch {
        // Selector not found — try next
      }
    }

    if (!imageUrl) {
      // Last resort: grab all img src attributes and pick the most likely product image
      const allImages = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .map((img) => ({ src: img.src, alt: img.alt, width: img.naturalWidth }))
          .filter((img) => img.src && img.width > 100)
          .sort((a, b) => b.width - a.width);
      });

      const candidate = allImages.find(
        (img) =>
          !img.src.includes('logo') &&
          !img.src.includes('banner') &&
          !img.src.includes('icon') &&
          !img.src.includes('favicon'),
      );
      imageUrl = candidate?.src ?? null;
    }

    if (imageUrl) {
      console.log(`  ✓ ${repaItCode} (${model}) → ${imageUrl.substring(0, 80)}...`);
      return { repaItCode, model, imageUrl, productUrl, status: 'found' };
    } else {
      console.log(`  ✗ ${repaItCode} (${model}) — no image found`);
      return { repaItCode, model, imageUrl: null, productUrl, status: 'not_found' };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  ⚠ ${repaItCode} (${model}) — error: ${message.substring(0, 80)}`);
    return { repaItCode, model, imageUrl: null, productUrl: null, status: 'error', error: message };
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  console.log('Loading product list from Excel...');
  const products = loadExcel();
  console.log(`Found ${products.length} products.`);

  const done = loadProgress();
  const results = loadResults();
  const remaining = products.filter((p) => !done.has(p.repaItCode));

  console.log(`Already done: ${done.size}. Remaining: ${remaining.length}\n`);

  if (remaining.length === 0) {
    console.log('All products already scraped. Check scripts/image-results.json');
    return;
  }

  // Launch real Chromium browser (non-headless passes Cloudflare)
  console.log('Launching Chromium browser...');
  const browser = await chromium.launch({
    headless: false,    // ← IMPORTANT: real browser bypasses Cloudflare challenge
    slowMo: 100,        // slight slow-down makes it look more human
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-GB',
  });

  const page = await context.newPage();

  // First: navigate to GEV homepage to get the Cloudflare cookie established
  console.log('Opening gev-online.com to establish session...');
  await page.goto(`${BASE_URL}/en/home`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Waiting 5 seconds for Cloudflare to clear...');
  await sleep(5000);

  let savedAt = Date.now();

  for (let i = 0; i < remaining.length; i++) {
    const product = remaining[i];
    const progress = `[${done.size + i + 1}/${products.length}]`;
    console.log(`${progress} Scraping ${product.repaItCode}...`);

    const result = await scrapeProduct(page, product);
    results.set(product.repaItCode, result);
    done.add(product.repaItCode);

    // Auto-save every 25 products or every 60 seconds
    if (i % 25 === 0 || Date.now() - savedAt > 60000) {
      saveProgress(done);
      saveResults(results);
      savedAt = Date.now();
      console.log(`  → Checkpoint saved (${done.size} done)`);
    }

    // Polite delay between requests
    await sleep(DELAY_MS);
  }

  // Final save
  saveProgress(done);
  saveResults(results);

  await browser.close();

  // Print summary
  const found = [...results.values()].filter((r) => r.status === 'found').length;
  const notFound = [...results.values()].filter((r) => r.status === 'not_found').length;
  const errors = [...results.values()].filter((r) => r.status === 'error').length;

  console.log('\n════════════════════════════════');
  console.log(`  Total scraped : ${results.size}`);
  console.log(`  Images found  : ${found}`);
  console.log(`  Not found     : ${notFound}`);
  console.log(`  Errors        : ${errors}`);
  console.log('════════════════════════════════');
  console.log('\nResults saved to scripts/image-results.json');
  console.log('Next step: run  npx ts-node --transpile-only scripts/update-images.ts');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
