/**
 * import-drc-catalog.ts
 *
 * Imports scripts/drc-catalog.json into PostgreSQL, replacing the store catalogue.
 *
 * Usage:
 *   cd backend
 *   DRY_RUN=1 npm run import:drc
 *   npm run import:drc
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  CATALOG_PATH,
  DrcProduct,
  UPLOADS_DIR,
  categorySlug,
  decodeHtmlEntities,
  loadCatalog,
  localImageFilename,
  productSlugFromSku,
} from './drc-utils';
import { resolveStoreId } from './resolve-store';

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';
const SERVER_URL = (process.env.SERVER_URL || '').replace(/\/$/, '');
const BATCH_SIZE = 100;

function resolveProductImage(product: DrcProduct): string[] {
  const extensions = ['.jpg', '.png', '.webp', '.jpeg'];
  for (const ext of extensions) {
    const filename = localImageFilename(product.sku, ext);
    const localPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(localPath)) {
      const relative = `/uploads/products/${filename}`;
      if (SERVER_URL) return [`${SERVER_URL}${relative}`];
      return [relative];
    }
  }
  return [];
}

async function main() {
  const catalog = loadCatalog();
  const desiredSlugs = catalog.products.map((p) => productSlugFromSku(p.sku, p.productSlug));

  console.log(`Catalog: ${CATALOG_PATH}`);
  console.log(`Products: ${catalog.products.length}`);
  console.log(`Categories: ${catalog.categories.length}`);
  console.log(`DRY_RUN=${DRY_RUN}\n`);

  if (catalog.products.length === 0) {
    throw new Error('Catalog has no products. Run npm run fetch:drc first.');
  }

  const prisma = new PrismaClient();
  const storeId = await resolveStoreId(prisma);
  const storeSlug = process.env.STORE_SLUG?.trim() || 'drc-kaltetechnik';
  console.log(`Store: ${storeSlug} (id=${storeId})`);

  try {
    const currentProductCount = await prisma.product.count({ where: { storeId } });
    const productsToDelete = await prisma.product.count({
      where: { storeId, slug: { notIn: desiredSlugs } },
    });

    const withImages = catalog.products.filter((p) => resolveProductImage(p).length > 0).length;
    const duplicateSlugs = desiredSlugs.length - new Set(desiredSlugs).size;

    console.log(`Current store products: ${currentProductCount}`);
    console.log(`Products to upsert:       ${catalog.products.length}`);
    console.log(`Products with local image: ${withImages}`);
    console.log(`Products to delete:       ${productsToDelete}`);
    if (duplicateSlugs > 0) {
      console.warn(`Warning: ${duplicateSlugs} duplicate slug(s) detected — last write wins.`);
    }

    if (DRY_RUN) {
      console.log('\nDry run only. No database changes were made.');
      return;
    }

    let upserted = 0;
    const categoryIds = new Map<string, number>();

    const uniqueCategories = new Map<string, string>();
    const catalogCategorySlugs = new Set<string>();
    for (const cat of catalog.categories) {
      const slug = categorySlug(decodeHtmlEntities(cat.name), cat.slug);
      catalogCategorySlugs.add(slug);
      uniqueCategories.set(slug, decodeHtmlEntities(cat.name));
    }
    for (const product of catalog.products) {
      uniqueCategories.set(product.categorySlug, product.categoryName);
    }

    await prisma.$transaction(
      async (tx) => {
        // Seed/import scripts may have inserted explicit ids; bump the sequence so creates don't collide.
        await tx.$executeRawUnsafe(`
          SELECT setval(
            pg_get_serial_sequence('"Product"', 'id'),
            COALESCE((SELECT MAX(id) FROM "Product"), 1)
          )
        `);

        for (const [slug, name] of uniqueCategories) {
          const category = await tx.category.upsert({
            where: { slug },
            update: { name },
            create: {
              name,
              slug,
              image: 'https://placehold.co/400x300?text=Urun',
            },
          });
          categoryIds.set(slug, category.id);
        }

        for (let i = 0; i < catalog.products.length; i += BATCH_SIZE) {
          const batch = catalog.products.slice(i, i + BATCH_SIZE);
          for (const product of batch) {
            const slug = productSlugFromSku(product.sku, product.productSlug);
            const categoryId = categoryIds.get(product.categorySlug);
            if (!categoryId) {
              throw new Error(`Missing category for ${product.sku}: ${product.categorySlug}`);
            }

            const images = resolveProductImage(product);
            const existing = await tx.product.findUnique({
              where: { storeId_slug: { storeId, slug } },
              select: { images: true },
            });

            await tx.product.upsert({
              where: { storeId_slug: { storeId, slug } },
              update: {
                title: product.title,
                description: product.description,
                price: product.priceCents,
                categoryId,
                images: images.length > 0 ? images : (existing?.images ?? []),
                status: 'active',
                stockQty: null,
              },
              create: {
                title: product.title,
                slug,
                description: product.description,
                price: product.priceCents,
                images,
                categoryId,
                storeId,
                status: 'active',
                stockQty: null,
              },
            });
            upserted++;
          }
        }

        await tx.product.deleteMany({
          where: { storeId, slug: { notIn: desiredSlugs } },
        });

        // Keep DRC taxonomy categories even when they have no direct products yet.
        await tx.category.deleteMany({
          where: {
            products: { none: {} },
            slug: { notIn: [...catalogCategorySlugs] },
          },
        });
      },
      { timeout: 300_000 },
    );

    const finalProductCount = await prisma.product.count({ where: { storeId } });
    const finalCategoryCount = await prisma.category.count();

    console.log('\nImport complete.');
    console.log(`Upserted products: ${upserted}`);
    console.log(`Final products:    ${finalProductCount}`);
    console.log(`Final categories:  ${finalCategoryCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
