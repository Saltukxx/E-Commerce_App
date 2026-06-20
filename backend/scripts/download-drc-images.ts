/**
 * download-drc-images.ts
 *
 * Downloads featured product images from drc-catalog.json into
 * backend/uploads/products/{SKU}.{ext}
 *
 * Usage:
 *   cd backend
 *   npm run download:drc-images
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  DrcProduct,
  IMAGE_FAILURES_PATH,
  UPLOADS_DIR,
  imageExtensionFromUrl,
  loadCatalog,
  localImageFilename,
  sleep,
} from './drc-utils';

const MIN_BYTES = Number(process.env.DRC_MIN_IMAGE_BYTES ?? 2048);
const MAX_RETRIES = 3;
const FETCH_TIMEOUT_MS = Number(process.env.DRC_IMAGE_TIMEOUT_MS ?? 30_000);

interface ImageFailure {
  sku: string;
  url: string;
  error: string;
}

interface UrlCacheEntry {
  localPath: string;
  ext: string;
}

async function downloadWithRetry(
  url: string,
  destPath: string,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DurmusbabaCatalogSync/1.0',
          Accept: 'image/*,*/*',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < MIN_BYTES) {
        throw new Error(`File too small (${buffer.length} bytes)`);
      }
      fs.writeFileSync(destPath, buffer);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
}

function urlHash(url: string): string {
  return crypto.createHash('sha1').update(url).digest('hex').slice(0, 12);
}

function linkOrCopy(source: string, dest: string): void {
  if (fs.existsSync(dest)) {
    const stat = fs.statSync(dest);
    if (stat.size >= MIN_BYTES) return;
    fs.unlinkSync(dest);
  }
  try {
    fs.linkSync(source, dest);
  } catch {
    fs.copyFileSync(source, dest);
  }
}

async function ensureImageForProduct(
  product: DrcProduct,
  urlCache: Map<string, UrlCacheEntry>,
  failures: ImageFailure[],
): Promise<'downloaded' | 'copied' | 'skipped' | 'failed' | 'no-url'> {
  if (!product.imageUrl) return 'no-url';

  const url = product.imageUrl;
  const ext = imageExtensionFromUrl(url);
  const filename = localImageFilename(product.sku, ext);
  const destPath = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(destPath)) {
    const stat = fs.statSync(destPath);
    if (stat.size >= MIN_BYTES) return 'skipped';
  }

  const cached = urlCache.get(url);
  if (cached && fs.existsSync(cached.localPath)) {
    linkOrCopy(cached.localPath, destPath);
    return 'copied';
  }

  const cacheFilename = `_cache_${urlHash(url)}${ext}`;
  const cachePath = path.join(UPLOADS_DIR, cacheFilename);

  try {
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size >= MIN_BYTES) {
      linkOrCopy(cachePath, destPath);
      urlCache.set(url, { localPath: cachePath, ext });
      return 'copied';
    }

    await downloadWithRetry(url, cachePath);
    linkOrCopy(cachePath, destPath);
    urlCache.set(url, { localPath: cachePath, ext });
    return 'downloaded';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ sku: product.sku, url, error: message });
    return 'failed';
  }
}

async function main() {
  const catalog = loadCatalog();
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  console.log(`Products in catalog: ${catalog.products.length}`);
  console.log(`Target directory:    ${UPLOADS_DIR}\n`);

  const urlCache = new Map<string, UrlCacheEntry>();
  const failures: ImageFailure[] = [];
  let downloaded = 0;
  let copied = 0;
  let skipped = 0;
  let failed = 0;
  let noUrl = 0;

  for (let i = 0; i < catalog.products.length; i++) {
    const product = catalog.products[i];
    const result = await ensureImageForProduct(product, urlCache, failures);

    switch (result) {
      case 'downloaded':
        downloaded++;
        if (downloaded % 10 === 0) {
          console.log(`    downloaded ${downloaded} (latest: ${product.sku})`);
        }
        await sleep(150);
        break;
      case 'copied':
        copied++;
        break;
      case 'skipped':
        skipped++;
        break;
      case 'failed':
        failed++;
        console.warn(`    ✗ ${product.sku}: ${failures[failures.length - 1]?.error}`);
        break;
      case 'no-url':
        noUrl++;
        break;
    }

    if ((i + 1) % 100 === 0 || i === catalog.products.length - 1) {
      console.log(`  ${i + 1}/${catalog.products.length} processed (dl=${downloaded} skip=${skipped} fail=${failed})`);
      fs.writeFileSync(IMAGE_FAILURES_PATH, JSON.stringify(failures, null, 2));
    }
  }

  fs.writeFileSync(IMAGE_FAILURES_PATH, JSON.stringify(failures, null, 2));

  console.log('\nDownload complete.');
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Copied (dedup): ${copied}`);
  console.log(`Skipped (exists): ${skipped}`);
  console.log(`No image URL: ${noUrl}`);
  console.log(`Failed: ${failed}`);
  if (failures.length > 0) {
    console.log(`Failures log: ${IMAGE_FAILURES_PATH}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
