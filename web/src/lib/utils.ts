import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEuro(cents: number) {
  if (cents === 0) return 'Preis auf Anfrage';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export function resolveImageUrl(path: string | undefined | null) {
  if (!path) return '/placeholder-product.svg';
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_UPLOADS_BASE ?? '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Public list endpoints return either a raw array or { data: T[] }. */
export function parseApiList<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === 'object' && 'data' in json) {
    const data = (json as { data?: unknown }).data;
    return Array.isArray(data) ? (data as T[]) : [];
  }
  return [];
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}
