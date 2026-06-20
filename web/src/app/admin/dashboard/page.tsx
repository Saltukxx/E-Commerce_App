'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, Card } from '@/components/ui';
import { adminDashboard } from '@/lib/panel-api';
import { StatusBadge } from '@/components/panels/status-badge';

export default function AdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminDashboard.stats(),
  });

  const stats = data?.data;

  const cards = [
    { label: 'Bestellungen', value: stats?.orderGroupCount, href: '/admin/orders' },
    { label: 'Offene Bewerbungen', value: stats?.pendingApplications, href: '/admin/store-applications' },
    { label: 'Preisanfragen', value: stats?.pendingPriceInquiries, href: '/admin/price-inquiries' },
    { label: 'Aktive Shops', value: stats?.activeStores, href: '/admin/stores' },
    { label: 'Produkte', value: stats?.productCount, href: '/admin/products' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Plattform-Übersicht" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition hover:border-[#001529]/20 hover:shadow-sm">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">{card.value ?? '—'}</p>
            </Card>
          </Link>
        ))}
      </div>
      {stats?.recentOrders?.length ? (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-[#001529]">Letzte Bestellungen</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-col gap-2 rounded-xl border bg-white p-4 hover:border-[#001529]/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">#{order.id}</span>
                <span>{order.grandTotal.toFixed(2)} €</span>
                <StatusBadge status={order.paymentStatus} kind="payment" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
