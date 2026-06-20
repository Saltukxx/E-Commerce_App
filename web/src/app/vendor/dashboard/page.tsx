'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, Card, Button } from '@/components/ui';
import { vendorDashboard, vendorFinance, vendorStore } from '@/lib/panel-api';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { VendorSuspendedAlert } from '@/components/vendor/vendor-suspended-alert';
import { StatusBadge } from '@/components/panels/status-badge';
import { formatEuroFromCents } from '@/components/panels/euro-input';
import { SectionHeader } from '@/components/storefront/home/section-header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function VendorDashboardPage() {
  const storeQuery = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const statsQuery = useQuery({ queryKey: ['vendor-stats'], queryFn: () => vendorDashboard.stats() });
  const financeQuery = useQuery({ queryKey: ['vendor-finance-summary'], queryFn: () => vendorFinance.summary() });

  const store = storeQuery.data?.data;
  const stats = statsQuery.data?.data;
  const finance = financeQuery.data?.data;
  const suspended = store?.status === 'suspended';

  const cards = [
    { label: 'Umsatz', value: stats ? `${stats.revenueTotal.toFixed(2)} €` : '—', href: '/vendor/analytics' },
    { label: 'Bestellungen', value: stats?.orderCount, href: '/vendor/orders' },
    { label: 'Offene Bestellungen', value: stats?.pendingOrders, href: '/vendor/orders' },
    { label: 'Preisanfragen', value: stats?.pendingInquiries, href: '/vendor/price-inquiries' },
    { label: 'Produkte', value: stats?.productCount, href: '/vendor/products' },
    { label: 'Niedriger Bestand', value: stats?.lowStockCount, href: '/vendor/products?lowStock=1' },
  ];

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader title="Dashboard" subtitle={store?.name} />
      {suspended ? <VendorSuspendedAlert /> : null}
      {finance ? (
        <Card className="mb-6 border-[var(--db-border)] bg-[var(--db-surface)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--db-muted)]">Verfügbares Guthaben</p>
              <p className="text-2xl font-bold text-[var(--db-primary)]">
                {formatEuroFromCents(finance.availableCents)}
              </p>
            </div>
            <Link href="/vendor/finance">
              <Button>Auszahlung anfordern</Button>
            </Link>
          </div>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="card-lift border-[var(--db-border)] bg-[var(--db-surface)] transition hover:border-[var(--db-primary)]/20">
              <p className="text-sm text-[var(--db-muted)]">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--db-primary)]">{card.value ?? '—'}</p>
            </Card>
          </Link>
        ))}
      </div>
      {stats?.dailyRevenue?.length ? (
        <div className="mt-10 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
          <SectionHeader eyebrow="Analytics" title="Umsatz (30 Tage)" href="/vendor/analytics" />
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...stats.dailyRevenue].reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${Number(v ?? 0).toFixed(2)} €`, 'Umsatz']} />
                <Bar dataKey="revenue" fill="#001529" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
      {stats?.recentOrders?.length ? (
        <div className="mt-10">
          <SectionHeader eyebrow="Aktivität" title="Letzte Bestellungen" href="/vendor/orders" />
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/vendor/orders/${order.id}`}
                className="flex flex-col gap-2 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-medium">#{order.id}</span>
                  <span className="ml-2 text-sm text-[var(--db-muted)]">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{order.totalAmount.toFixed(2)} €</span>
                  <StatusBadge status={order.status} kind="order" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Link href="/vendor/products/new"><Button>Neues Produkt</Button></Link>
        <Link href="/vendor/products/import"><Button variant="secondary">Import</Button></Link>
        <Link href="/vendor/store"><Button variant="secondary">Shop-Profil</Button></Link>
      </div>
    </div>
  );
}
