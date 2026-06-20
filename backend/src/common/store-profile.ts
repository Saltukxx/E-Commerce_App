import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_FEATURED = 8;

export type StoreProfileUpdate = {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  contactEmail?: string;
  phone?: string;
  deliveryArea?: string;
  city?: string;
  website?: string;
  certifications?: string[];
  isFeatured?: boolean;
  featuredProductIds?: number[];
};

export function buildStoreUpdateData(data: StoreProfileUpdate) {
  return {
    ...(data.name != null ? { name: data.name } : {}),
    ...(data.description != null ? { description: data.description } : {}),
    ...(data.logo != null ? { logo: data.logo } : {}),
    ...(data.banner != null ? { banner: data.banner } : {}),
    ...(data.contactEmail != null ? { contactEmail: data.contactEmail } : {}),
    ...(data.phone != null ? { phone: data.phone } : {}),
    ...(data.deliveryArea != null ? { deliveryArea: data.deliveryArea } : {}),
    ...(data.city != null ? { city: data.city } : {}),
    ...(data.website != null ? { website: data.website } : {}),
    ...(data.certifications != null ? { certifications: data.certifications } : {}),
    ...(data.isFeatured != null ? { isFeatured: data.isFeatured } : {}),
  };
}

export async function syncStoreFeaturedProducts(
  prisma: PrismaService,
  storeId: number,
  productIds: number[],
) {
  const uniqueIds = [...new Set(productIds)].slice(0, MAX_FEATURED);
  if (uniqueIds.length === 0) {
    await prisma.storeFeaturedProduct.deleteMany({ where: { storeId } });
    return;
  }

  const owned = await prisma.product.findMany({
    where: { id: { in: uniqueIds }, storeId, status: 'active' },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((p) => p.id));
  const invalid = uniqueIds.filter((id) => !ownedIds.has(id));
  if (invalid.length > 0) {
    throw new BadRequestException('Featured products must belong to this store and be active');
  }

  await prisma.$transaction([
    prisma.storeFeaturedProduct.deleteMany({ where: { storeId } }),
    prisma.storeFeaturedProduct.createMany({
      data: uniqueIds.map((productId, index) => ({
        storeId,
        productId,
        sortOrder: index,
      })),
    }),
  ]);
}
