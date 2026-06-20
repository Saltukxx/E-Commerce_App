'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PanelUserFooter } from './panel-header';

export type PanelNavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function PanelMobileNav({
  open,
  onClose,
  title,
  links,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  links: PanelNavLink[];
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Menü schließen"
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(100vw-2rem,18rem)] flex-col overflow-y-auto bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-[family-name:var(--font-plus-jakarta)] text-lg font-bold text-[#001529]">
            {title}
          </span>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
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
    </div>
  );
}
