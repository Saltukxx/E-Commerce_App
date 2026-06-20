'use client';

import Link from 'next/link';
import type { VendorStoreDetail } from '@/lib/panel-api';
import type { Product } from '@/lib/types';
import { StoreProfileHero } from '@/components/storefront/store-profile-hero';

type PreviewStore = VendorStoreDetail & {
  productCount: number;
  featuredProducts?: Product[];
};

export function VendorStorePreviewPanel({
  store,
  form,
  featuredProducts,
}: {
  store: VendorStoreDetail;
  form: {
    description: string;
    logo: string;
    banner: string;
    city: string;
    certifications: string[];
  };
  featuredProducts: Product[];
}) {
  const preview: PreviewStore = {
    ...store,
    description: form.description,
    logo: form.logo,
    banner: form.banner,
    city: form.city,
    certifications: form.certifications,
    productCount: store.productCount ?? 0,
    featuredProducts,
  };

  return (
    <div className="sticky top-4 overflow-hidden rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)]">
      <div className="border-b border-[var(--db-border)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--db-muted)]">Vorschau</p>
        <Link
          href={`/shop/${store.slug}`}
          target="_blank"
          className="text-sm font-medium text-[var(--db-primary)] hover:underline"
        >
          Im Shop öffnen →
        </Link>
      </div>
      <div className="pointer-events-none scale-[0.92] origin-top p-2 opacity-95">
        <StoreProfileHero store={preview as Parameters<typeof StoreProfileHero>[0]['store']} />
        {featuredProducts.length > 0 ? (
          <div className="mt-4 px-4 pb-4">
            <p className="mb-2 text-sm font-semibold">Highlights</p>
            <ul className="space-y-1 text-sm text-[var(--db-muted)]">
              {featuredProducts.slice(0, 4).map((p) => (
                <li key={p.id} className="truncate">{p.title}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
