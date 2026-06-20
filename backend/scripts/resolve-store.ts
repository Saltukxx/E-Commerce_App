import { PrismaClient } from '@prisma/client';

export const OFFICIAL_STORE_SLUG = 'drc-kaltetechnik';
export const OFFICIAL_STORE_NAME = 'DRC-Kältetechnik';

export async function resolveStoreId(
  prisma: PrismaClient,
  storeSlug = process.env.STORE_SLUG?.trim() || OFFICIAL_STORE_SLUG,
): Promise<number> {
  let store = await prisma.store.findUnique({ where: { slug: storeSlug } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: storeSlug === OFFICIAL_STORE_SLUG ? OFFICIAL_STORE_NAME : storeSlug,
        slug: storeSlug,
        status: 'active',
        isFeatured: storeSlug === OFFICIAL_STORE_SLUG,
        description:
          storeSlug === OFFICIAL_STORE_SLUG
            ? 'Offizieller DRC-Kältetechnik Großhandel auf dem DurmusBaba Marktplatz'
            : '',
        contactEmail:
          storeSlug === OFFICIAL_STORE_SLUG ? 'info@drc-kaltetechnik.de' : '',
      },
    });
  }
  return store.id;
}
