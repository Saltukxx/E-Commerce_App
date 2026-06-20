'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  Package,
  MessageSquareQuote,
  ShoppingBag,
  CreditCard,
  FolderTree,
} from 'lucide-react';
import { PanelHeader, PanelUserFooter } from './panel-header';
import { PanelMobileNav, type PanelNavLink } from './panel-mobile-nav';

const adminLinks: PanelNavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/store-applications', label: 'Bewerbungen', icon: Store },
  { href: '/admin/stores', label: 'Shops', icon: Store },
  { href: '/admin/categories', label: 'Kategorien', icon: FolderTree },
  { href: '/admin/products', label: 'Produkte', icon: Package },
  { href: '/admin/orders', label: 'Bestellungen', icon: ShoppingBag },
  { href: '/admin/price-inquiries', label: 'Preisanfragen', icon: MessageSquareQuote },
  { href: '/admin/payout-requests', label: 'Auszahlungen', icon: CreditCard },
];

const vendorLinks: PanelNavLink[] = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'Produkte', icon: Package },
  { href: '/vendor/orders', label: 'Bestellungen', icon: ShoppingBag },
  { href: '/vendor/price-inquiries', label: 'Preisanfragen', icon: MessageSquareQuote },
  { href: '/vendor/store', label: 'Shop-Profil', icon: Store },
];

function PanelSidebar({
  title,
  homeHref,
  links,
}: {
  title: string;
  homeHref: string;
  links: PanelNavLink[];
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-6 md:flex">
      <Link
        href={homeHref}
        className="mb-8 block font-[family-name:var(--font-plus-jakarta)] text-lg font-bold text-[#001529]"
      >
        {title}
      </Link>
      <nav className="flex flex-1 flex-col space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
              pathname.startsWith(href)
                ? 'bg-[#E6F4FF] font-semibold text-[#001529]'
                : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <PanelUserFooter />
    </aside>
  );
}

export function AdminSidebar() {
  return <PanelSidebar title="Admin" homeHref="/admin/dashboard" links={adminLinks} />;
}

export function VendorSidebar() {
  return (
    <PanelSidebar title="Händlerportal" homeHref="/vendor/dashboard" links={vendorLinks} />
  );
}

export function PanelShell({
  sidebar,
  mobileTitle,
  mobileLinks,
  children,
}: {
  sidebar: React.ReactNode;
  mobileTitle: string;
  mobileLinks: PanelNavLink[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#f9f9f9] md:flex-row">
      <PanelHeader title={mobileTitle} onMenuClick={() => setMobileOpen(true)} />
      <PanelMobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title={mobileTitle}
        links={mobileLinks}
      />
      {sidebar}
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-6 md:p-8 md:pb-8">
        {children}
      </main>
    </div>
  );
}

export { adminLinks, vendorLinks, CreditCard };
