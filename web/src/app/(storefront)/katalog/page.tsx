import { Suspense } from 'react';
import { CategorySidebar } from '@/components/storefront/category-sidebar';
import { CatalogSearchForm } from '@/components/storefront/catalog-search-form';
import { CatalogProductGridClient } from '@/components/storefront/catalog-product-grid-client';
import { StoreFilterChips } from '@/components/storefront/store-filter-chips';
import type { Category, Store } from '@/lib/types';
import { decodeHtmlEntities, parseApiList } from '@/lib/utils';
import { getServerApiUrl } from '@/lib/server-api';
import { fetchCatalogProducts, parseCatalogPage, type CatalogParams } from '@/lib/catalog-products';

async function fetchCategories(): Promise<Category[]> {
  const api = getServerApiUrl();
  try {
    const res = await fetch(`${api}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return parseApiList<Category>(await res.json());
  } catch {
    return [];
  }
}

async function fetchStoreSummaries(): Promise<Store[]> {
  const api = getServerApiUrl();
  try {
    const res = await fetch(`${api}/stores/summary`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const rows = parseApiList<{ id: number; name: string; slug: string; logo: string; isFeatured: boolean }>(
      await res.json(),
    );
    return rows.map((s) => ({
      ...s,
      description: '',
      banner: '',
      deliveryArea: '',
      city: '',
      website: '',
      certifications: [],
      status: 'active',
      contactEmail: '',
      phone: '',
      paymentsReady: false,
      avgResponseHours: null,
      responseTimeLabel: null,
    }));
  } catch {
    return [];
  }
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[180px] animate-pulse rounded-xl border border-[var(--db-border)] bg-[var(--db-surface)]"
        />
      ))}
    </div>
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoryId?: string; storeSlug?: string; page?: string }>;
}) {
  const params = await searchParams;
  const catalogParams: CatalogParams = {
    q: params.q,
    categoryId: params.categoryId,
    storeSlug: params.storeSlug,
    page: parseCatalogPage(params.page),
  };

  const [categories, stores, initialResult] = await Promise.all([
    fetchCategories(),
    fetchStoreSummaries(),
    fetchCatalogProducts(catalogParams),
  ]);

  const activeCategory = params.categoryId
    ? categories.find((c) => String(c.id) === params.categoryId)
    : undefined;
  const activeStore = params.storeSlug
    ? stores.find((s) => s.slug === params.storeSlug)
    : undefined;

  const subtitleParts = [
    activeStore?.name,
    params.q?.trim()
      ? `„${params.q.trim()}"`
      : activeCategory
        ? decodeHtmlEntities(activeCategory.name)
        : 'Alle Produkte',
  ].filter(Boolean);

  const subtitle = subtitleParts.join(' · ');
  const filterKey = [params.q, params.categoryId, params.storeSlug, params.page].join('-');
  const productCount = initialResult.meta.total;

  const productGrid = (
    <Suspense fallback={<ProductGridSkeleton />}>
      <CatalogProductGridClient
        initialParams={catalogParams}
        initialResult={initialResult}
      />
    </Suspense>
  );

  return (
    <div className="min-w-0 pb-6">
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--db-muted)]">Katalog</p>
          <p className="truncate text-sm font-semibold text-[var(--db-primary)]">{subtitle}</p>
        </div>
        {productCount > 0 ? (
          <span className="shrink-0 rounded-full bg-[var(--db-accent)] px-2.5 py-1 text-xs font-semibold text-[var(--db-primary)]">
            {productCount}
          </span>
        ) : null}
      </div>

      <div className="hidden lg:flex lg:items-end lg:justify-between lg:gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-bold text-[var(--db-primary)]">
            Katalog
          </h1>
          <p className="mt-2 text-[var(--db-muted)]">{subtitle}</p>
        </div>
        {productCount > 0 ? (
          <p className="text-sm font-medium text-[var(--db-muted)]">
            {productCount} {productCount === 1 ? 'Produkt' : 'Produkte'}
          </p>
        ) : null}
      </div>

      <div className="mt-3 space-y-2 lg:mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--db-muted)]">Händler</p>
        <StoreFilterChips
          stores={stores}
          activeStoreSlug={params.storeSlug}
          query={params.q}
          categoryId={params.categoryId}
        />
      </div>

      <div className="sticky top-0 z-20 -mx-4 mt-3 border-b border-[var(--db-border)] bg-[var(--background)]/98 px-4 py-2 backdrop-blur-md lg:hidden">
        <CategorySidebar
          categories={categories}
          activeCategoryId={params.categoryId}
          query={params.q}
          storeSlug={params.storeSlug}
          compactMobile
        />
      </div>

      <div className="mt-4 hidden min-w-0 gap-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:mt-8">
        <aside className="sticky top-24 self-start">
          <CategorySidebar
            categories={categories}
            activeCategoryId={params.categoryId}
            query={params.q}
            storeSlug={params.storeSlug}
          />
        </aside>
        <div className="min-w-0">
          <div className="mb-6">
            <CatalogSearchForm
              defaultValue={params.q ?? ''}
              categoryId={params.categoryId}
              storeSlug={params.storeSlug}
            />
          </div>
          <div key={filterKey}>{productGrid}</div>
        </div>
      </div>

      <div className="mt-3 min-w-0 lg:hidden">
        <div key={`m-${filterKey}`}>{productGrid}</div>
      </div>
    </div>
  );
}
