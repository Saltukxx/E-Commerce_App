'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui';
import { vendorDashboard } from '@/lib/panel-api';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function VendorAnalyticsPage() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');

  const from = new Date();
  from.setDate(from.getDate() - Number(range));

  const { data } = useQuery({
    queryKey: ['vendor-stats', range],
    queryFn: () =>
      vendorDashboard.stats({
        from: from.toISOString().slice(0, 10),
        to: new Date().toISOString().slice(0, 10),
      }),
  });

  const stats = data?.data;
  const chartData = [...(stats?.dailyRevenue ?? [])].reverse();

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader title="Analytics" subtitle="Umsatz & Performance" />
      <div className="mb-6 flex gap-2">
        {(['7', '30', '90'] as const).map((d) => (
          <button
            key={d}
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm ${range === d ? 'bg-[var(--db-primary)] text-white' : 'border'}`}
            onClick={() => setRange(d)}
          >
            {d} Tage
          </button>
        ))}
      </div>
      <div className="mb-8 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
        <h2 className="mb-4 font-semibold">Umsatz</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${Number(v ?? 0).toFixed(2)} €`, 'Umsatz']} />
              <Bar dataKey="revenue" fill="#001529" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
          <h2 className="mb-4 font-semibold">Top Produkte</h2>
          <ul className="space-y-2 text-sm">
            {(stats?.topProducts ?? []).map((p) => (
              <li key={p.productId} className="flex justify-between">
                <span className="truncate pr-2">{p.title}</span>
                <span className="shrink-0 font-medium">{p.quantity}×</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4">
          <h2 className="mb-4 font-semibold">Produkte nach Kategorie</h2>
          <ul className="space-y-2 text-sm">
            {(stats?.productsByCategory ?? []).map((c) => (
              <li key={c.categoryId} className="flex justify-between">
                <span>{c.categoryName}</span>
                <span className="font-medium">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
