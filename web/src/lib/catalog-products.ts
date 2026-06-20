import type { ApiListMeta, ProductCard } from '@/lib/types';
import { parseApiList } from '@/lib/utils';
import { getServerApiUrl } from '@/lib/server-api';

export const CATALOG_PAGE_SIZE = 24;

export type CatalogParams = {
  q?: string;
  categoryId?: string;
  storeSlug?: string;
  page?: number;
};

export type CatalogProductsResult = {
  products: ProductCard[];
  meta: ApiListMeta;
};

export function catalogParamsKey(params: CatalogParams): string {
  return [
    params.q ?? '',
    params.categoryId ?? '',
    params.storeSlug ?? '',
    String(params.page ?? 1),
  ].join('|');
}

export function parseCatalogPage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

function pageToSkip(page: number | undefined): number {
  return (Math.max(1, page ?? 1) - 1) * CATALOG_PAGE_SIZE;
}

export function buildCatalogHref(params: CatalogParams, page = params.page ?? 1): string {
  const query = new URLSearchParams();
  if (params.q?.trim()) query.set('q', params.q.trim());
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.storeSlug) query.set('storeSlug', params.storeSlug);
  if (page > 1) query.set('page', String(page));
  const qs = query.toString();
  return qs ? `/katalog?${qs}` : '/katalog';
}

export function buildCatalogProductsUrl(api: string, params: CatalogParams): string {
  const query = new URLSearchParams();
  if (params.q?.trim()) query.set('q', params.q.trim());
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.storeSlug) query.set('storeSlug', params.storeSlug);
  query.set('limit', String(CATALOG_PAGE_SIZE));
  const skip = pageToSkip(params.page);
  if (skip > 0) query.set('skip', String(skip));
  query.set('view', 'card');
  return `${api}/products?${query}`;
}

function parseCatalogResponse(json: unknown, skip: number): CatalogProductsResult {
  const products = parseApiList<ProductCard>(json);
  if (json && typeof json === 'object' && 'meta' in json) {
    const meta = (json as { meta?: ApiListMeta }).meta;
    if (meta && typeof meta.total === 'number') {
      return { products, meta };
    }
  }
  return {
    products,
    meta: {
      total: products.length,
      skip,
      limit: CATALOG_PAGE_SIZE,
    },
  };
}

export async function fetchCatalogProducts(
  params: CatalogParams,
  api = getServerApiUrl(),
): Promise<CatalogProductsResult> {
  const skip = pageToSkip(params.page);
  try {
    const res = await fetch(buildCatalogProductsUrl(api, params), {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { products: [], meta: { total: 0, skip, limit: CATALOG_PAGE_SIZE } };
    }
    return parseCatalogResponse(await res.json(), skip);
  } catch {
    return { products: [], meta: { total: 0, skip, limit: CATALOG_PAGE_SIZE } };
  }
}

export async function fetchCatalogProductsClient(
  params: CatalogParams,
): Promise<CatalogProductsResult> {
  const skip = pageToSkip(params.page);
  const res = await fetch(buildCatalogProductsUrl('/api/v1', params));
  if (!res.ok) {
    return { products: [], meta: { total: 0, skip, limit: CATALOG_PAGE_SIZE } };
  }
  return parseCatalogResponse(await res.json(), skip);
}
