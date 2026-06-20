const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../prisma/seed-catalogue.ts');
let s = fs.readFileSync(filePath, 'utf8');
s = s.replace(
  /where: \{ storeId_slug: \{ storeId, slug: '([^']+)' \},/g,
  "where: { storeId_slug: { storeId, slug: '$1' } },",
);
fs.writeFileSync(filePath, s);
console.log('Fixed storeId_slug closing braces');
