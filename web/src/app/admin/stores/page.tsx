'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, Button } from '@/components/ui';
import { adminStores } from '@/lib/panel-api';
import { DataTable } from '@/components/panels/data-table';
import { StatusBadge } from '@/components/panels/status-badge';

export default function AdminStoresPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => adminStores.list(),
  });

  const rows = (data?.data ?? []).map((store) => ({
    id: store.id,
    name: store.name,
    status: <StatusBadge status={store.status} kind="store" />,
    featured: store.isFeatured ? 'Ja' : 'Nein',
    payments: store.paymentsReady ? 'Bereit' : '—',
    actions: (
      <Link href={`/admin/stores/${store.id}`}>
        <Button size="sm" variant="secondary">
          Details
        </Button>
      </Link>
    ),
  }));

  return (
    <div>
      <PageHeader title="Shops" subtitle="Alle Marktplatz-Händler verwalten" />
      <DataTable
        isLoading={isLoading}
        keyField="id"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' },
          { key: 'featured', header: 'Featured' },
          { key: 'payments', header: 'Zahlungen' },
          { key: 'actions', header: '' },
        ]}
        rows={rows}
        emptyTitle="Keine Shops"
      />
    </div>
  );
}
