const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  const dir = '/app/uploads/products';
  const files = fs.readdirSync(dir);
  let updated = 0, skipped = 0;

  for (const file of files) {
    // Match ITEM-23905.jpg
    const parts = file.split('-');
    if (parts[0] !== 'ITEM' || parts.length < 2) { skipped++; continue; }
    const idStr = parts[1].replace('.jpg', '');
    const id = parseInt(idStr);
    if (isNaN(id)) { skipped++; continue; }

    const url = 'http://167.172.168.81:3001/uploads/products/' + file;
    try {
      await prisma.product.update({ where: { id }, data: { images: [url] } });
      console.log('OK ' + id + ' -> ' + file);
      updated++;
    } catch(e) {
      skipped++;
    }
  }

  await prisma.$disconnect();
  console.log('');
  console.log('Updated: ' + updated);
  console.log('Skipped: ' + skipped);
}

main().catch(console.error);
