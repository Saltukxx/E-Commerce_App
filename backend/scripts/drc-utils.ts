import * as fs from 'fs';
import * as path from 'path';

export const DRC_BASE_URL =
  process.env.DRC_BASE_URL?.trim() ||
  'https://xn--drckltetechnik-8hb.de/wp-json/wc/store/v1';

export const SCRIPTS_DIR = path.resolve(__dirname);
export const CATALOG_PATH = path.resolve(SCRIPTS_DIR, 'drc-catalog.json');
export const FETCH_PROGRESS_PATH = path.resolve(SCRIPTS_DIR, 'drc-fetch-progress.json');
export const IMAGE_FAILURES_PATH = path.resolve(SCRIPTS_DIR, 'drc-image-failures.json');
export const UPLOADS_DIR = path.resolve(SCRIPTS_DIR, '../uploads/products');

export const DELAY_MS = Number(process.env.DRC_DELAY_MS ?? 500);
export const PER_PAGE = Number(process.env.DRC_PER_PAGE ?? 100);

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
}

export interface WcImage {
  id: number;
  src: string;
  thumbnail?: string;
  name?: string;
  alt?: string;
}

export interface WcAttribute {
  name: string;
  terms: Array<{ name: string; slug: string }>;
}

export interface WcProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  permalink: string;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
  };
  images: WcImage[];
  categories: Array<{ id: number; name: string; slug: string }>;
  brands: Array<{ id: number; name: string; slug: string }>;
  attributes: WcAttribute[];
  is_in_stock: boolean;
  is_on_backorder: boolean;
}

export interface DrcCategory {
  wcId: number;
  name: string;
  slug: string;
  parentWcId: number;
}

export interface DrcProduct {
  wcId: number;
  sku: string;
  productSlug: string;
  title: string;
  description: string;
  shortDescription: string;
  priceCents: number;
  categorySlug: string;
  categoryName: string;
  brand: string;
  imageUrl: string | null;
  permalink: string;
  attributes: Record<string, string>;
}

export interface DrcCatalog {
  fetchedAt: string;
  source: string;
  categories: DrcCategory[];
  products: DrcProduct[];
}

export interface FetchProgress {
  categoriesDone: boolean;
  productPagesDone: number[];
  totalProductPages?: number;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 90);
}

export function productSlugFromSku(sku: string, fallbackSlug: string): string {
  const raw = (sku || fallbackSlug).trim();
  return slugify(raw) || slugify(fallbackSlug);
}

export function categorySlug(name: string, wcSlug?: string): string {
  const base = (wcSlug || name).trim();
  return slugify(base).substring(0, 60) || 'sonstige';
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#215;/g, '×')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function loadCatalog(): DrcCatalog {
  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`Catalog not found: ${CATALOG_PATH}. Run npm run fetch:drc first.`);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')) as DrcCatalog;
}

export function saveCatalog(catalog: DrcCatalog): void {
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
}

export function loadFetchProgress(): FetchProgress {
  if (!fs.existsSync(FETCH_PROGRESS_PATH)) {
    return { categoriesDone: false, productPagesDone: [] };
  }
  return JSON.parse(fs.readFileSync(FETCH_PROGRESS_PATH, 'utf-8')) as FetchProgress;
}

export function saveFetchProgress(progress: FetchProgress): void {
  fs.writeFileSync(FETCH_PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

export function attributeMap(attributes: WcAttribute[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attr of attributes ?? []) {
    const value = attr.terms?.map((term) => term.name).filter(Boolean).join(', ');
    if (attr.name && value) map[attr.name] = value;
  }
  return map;
}

export function pickCategory(
  product: WcProduct,
  allCategories: WcCategory[],
): { name: string; slug: string } {
  const assigned = product.categories?.[0];
  if (assigned?.slug) {
    return { name: assigned.name, slug: assigned.slug };
  }

  const attrs = attributeMap(product.attributes);
  const sub = attrs['Unterkategorie'] || attrs['Kategorie'];
  if (sub) {
    return { name: sub, slug: categorySlug(sub) };
  }

  return { name: 'Sonstige', slug: 'sonstige' };
}

export function buildDescription(product: WcProduct, attrs: Record<string, string>): string {
  const metaParts = [
    attrs['Marke'] ? `Marke: ${attrs['Marke']}` : product.brands?.[0]?.name
      ? `Marke: ${product.brands[0].name}`
      : null,
    attrs['Kategorie'] ? `Kategorie: ${attrs['Kategorie']}` : product.categories?.[0]?.name
      ? `Kategorie: ${product.categories[0].name}`
      : null,
    attrs['Unterkategorie'] ? `Unterkategorie: ${attrs['Unterkategorie']}` : null,
    attrs['Einheit'] ? `Einheit: ${attrs['Einheit']}` : null,
    attrs['Lieferzeit'] ? `Lieferzeit: ${attrs['Lieferzeit']}` : null,
  ].filter(Boolean);

  const body = stripHtml(product.description || product.short_description || '');
  if (metaParts.length === 0) return body;
  if (!body) return metaParts.join(' | ');
  return `${metaParts.join(' | ')}\n---\n${body}`;
}

export function normalizeProduct(product: WcProduct, allCategories: WcCategory[]): DrcProduct | null {
  const sku = (product.sku || '').trim();
  if (!sku) return null;

  const attrs = attributeMap(product.attributes);
  const category = pickCategory(product, allCategories);
  const priceCents = parseInt(product.prices?.price ?? '0', 10);

  return {
    wcId: product.id,
    sku,
    productSlug: product.slug,
    title: product.name.trim(),
    description: buildDescription(product, attrs),
    shortDescription: stripHtml(product.short_description || ''),
    priceCents: Number.isFinite(priceCents) ? priceCents : 0,
    categorySlug: categorySlug(category.name, category.slug),
    categoryName: category.name,
    brand: product.brands?.[0]?.name || attrs['Marke'] || '',
    imageUrl: product.images?.[0]?.src ?? null,
    permalink: product.permalink,
    attributes: attrs,
  };
}

export async function fetchJson<T>(url: string, retries = 3): Promise<{ data: T; headers: Headers }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DurmusbabaCatalogSync/1.0',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      const data = (await response.json()) as T;
      return { data, headers: response.headers };
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
}

export function imageExtensionFromUrl(url: string, contentType?: string | null): string {
  const fromUrl = path.extname(new URL(url).pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromUrl)) {
    return fromUrl === '.jpeg' ? '.jpg' : fromUrl;
  }
  if (contentType?.includes('png')) return '.png';
  if (contentType?.includes('webp')) return '.webp';
  return '.jpg';
}

export function localImageFilename(sku: string, ext = '.jpg'): string {
  const safe = sku.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${safe}${ext}`;
}
