import Image from 'next/image';
import { notFound } from 'next/navigation';
import { formatEuro, parseApiList, resolveImageUrl } from '@/lib/utils';
import type { Product, StoreDetail } from '@/lib/types';
import { ProductDetailActions } from './product-actions';
import { SellerBox } from '@/components/storefront/seller-box';
import { OtherOffersSection } from '@/components/storefront/other-offers-section';
import { getServerApiUrl } from '@/lib/server-api';

async function getProduct(slug: string, store?: string) {
  const api = getServerApiUrl();
  const url = store
    ? `${api}/products/slug/${slug}?storeSlug=${encodeURIComponent(store)}`
    : `${api}/products/slug/${slug}`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: Product };
    return json.data;
  } catch {
    return null;
  }
}

async function getStoreDetail(slug: string) {
  const api = getServerApiUrl();
  try {
    const res = await fetch(`${api}/stores/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: StoreDetail };
    return json.data;
  } catch {
    return null;
  }
}

async function getOtherOffers(slug: string, excludeStoreSlug?: string) {
  const api = getServerApiUrl();
  const params = new URLSearchParams();
  if (excludeStoreSlug) params.set('excludeStoreSlug', excludeStoreSlug);
  const qs = params.toString();
  try {
    const res = await fetch(`${api}/products/slug/${slug}/offers${qs ? `?${qs}` : ''}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    return parseApiList<Product>(await res.json());
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ store?: string }>;
}) {
  const { slug } = await params;
  const { store: storeSlug } = await searchParams;
  const product = await getProduct(slug, storeSlug);
  if (!product) notFound();

  const [storeDetail, otherOffers] = await Promise.all([
    getStoreDetail(product.store.slug),
    getOtherOffers(slug, product.store.slug),
  ]);

  const image = product.images[0];
  const sellerStore: StoreDetail =
    storeDetail ??
    ({
      ...product.store,
      description: '',
      banner: '',
      deliveryArea: '',
      city: '',
      website: '',
      certifications: [],
      status: 'active',
      contactEmail: '',
      phone: '',
      isFeatured: false,
      paymentsReady: false,
      avgResponseHours: null,
      responseTimeLabel: null,
      productCount: 0,
      categories: [],
      featuredProducts: [],
    } as StoreDetail);

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-gray-200 bg-white">
          <Image
            src={resolveImageUrl(image)}
            alt={product.title}
            fill
            className="object-contain p-8"
            priority
          />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-bold text-[#001529]">
            {product.title}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-[#001529]">{formatEuro(product.price)}</p>
          <p className="mt-6 whitespace-pre-wrap text-gray-700">{product.description}</p>
          <ProductDetailActions product={product} />
          <SellerBox store={sellerStore} />
        </div>
      </div>
      <OtherOffersSection offers={otherOffers} productSlug={slug} />
    </div>
  );
}
