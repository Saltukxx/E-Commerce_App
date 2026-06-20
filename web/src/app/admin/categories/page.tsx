'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, PageHeader } from '@/components/ui';
import { adminCategories } from '@/lib/panel-api';
import { DataTable } from '@/components/panels/data-table';
import { ConfirmDialog } from '@/components/panels/confirm-dialog';
import { PanelAlert } from '@/components/panels/panel-feedback';

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', slug: '', image: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminCategories.list(),
  });

  const save = useMutation({
    mutationFn: () =>
      editId
        ? adminCategories.update(editId, form)
        : adminCategories.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setForm({ name: '', slug: '', image: '' });
      setEditId(null);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminCategories.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      setDeleteId(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const rows = (data?.data ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    products: cat.productCount ?? 0,
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditId(cat.id);
            setForm({ name: cat.name, slug: cat.slug, image: cat.image });
          }}
        >
          Bearbeiten
        </Button>
        <Button size="sm" variant="danger" onClick={() => setDeleteId(cat.id)}>
          Löschen
        </Button>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader title="Kategorien" />
      {error ? <PanelAlert tone="error" className="mb-4">{error}</PanelAlert> : null}
      <div className="mb-8 rounded-2xl border bg-white p-4 md:p-6">
        <h2 className="mb-4 font-semibold">{editId ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input placeholder="Bild-URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
            {editId ? 'Aktualisieren' : 'Anlegen'}
          </Button>
          {editId ? (
            <Button variant="secondary" onClick={() => { setEditId(null); setForm({ name: '', slug: '', image: '' }); }}>
              Abbrechen
            </Button>
          ) : null}
        </div>
      </div>
      <DataTable
        isLoading={isLoading}
        keyField="id"
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'slug', header: 'Slug' },
          { key: 'products', header: 'Produkte' },
          { key: 'actions', header: '' },
        ]}
        rows={rows}
      />
      <ConfirmDialog
        open={deleteId != null}
        title="Kategorie löschen?"
        description="Nur möglich wenn keine Produkte zugeordnet sind."
        danger
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </div>
  );
}
