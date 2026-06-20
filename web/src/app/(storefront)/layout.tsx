'use client';

import { Suspense } from 'react';
import { StorefrontHeader, StorefrontFooter } from '@/components/storefront/header-footer';
import { MobileBottomNav } from '@/components/storefront/mobile-bottom-nav';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-hidden">
      <Suspense fallback={<header className="h-[120px] border-b border-[var(--db-border)] md:h-[72px]" />}>
        <StorefrontHeader />
      </Suspense>
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8 lg:px-16">
        {children}
      </main>
      <StorefrontFooter />
      <MobileBottomNav />
    </div>
  );
}
