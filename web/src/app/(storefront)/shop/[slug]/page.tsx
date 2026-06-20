import Link from 'next/link';
import { ProductCard } from '@/components/storefront/product-card';
import {
  StoreAboutSection,
  StoreCategoriesSection,
  StoreContactSection,
  StoreDeliverySection,
  StoreProfileHero,
} from '@/components/storefront/store-profile-hero';
import type { Product, StoreDetail } from '@/lib/types';
import { getServerApiUrl } from '@/lib/server-api';

async function getStore(slug: string) {
  const api = getServerApiUrl();

  try {
    const [storeRes, productsRes] = await Promise.all([
      fetch(`${api}/stores/${slug}`, { next: { revalidate: 120 } }),
      fetch(`${api}/stores/${slug}/products?limit=24`, { next: { revalidate: 60 } }),
    ]);

    if (!storeRes.ok) return null;

    const storeJson = (await storeRes.json()) as { data: StoreDetail };
    const productsJson = productsRes.ok
      ? ((await productsRes.json()) as { data: Product[] })
      : { data: [] as Product[] };

    return { store: storeJson.data, products: productsJson.data ?? [] };
  } catch {
    return null;
  }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStore(slug);

  if (!data) {
    return <p>Shop nicht gefunden.</p>;
  }

  const { store, products } = data;
  const highlightProducts =
    store.featuredProducts?.length > 0 ? store.featuredProducts : products.slice(0, 4);

  return (
    <div>
      <StoreProfileHero store={store} />
      <StoreAboutSection store={store} />
      <StoreDeliverySection store={store} />
      <StoreCategoriesSection store={store} />

      {highlightProducts.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold text-[#001529]">
            Highlights
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlightProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold text-[#001529]">
            Alle Produkte
          </h2>
          {store.productCount > products.length ? (
            <Link
              href={`/katalog?storeSlug=${store.slug}`}
              className="text-sm font-semibold text-[var(--db-primary)] hover:underline"
            >
              Alle {store.productCount} anzeigen
            </Link>
          ) : null}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <StoreContactSection store={store} />
    </div>
  );
}
