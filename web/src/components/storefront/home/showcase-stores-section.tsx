import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Store } from '@/lib/types';
import { storeLogoPath, storeTagline } from '@/lib/mobile-assets';
import { cn, resolveImageUrl } from '@/lib/utils';
import { TrustBadges } from '@/components/storefront/trust-badges';
import { RevealOnScroll } from '@/components/storefront/reveal-on-scroll';
import { SectionHeader } from '@/components/storefront/home/section-header';

function ShowcaseStoreCard({ store }: { store: Store }) {
  const tagline = storeTagline(store.slug, store.description);
  const meta =
    store.deliveryArea ??
    (store.productCount != null ? `${store.productCount} Produkte` : null);

  return (
    <Link
      href={`/shop/${store.slug}`}
      className="card-lift group flex h-full flex-col rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--db-border)] bg-white sm:h-14 sm:w-14">
          <Image
            src={store.logo ? resolveImageUrl(store.logo) : storeLogoPath(store.slug)}
            alt={store.name}
            fill
            className="object-contain p-1.5"
            sizes="(max-width:640px) 48px, 56px"
          />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="line-clamp-2 font-[family-name:var(--font-plus-jakarta)] text-[15px] font-bold leading-snug text-[var(--db-primary)] sm:text-base">
            {store.name}
          </p>
          {meta ? (
            <p className="mt-1 line-clamp-1 text-xs leading-normal text-[var(--db-muted)]">{meta}</p>
          ) : null}
        </div>
      </div>

      <TrustBadges store={store} compact className="mt-3 min-h-[22px]" />

      <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--db-muted)]">
        {tagline}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 border-t border-[var(--db-border)] pt-3 text-sm font-semibold text-[var(--db-primary)] transition-[gap] duration-200 group-hover:gap-2">
        Shop besuchen
        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </span>
    </Link>
  );
}

export function ShowcaseStoresSection({ stores }: { stores: Store[] }) {
  if (stores.length === 0) return null;

  return (
    <RevealOnScroll as="section">
      <SectionHeader
        eyebrow="Marktplatz"
        title="Unsere Verkäufer"
        subtitle="Vertrauenswürdige HVAC-Fachhändler auf dem Marktplatz"
        href="/haendler"
      />
      <div
        className={cn(
          'scrollbar-hide -mx-1 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-1 pb-2',
          'md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0',
        )}
      >
        {stores.map((store) => (
          <div
            key={store.slug}
            className="w-[min(calc(100vw-2.5rem),288px)] shrink-0 snap-start md:w-auto md:min-w-0 md:shrink"
          >
            <ShowcaseStoreCard store={store} />
          </div>
        ))}
      </div>
    </RevealOnScroll>
  );
}
