const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../prisma/seed-catalogue.ts');
let s = fs.readFileSync(filePath, 'utf8');

if (!s.includes('resolveStoreId')) {
  s = s.replace(
    "import { PrismaClient } from '@prisma/client';",
    "import { PrismaClient } from '@prisma/client';\nimport { resolveStoreId } from '../scripts/resolve-store';",
  );
  s = s.replace(
    "async function main() {\n  console.log('Seeding refrigeration catalogue...');",
    "async function main() {\n  console.log('Seeding refrigeration catalogue...');\n  const storeId = await resolveStoreId(prisma);",
  );
}

s = s.replace(
  /await prisma\.product\.upsert\(\{\s*\n\s*where: \{ slug: /g,
  'await prisma.product.upsert({\n        where: { storeId_slug: { storeId, slug: ',
);

s = s.replace(/create: \{ title:/g, 'create: { storeId, title:');

fs.writeFileSync(filePath, s);
console.log('Patched seed-catalogue.ts for store-scoped products');
