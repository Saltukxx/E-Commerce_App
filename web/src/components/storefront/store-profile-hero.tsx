import Image from 'next/image';
import Link from 'next/link';
import type { StoreDetail } from '@/lib/types';
import {
  storeBannerGradientClass,
  storeBannerPath,
  storeLogoPath,
  storeTagline,
} from '@/lib/mobile-assets';
import { resolveImageUrl } from '@/lib/utils';
import { TrustBadges } from '@/components/storefront/trust-badges';

export function StoreProfileHero({ store }: { store: StoreDetail }) {
  const bannerPath = store.banner
    ? resolveImageUrl(store.banner)
    : storeBannerPath(store.slug);
  const tagline = storeTagline(store.slug, store.description);

  return (
    <div className="-mx-4 md:-mx-6">
      <div className="relative h-48 overflow-hidden md:h-52">
        {bannerPath ? (
          <Image
            src={bannerPath}
            alt={store.name}
            fill
            className="object-cover object-left"
            sizes="100vw"
            priority
          />
        ) : (
          <div className={`h-full w-full ${storeBannerGradientClass(store.slug)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
      </div>
      <div className="relative z-10 -mt-10 px-4 md:px-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-md">
          <div className="flex items-center gap-4">
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border border-gray-200/60 bg-[#E6F4FF]/50">
              <Image
                src={store.logo ? resolveImageUrl(store.logo) : storeLogoPath(store.slug)}
                alt={store.name}
                fill
                className="object-cover"
                sizes="72px"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold text-[#001529] md:text-3xl">
                {store.name}
              </h1>
              {store.city ? (
                <p className="mt-0.5 text-sm text-gray-500">{store.city}</p>
              ) : null}
            </div>
          </div>
          <TrustBadges store={store} className="mt-3" />
          <p className="mt-3 text-gray-700">{tagline}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {store.productCount > 0 ? (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {store.productCount} Produkte
              </span>
            ) : null}
            {store.isFeatured ? (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Empfohlen auf DurmusBaba
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreAboutSection({ store }: { store: StoreDetail }) {
  if (!store.description && store.certifications.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-bold text-[#001529]">
        Über uns
      </h2>
      {store.description ? (
        <p className="mt-3 whitespace-pre-wrap text-gray-700">{store.description}</p>
      ) : null}
      {store.certifications.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {store.certifications.map((cert) => (
            <span
              key={cert}
              className="rounded-full bg-[#E6F4FF] px-3 py-1 text-xs font-medium text-[#001529]"
            >
              {cert}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function StoreDeliverySection({ store }: { store: StoreDetail }) {
  if (!store.deliveryArea && !store.city) return null;

  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-bold text-[#001529]">
        Liefergebiet
      </h2>
      <p className="mt-3 text-gray-700">
        {store.deliveryArea || store.city}
        {store.deliveryArea && store.city ? ` · ${store.city}` : ''}
      </p>
    </section>
  );
}

export function StoreCategoriesSection({ store }: { store: StoreDetail }) {
  if (store.categories.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-bold text-[#001529]">
        Kategorien
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {store.categories.map((category) => (
          <Link
            key={category.id}
            href={`/katalog?storeSlug=${store.slug}&categoryId=${category.id}`}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-[#E6F4FF] hover:text-[#001529]"
          >
            {category.name}
            {category.productCount != null ? ` (${category.productCount})` : ''}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function StoreContactSection({ store }: { store: StoreDetail }) {
  const hasContact = store.contactEmail || store.phone || store.website;
  if (!hasContact) return null;

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-bold text-[#001529]">
        Kontakt
      </h2>
      <div className="mt-4 space-y-2 text-sm">
        {store.contactEmail ? (
          <p>
            E-Mail:{' '}
            <a href={`mailto:${store.contactEmail}`} className="text-[#001529] hover:underline">
              {store.contactEmail}
            </a>
          </p>
        ) : null}
        {store.phone ? (
          <p>
            Telefon:{' '}
            <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="text-[#001529] hover:underline">
              {store.phone}
            </a>
          </p>
        ) : null}
        {store.website ? (
          <p>
            Website:{' '}
            <a
              href={store.website.startsWith('http') ? store.website : `https://${store.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#001529] hover:underline"
            >
              {store.website.replace(/^https?:\/\//, '')}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
