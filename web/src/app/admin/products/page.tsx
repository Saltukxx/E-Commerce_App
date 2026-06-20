'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, PageHeader } from '@/components/ui';
import { adminProducts } from '@/lib/panel-api';
import { DataTable } from '@/components/panels/data-table';
import { Pagination } from '@/components/panels/pagination';
import { ConfirmDialog } from '@/components/panels/confirm-dialog';
import { StatusBadge } from '@/components/panels/status-badge';
import { formatEuroFromCents } from '@/components/panels/euro-input';
import { StoreSelect } from '@/components/panels/store-select';
import { CategorySelect } from '@/components/panels/category-select';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [storeId, setStoreId] = useState(0);
  const [categoryId, setCategoryId] = useState(0);
  const [skip, setSkip] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', q, storeId, categoryId, skip],
    queryFn: () =>
      adminProducts.list({
        q,
        storeId: storeId || undefined,
        categoryId: categoryId || undefined,
        skip,
        limit,
      }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminProducts.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteId(null);
    },
  });

  const rows = (data?.data ?? []).map((product) => ({
    id: product.id,
    title: product.title,
    store: product.store.name,
    price: formatEuroFromCents(product.price),
    status: <StatusBadge status={product.status} kind="product" />,
    actions: (
      <div className="flex gap-2">
        <Link href={`/admin/products/${product.id}`}>
          <Button size="sm" variant="secondary">Bearbeiten</Button>
        </Link>
        <Button size="sm" variant="danger" onClick={() => setDeleteId(product.id)}>Löschen</Button>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader
        title="Produkte"
        action={
          <Link href="/admin/products/new">
            <Button>Neues Produkt</Button>
          </Link>
        }
      />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Suchen…" value={q} onChange={(e) => { setQ(e.target.value); setSkip(0); }} />
        <StoreSelect value={storeId} onChange={(id) => { setStoreId(id); setSkip(0); }} />
        <CategorySelect admin value={categoryId} onChange={(id) => { setCategoryId(id); setSkip(0); }} />
      </div>
      <DataTable
        isLoading={isLoading}
        keyField="id"
        columns={[
          { key: 'title', header: 'Produkt' },
          { key: 'store', header: 'Shop' },
          { key: 'price', header: 'Preis' },
          { key: 'status', header: 'Status' },
          { key: 'actions', header: '' },
        ]}
        rows={rows}
      />
      {data?.meta ? <Pagination meta={data.meta} onPageChange={setSkip} /> : null}
      <ConfirmDialog
        open={deleteId != null}
        title="Produkt löschen?"
        danger
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </div>
  );
}
