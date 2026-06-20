'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutGrid, ShoppingCart, Heart, Package, User, ShieldCheck, Truck, Headphones, Building2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { CatalogSearchForm } from '@/components/storefront/catalog-search-form';
import { cn } from '@/lib/utils';

export function StorefrontHeader() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCatalog = pathname.startsWith('/katalog');
  const catalogQuery = searchParams.get('q') ?? '';
  const catalogCategoryId = searchParams.get('categoryId') ?? undefined;

  return (
    <header className="border-b border-[var(--db-border)] bg-[var(--db-surface)]">
      <div className="mx-auto max-w-7xl px-4 md:px-16">
        <div className="flex items-center justify-between gap-2 py-3 md:gap-4 md:py-4">
          <Link href="/" className="inline-flex shrink-0 items-center">
            <Image
              src="/assets/logo-durmusbaba.png"
              alt="DurmusBaba"
              width={240}
              height={52}
              className="h-10 w-auto sm:h-11 md:h-14"
              priority
            />
          </Link>

          <div className="hidden max-w-xl flex-1 md:block">
            <CatalogSearchForm
              defaultValue={isCatalog ? catalogQuery : ''}
              categoryId={isCatalog ? catalogCategoryId : undefined}
            />
          </div>

          <nav className="flex items-center gap-0.5 text-sm md:gap-2">
            <Link
              href="/katalog"
              className="inline-flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-[var(--db-primary)] md:min-w-0 md:flex-row md:gap-1 md:px-2 md:text-[var(--db-muted)] md:hover:text-[var(--db-primary)]"
            >
              <LayoutGrid className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-semibold md:text-sm md:font-normal">Katalog</span>
            </Link>
            <Link
              href="/haendler"
              className="hidden min-h-[44px] items-center px-2 text-[var(--db-muted)] underline-offset-4 hover:text-[var(--db-primary)] hover:underline lg:inline-flex"
            >
              Händler
            </Link>
            <Link
              href="/warenkorb"
              aria-label="Warenkorb"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--db-primary)]"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link
              href="/wunschliste"
              aria-label="Wunschliste"
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-[var(--db-primary)] sm:inline-flex"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href="/bestellungen"
              aria-label="Bestellungen"
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-[var(--db-primary)] sm:inline-flex"
            >
              <Package className="h-5 w-5" />
            </Link>
            <Link
              href={user ? '/profil' : '/anmelden'}
              aria-label="Profil"
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-[var(--db-primary)] sm:inline-flex"
            >
              <User className="h-5 w-5" />
            </Link>
          </nav>
        </div>

        <div className={cn('pb-3 md:hidden', isCatalog && 'pb-2')}>
          <CatalogSearchForm
            defaultValue={isCatalog ? catalogQuery : ''}
            categoryId={isCatalog ? catalogCategoryId : undefined}
            placeholder={isCatalog ? 'Suchen…' : 'Produkte suchen…'}
            compact={isCatalog}
          />
        </div>
      </div>
    </header>
  );
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Geprüfte Qualität' },
  { icon: Truck, label: 'Schnelle Lieferung' },
  { icon: Headphones, label: 'Persönlicher Support' },
  { icon: Building2, label: 'B2B Marktplatz' },
] as const;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{title}</p>
      <ul className="mt-4 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-[44px] items-center text-sm text-white/80 transition hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[var(--db-primary)] text-white md:mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 pb-24 md:px-16 md:pb-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex">
              <span className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-sm">
                <Image
                  src="/assets/logo-durmusbaba.png"
                  alt="DurmusBaba"
                  width={220}
                  height={48}
                  className="h-9 w-auto sm:h-10"
                />
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Deutschlands HVAC-Marktplatz für Installateure, Fachbetriebe und Profis.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2 text-xs text-white/70">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <FooterLinkGroup
            title="Marktplatz"
            links={[
              { href: '/katalog', label: 'Katalog' },
              { href: '/haendler', label: 'Händler' },
              { href: '/haendler-werden', label: 'Händler werden' },
            ]}
          />

          <FooterLinkGroup
            title="Service"
            links={[
              { href: '/bestellungen', label: 'Bestellungen' },
              { href: '/wunschliste', label: 'Wunschliste' },
              { href: '/warenkorb', label: 'Warenkorb' },
            ]}
          />

          <FooterLinkGroup
            title="Konto"
            links={[
              { href: '/anmelden', label: 'Anmelden' },
              { href: '/profil', label: 'Profil' },
              { href: '/kasse', label: 'Kasse' },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DurmusBaba. Alle Rechte vorbehalten.</p>
          <p>Made in Germany · HVAC Marktplatz</p>
        </div>
      </div>
    </footer>
  );
}
