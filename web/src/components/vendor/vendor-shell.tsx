'use client';

import { useState } from 'react';
import { VendorSidebar } from './vendor-sidebar';
import { VendorHeader } from './vendor-header';
import { PanelMobileNav } from '@/components/panels/panel-mobile-nav';
import { vendorNavLinks } from './vendor-nav';

export function VendorShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] md:flex-row">
      <VendorHeader onMenuClick={() => setMobileOpen(true)} />
      <PanelMobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Händlerportal"
        links={vendorNavLinks}
      />
      <VendorSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-6 md:p-8 md:pb-8">
        {children}
      </main>
    </div>
  );
}
