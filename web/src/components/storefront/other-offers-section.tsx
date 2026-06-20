import Link from 'next/link';
import { formatEuro } from '@/lib/utils';
import type { Product } from '@/lib/types';

export function OtherOffersSection({
  offers,
  productSlug,
}: {
  offers: Product[];
  productSlug: string;
}) {
  if (offers.length === 0) return null;

  return (
    <section className="mt-10 border-t border-[var(--db-border)] pt-8">
      <h2 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-bold text-[var(--db-primary)]">
        Weitere Angebote
      </h2>
      <p className="mt-1 text-sm text-[var(--db-muted)]">
        Dasselbe Produkt von anderen Händlern auf dem Marktplatz
      </p>
      <ul className="mt-4 space-y-3">
        {offers.map((offer) => (
          <li key={offer.id}>
            <Link
              href={`/produkt/${productSlug}?store=${offer.store.slug}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--db-border)] bg-[var(--db-surface)] px-4 py-3 transition hover:border-[var(--db-primary)]/20"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--db-primary)]">{offer.store.name}</p>
                <p className="text-sm text-[var(--db-muted)]">{offer.title}</p>
              </div>
              <p className="shrink-0 font-semibold text-[var(--db-primary)]">
                {offer.price === 0 ? 'Preis auf Anfrage' : formatEuro(offer.price)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
