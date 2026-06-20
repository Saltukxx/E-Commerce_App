'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MOBILE_ASSETS } from '@/lib/mobile-assets';

export function MarketingHero() {
  return (
    <section aria-label="DurmusBaba Marktplatz" className="hero-animate-in">
      <div className="overflow-hidden rounded-2xl border border-[var(--db-border)] bg-white shadow-sm md:rounded-3xl">
        <div className="relative aspect-[1672/941] w-full">
          <Image
            src={MOBILE_ASSETS.welcomeBanner}
            alt="DurmusBaba – Deutschlands HVAC-Marktplatz für Lüftung, Klima und Kältetechnik"
            fill
            priority
            className="object-contain object-center"
            sizes="(max-width:768px) 100vw, 1280px"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--db-muted)]">
          Tausende Artikel von geprüften Fachhändlern — an einem Ort einkaufen.
        </p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--db-primary)] hover:underline"
        >
          Zum Katalog
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
