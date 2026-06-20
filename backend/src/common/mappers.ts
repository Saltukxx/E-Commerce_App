import { Category, Product, Store } from '@prisma/client';
import { mapStoreTrustFields, StoreTrustStats } from './store-trust';
import { resolvePublicAssetUrl, resolvePublicAssetUrls } from './public-url';

type ProductWithRelations = Product & {
  category: Category;
  store: Store;
};

export function mapStore(s: Store, trust?: Partial<StoreTrustStats>) {
  const baseTrust = mapStoreTrustFields(s);
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    logo: resolvePublicAssetUrl(s.logo),
    banner: resolvePublicAssetUrl(s.banner),
    description: s.description,
    deliveryArea: s.deliveryArea,
    city: s.city,
    website: s.website,
    certifications: s.certifications,
    status: s.status,
    contactEmail: s.contactEmail,
    phone: s.phone,
    isFeatured: s.isFeatured,
    paymentsReady: trust?.paymentsReady ?? baseTrust.paymentsReady,
    avgResponseHours: trust?.avgResponseHours ?? baseTrust.avgResponseHours,
    responseTimeLabel: trust?.responseTimeLabel ?? baseTrust.responseTimeLabel,
    creationAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function mapStoreSummary(s: Store) {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    logo: resolvePublicAssetUrl(s.logo),
  };
}

export function mapCategory(c: Category, productCount?: number) {
  return {
    creationAt: c.createdAt.toISOString(),
    id: c.id,
    image: resolvePublicAssetUrl(c.image),
    name: c.name,
    slug: c.slug,
    updatedAt: c.updatedAt.toISOString(),
    ...(productCount !== undefined ? { productCount } : {}),
  };
}

export function mapProduct(p: ProductWithRelations) {
  return {
    category: mapCategory(p.category),
    store: mapStoreSummary(p.store),
    creationAt: p.createdAt.toISOString(),
    description: p.description,
    id: p.id,
    images: resolvePublicAssetUrls(p.images),
    price: p.price,
    slug: p.slug,
    status: p.status,
    stockQty: p.stockQty,
    title: p.title,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function mapProductCard(p: ProductWithRelations) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    images: p.images.length > 0 ? [resolvePublicAssetUrl(p.images[0])] : [],
    store: mapStoreSummary(p.store),
  };
}

export function mapCartItem(line: {
  id: number;
  userId: number;
  productId: number;
  storeId: number;
  storeName: string;
  quantity: number;
  productName: string;
  price: number;
  imageUrl: string | null;
  name: string;
}) {
  return {
    id: line.id,
    productId: line.productId,
    userId: line.userId,
    storeId: line.storeId,
    storeName: line.storeName,
    name: line.name,
    price: line.price,
    imageUrl: line.imageUrl ? resolvePublicAssetUrl(line.imageUrl) : line.imageUrl,
    quantity: line.quantity,
    productName: line.productName,
  };
}
