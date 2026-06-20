'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { ProductCardCatalog } from '@/components/storefront/product-card-catalog';
import { CatalogPagination } from '@/components/storefront/catalog-pagination';
import {
  catalogParamsKey,
  fetchCatalogProductsClient,
  parseCatalogPage,
  type CatalogParams,
  type CatalogProductsResult,
} from '@/lib/catalog-products';

function paramsFromSearch(search: URLSearchParams): CatalogParams {
  return {
    q: search.get('q') ?? undefined,
    categoryId: search.get('categoryId') ?? undefined,
    storeSlug: search.get('storeSlug') ?? undefined,
    page: parseCatalogPage(search.get('page') ?? undefined),
  };
}

function GridSkeleton() {
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

export function CatalogProductGridClient({
  initialParams,
  initialResult,
}: {
  initialParams: CatalogParams;
  initialResult: CatalogProductsResult;
}) {
  const searchParams = useSearchParams();
  const params = paramsFromSearch(searchParams);
  const key = catalogParamsKey(params);
  const initialKey = catalogParamsKey(initialParams);

  const { data, isFetching, isPending } = useQuery({
    queryKey: ['catalog-products', key],
    queryFn: () => fetchCatalogProductsClient(params),
    initialData: key === initialKey ? initialResult : undefined,
    staleTime: 30_000,
  });

  const products = data?.products ?? [];
  const meta = data?.meta ?? initialResult.meta;
  const showSkeleton = isPending || (isFetching && products.length === 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [params.page, params.categoryId, params.storeSlug, params.q]);

  if (showSkeleton) {
    return <GridSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--db-border)] bg-[var(--db-surface)] px-4 py-10 text-center md:rounded-2xl">
        <p className="font-medium text-[var(--db-primary)]">Keine Produkte gefunden.</p>
        <p className="mt-2 text-sm text-[var(--db-muted)]">
          {params.q?.trim()
            ? 'Anderen Suchbegriff versuchen oder Filter anpassen.'
            : 'Kategorie, Händler wählen oder oben suchen.'}
        </p>
      </div>
    );
  }

  return (
    <div className={isFetching ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
      <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="min-w-0 max-w-full">
            <ProductCardCatalog product={product} />
          </div>
        ))}
      </div>
      <CatalogPagination params={params} meta={meta} />
    </div>
  );
}
