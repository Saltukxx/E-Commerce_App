'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, PageHeader } from '@/components/ui';
import { vendorCategories, vendorProducts } from '@/lib/panel-api';
import { DataTable } from '@/components/panels/data-table';
import { Pagination } from '@/components/panels/pagination';
import { ConfirmDialog } from '@/components/panels/confirm-dialog';
import { StatusBadge } from '@/components/panels/status-badge';
import { formatEuroFromCents } from '@/components/panels/euro-input';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { VendorSuspendedAlert } from '@/components/vendor/vendor-suspended-alert';
import { vendorStore } from '@/lib/panel-api';
import { resolveImageUrl } from '@/lib/utils';

export default function VendorProductsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [status, setStatus] = useState('');
  const [priceType, setPriceType] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [skip, setSkip] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const limit = 20;

  const { data: storeData } = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const suspended = storeData?.data?.status === 'suspended';

  const { data: categoriesData } = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: () => vendorCategories.list(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products', q, categoryId, status, priceType, lowStock, skip],
    queryFn: () =>
      vendorProducts.list({
        q,
        categoryId: categoryId || undefined,
        status: status || undefined,
        priceType: priceType || undefined,
        lowStock: lowStock || undefined,
        skip,
        limit,
      }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => vendorProducts.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      setDeleteId(null);
    },
  });

  const duplicate = useMutation({
    mutationFn: (id: number) => vendorProducts.duplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  });

  const bulkStatus = useMutation({
    mutationFn: (s: string) => vendorProducts.bulkUpdate({ ids: selected, status: s }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      setSelected([]);
    },
  });

  const categories = categoriesData?.data ?? [];
  const products = data?.data ?? [];

  const rows = products.map((product) => ({
    id: product.id,
    thumb: product.images[0] ? (
      <div className="relative h-10 w-10 overflow-hidden rounded-lg border">
        <Image src={resolveImageUrl(product.images[0])} alt="" fill className="object-cover" sizes="40px" />
      </div>
    ) : '—',
    title: product.title,
    category: product.category.name,
    price: product.price === 0 ? 'Preis auf Anfrage' : formatEuroFromCents(product.price),
    stock: product.stockQty ?? '—',
    status: <StatusBadge status={product.status} kind="product" />,
    select: (
      <input
        type="checkbox"
        checked={selected.includes(product.id)}
        onChange={(e) =>
          setSelected((prev) =>
            e.target.checked ? [...prev, product.id] : prev.filter((x) => x !== product.id),
          )
        }
      />
    ),
    actions: (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/vendor/products/${product.id}`}>
          <Button size="sm" variant="secondary">Bearbeiten</Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={() => duplicate.mutate(product.id)} disabled={suspended}>
          Kopieren
        </Button>
        <Button size="sm" variant="danger" onClick={() => setDeleteId(product.id)} disabled={suspended}>
          Löschen
        </Button>
      </div>
    ),
  }));

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader
        title="Produkte"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/vendor/products/import"><Button variant="secondary">Import</Button></Link>
            <Link href="/vendor/products/new"><Button>Neues Produkt</Button></Link>
          </div>
        }
      />
      {suspended ? <VendorSuspendedAlert /> : null}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${categoryId === 0 ? 'bg-[var(--db-primary)] text-white' : 'border'}`}
          onClick={() => { setCategoryId(0); setSkip(0); }}
        >
          Alle
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${categoryId === c.id ? 'bg-[var(--db-primary)] text-white' : 'border'}`}
            onClick={() => { setCategoryId(c.id); setSkip(0); }}
          >
            {c.name} ({c.productCount})
          </button>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Suchen…" value={q} onChange={(e) => { setQ(e.target.value); setSkip(0); }} />
        <select className="rounded-lg border px-3 py-2.5 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setSkip(0); }}>
          <option value="">Alle Status</option>
          <option value="active">Aktiv</option>
          <option value="draft">Entwurf</option>
          <option value="archived">Archiviert</option>
        </select>
        <select className="rounded-lg border px-3 py-2.5 text-sm" value={priceType} onChange={(e) => { setPriceType(e.target.value); setSkip(0); }}>
          <option value="">Alle Preise</option>
          <option value="fixed">Festpreis</option>
          <option value="quote">Preis auf Anfrage</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowStock} onChange={(e) => { setLowStock(e.target.checked); setSkip(0); }} />
          Niedriger Bestand
        </label>
      </div>
      {selected.length > 0 && !suspended ? (
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border bg-white p-3">
          <span className="text-sm">{selected.length} ausgewählt</span>
          {['active', 'draft', 'archived'].map((s) => (
            <Button key={s} size="sm" variant="secondary" onClick={() => bulkStatus.mutate(s)}>{s}</Button>
          ))}
        </div>
      ) : null}
      <DataTable
        isLoading={isLoading}
        keyField="id"
        columns={[
          { key: 'select', header: '', hideOnMobile: true },
          { key: 'thumb', header: '', hideOnMobile: true },
          { key: 'title', header: 'Produkt' },
          { key: 'category', header: 'Kategorie' },
          { key: 'price', header: 'Preis' },
          { key: 'stock', header: 'Bestand' },
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
