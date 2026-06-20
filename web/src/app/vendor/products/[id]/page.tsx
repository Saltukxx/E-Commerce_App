'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, PageHeader } from '@/components/ui';
import { vendorProducts } from '@/lib/panel-api';
import { ProductForm, emptyProductForm, type ProductFormValues } from '@/components/panels/product-form';
import { PanelAlert } from '@/components/panels/panel-feedback';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { VendorSuspendedAlert } from '@/components/vendor/vendor-suspended-alert';
import { vendorStore } from '@/lib/panel-api';

export default function VendorProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const isNew = params.id === 'new';
  const id = isNew ? 0 : Number(params.id);
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm());
  const [message, setMessage] = useState<string | null>(null);

  const { data: storeData } = useQuery({ queryKey: ['vendor-store'], queryFn: () => vendorStore.get() });
  const suspended = storeData?.data?.status === 'suspended';

  const { data } = useQuery({
    queryKey: ['vendor-product', id],
    queryFn: () => vendorProducts.get(id),
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
        status: form.status,
        images: form.images,
      };
      return isNew ? vendorProducts.create(body) : vendorProducts.update(id, body);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vendor-products'] });
      setMessage('Gespeichert.');
      if (isNew && res?.data?.id) {
        router.replace(`/vendor/products/${res.data.id}`);
      }
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const slug = form.slug || data?.data?.slug;

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader
        title={isNew ? 'Neues Produkt' : 'Produkt bearbeiten'}
        action={
          <div className="flex gap-2">
            {!isNew && slug && form.status === 'active' ? (
              <Link href={`/produkt/${slug}`} target="_blank">
                <Button variant="secondary">Im Shop ansehen</Button>
              </Link>
            ) : null}
            {!isNew && form.status === 'draft' ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Entwurf — nicht im Shop sichtbar</span>
            ) : null}
            <Link href="/vendor/products">
              <Button variant="secondary">Zurück</Button>
            </Link>
          </div>
        }
      />
      {suspended ? <VendorSuspendedAlert /> : null}
      {message ? (
        <PanelAlert tone={message === 'Gespeichert.' ? 'success' : 'error'} className="mb-4">
          {message}
        </PanelAlert>
      ) : null}
      <div className="rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 md:p-6">
        <ProductForm
          values={form}
          onChange={setForm}
          productId={isNew ? undefined : id}
          mode="vendor"
        />
        <Button
          className="mt-6"
          onClick={() => save.mutate()}
          disabled={save.isPending || suspended || !form.title || !form.categoryId}
        >
          Speichern
        </Button>
      </div>
    </div>
  );
}
