import {
  BarChart3,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  ShoppingBag,
  Store,
  Upload,
  Wallet,
} from 'lucide-react';
import type { PanelNavLink } from '@/components/panels/panel-mobile-nav';

export const vendorNavLinks: PanelNavLink[] = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'Produkte', icon: Package },
  { href: '/vendor/products/import', label: 'Import', icon: Upload },
  { href: '/vendor/orders', label: 'Bestellungen', icon: ShoppingBag },
  { href: '/vendor/price-inquiries', label: 'Preisanfragen', icon: MessageSquareQuote },
  { href: '/vendor/store', label: 'Shop-Profil', icon: Store },
  { href: '/vendor/finance', label: 'Finanzen', icon: Wallet },
  { href: '/vendor/analytics', label: 'Analytics', icon: BarChart3 },
];
