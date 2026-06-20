/** Public origin for uploaded assets (no trailing slash). */
export function getPublicUploadsBase(): string {
  const explicit = process.env.PUBLIC_UPLOADS_BASE?.trim().replace(/\/$/, '');
  if (explicit) return explicit;

  const api = process.env.PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (api) {
    return api.replace(/\/api\/v1$/i, '');
  }

  return '';
}

/** Turn DB upload paths into absolute URLs for web + mobile clients. */
export function resolvePublicAssetUrl(path: string | null | undefined): string {
  if (!path?.trim()) return '';
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const base = getPublicUploadsBase();
  return base ? `${base}${normalized}` : normalized;
}

export function resolvePublicAssetUrls(paths: string[] | null | undefined): string[] {
  if (!paths?.length) return [];
  return paths.map((p) => resolvePublicAssetUrl(p)).filter(Boolean);
}
