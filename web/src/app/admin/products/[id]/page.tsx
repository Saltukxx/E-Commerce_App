'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, PageHeader } from '@/components/ui';
import { adminProducts } from '@/lib/panel-api';
import { ProductForm, emptyProductForm, type ProductFormValues } from '@/components/panels/product-form';
import { PanelAlert } from '@/components/panels/panel-feedback';
import { useEffect, useState } from 'react';

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const isNew = params.id === 'new';
  const id = isNew ? 0 : Number(params.id);
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm());
  const [message, setMessage] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminProducts.get(id),
    enabled: !isNew && Number.isFinite(id),
  });

  useEffect(() => {
    const p = data?.data;
    if (!p) return;
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      price: p.price,
      stockQty: p.stockQty,
      categoryId: p.category.id,
      storeId: p.store.id,
      status: p.status,
      images: p.images ?? [],
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        title: form.title,
        slug: form.slug || undefined,
        description: form.description,
        price: form.price,
        stockQty: form.stockQty,
        categoryId: form.categoryId,
        storeId: form.storeId,
        status: form.status,
        images: form.images,
      };
      return isNew
        ? adminProducts.create(body)
        : adminProducts.update(id, body);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setMessage('Gespeichert.');
      if (isNew && res?.data?.id) {
        router.replace(`/admin/products/${res.data.id}`);
      }
    },
    onError: (e: Error) => setMessage(e.message),
  });

  return (
    <div>
      <PageHeader
        title={isNew ? 'Neues Produkt' : 'Produkt bearbeiten'}
        action={
          <Link href="/admin/products">
            <Button variant="secondary">Zurück</Button>
          </Link>
        }
      />
      {message ? <PanelAlert tone={message.includes('Gespeichert') ? 'success' : 'error'} className="mb-4">{message}</PanelAlert> : null}
      <div className="rounded-2xl border bg-white p-4 md:p-6">
        <ProductForm
          values={form}
          onChange={setForm}
          showStoreSelect
          productId={isNew ? undefined : id}
          mode="admin"
        />
        <Button
          className="mt-6"
          onClick={() => save.mutate()}
          disabled={save.isPending || !form.title.trim() || !form.description.trim() || !form.categoryId || !form.storeId}
        >
          Speichern
        </Button>
      </div>
    </div>
  );
}
