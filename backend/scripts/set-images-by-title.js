/**
 * set-images-by-title.js
 * Matches products by title (Turkish or German) and sets images[] to server URL.
 * Reads /app/image-mapping.json for the title->filename map.
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const SERVER_URL = 'http://167.172.168.81:3001';
const MAPPING_PATH = '/app/image-mapping.json';

async function main() {
  const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf-8'));
  console.log('Mapping entries:', mapping.length);

  const prisma = new PrismaClient();

  // Load all products into memory
  const all = await prisma.product.findMany({ select: { id: true, title: true } });
  console.log('DB products:', all.length);

  const byTitle = new Map();
  for (const p of all) {
    byTitle.set(p.title.toLowerCase().trim(), p.id);
  }

  let updated = 0, notFound = 0;

  for (const entry of mapping) {
    const { titleTr, titleDe, filename } = entry;
    const url = SERVER_URL + '/uploads/products/' + filename;

    // Try Turkish title first, then German
    const id = byTitle.get(titleTr.toLowerCase().trim())
            || byTitle.get(titleDe.toLowerCase().trim());

    if (!id) {
      console.log('NOT FOUND: ' + titleTr.substring(0, 60));
      notFound++;
      continue;
    }

    await prisma.product.update({ where: { id }, data: { images: [url] } });
    console.log('OK id=' + id + ' ' + filename);
    updated++;
  }

  await prisma.$disconnect();
  console.log('\n==============================');
  console.log('Updated  : ' + updated);
  console.log('Not found: ' + notFound);
  console.log('==============================');
}

main().catch(console.error);
