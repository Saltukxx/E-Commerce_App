/**
 * cleanup-drc-images.ts
 *
 * Removes product images not referenced by drc-catalog.json.
 * Keeps only {SKU}.{ext} files for the 1960 imported products.
 *
 * Usage:
 *   cd backend
 *   DRY_RUN=1 npx ts-node --transpile-only scripts/cleanup-drc-images.ts
 *   npx ts-node --transpile-only scripts/cleanup-drc-images.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  UPLOADS_DIR,
  loadCatalog,
  localImageFilename,
} from './drc-utils';

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function keptFilenames(): Set<string> {
  const catalog = loadCatalog();
  const keep = new Set<string>();

  for (const product of catalog.products) {
    for (const ext of EXTENSIONS) {
      const filename = localImageFilename(product.sku, ext);
      const full = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(full)) {
        keep.add(filename);
        break;
      }
    }
  }

  return keep;
}

function main() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('Uploads directory does not exist.');
    return;
  }

  const keep = keptFilenames();
  const allFiles = fs.readdirSync(UPLOADS_DIR).filter((f) => {
    const full = path.join(UPLOADS_DIR, f);
    return fs.statSync(full).isFile();
  });

  const toDelete = allFiles.filter((f) => !keep.has(f));
  let freedBytes = 0;

  console.log(`Keep:   ${keep.size} files (from drc-catalog.json)`);
  console.log(`Total:  ${allFiles.length} files in uploads/products`);
  console.log(`Delete: ${toDelete.length} files`);
  console.log(`DRY_RUN=${DRY_RUN}\n`);

  const byPrefix = new Map<string, number>();
  for (const f of toDelete) {
    const prefix = f.startsWith('_cache_')
      ? '_cache_*'
      : f.includes('-')
        ? f.split('-')[0] + '-*'
        : 'other';
    byPrefix.set(prefix, (byPrefix.get(prefix) ?? 0) + 1);
  }
  console.log('To delete by pattern:');
  for (const [prefix, count] of [...byPrefix.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${prefix}: ${count}`);
  }

  if (toDelete.length > 0 && toDelete.length <= 15) {
    console.log('\nFiles:', toDelete.join(', '));
  } else if (toDelete.length > 15) {
    console.log('\nSample:', toDelete.slice(0, 10).join(', '), '...');
  }

  if (DRY_RUN) {
    for (const f of toDelete) {
      freedBytes += fs.statSync(path.join(UPLOADS_DIR, f)).size;
    }
    console.log(`\nWould free ~${(freedBytes / 1024 / 1024).toFixed(1)} MB`);
    return;
  }

  let deleted = 0;
  for (const f of toDelete) {
    const full = path.join(UPLOADS_DIR, f);
    try {
      freedBytes += fs.statSync(full).size;
      fs.unlinkSync(full);
      deleted++;
    } catch (error) {
      console.warn(`  ✗ could not delete ${f}: ${error instanceof Error ? error.message : error}`);
    }
  }

  const remaining = fs.readdirSync(UPLOADS_DIR).filter((f) =>
    fs.statSync(path.join(UPLOADS_DIR, f)).isFile(),
  );

  console.log(`\nDeleted ${deleted} files (~${(freedBytes / 1024 / 1024).toFixed(1)} MB freed)`);
  console.log(`Remaining: ${remaining.length} files`);
}

main();
