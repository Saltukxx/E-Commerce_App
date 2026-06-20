'use client';

import { Input, Textarea } from '@/components/ui';
import { CategorySelect } from './category-select';
import { StoreSelect } from './store-select';
import { EuroInput } from './euro-input';
import { ProductImagesField } from './image-upload-field';

export type ProductFormValues = {
  title: string;
  slug: string;
  description: string;
  price: number;
  stockQty: number | null;
  categoryId: number;
  storeId?: number;
  status: string;
  images: string[];
};

const PRODUCT_STATUSES = [
  { value: 'active', label: 'Aktiv' },
  { value: 'draft', label: 'Entwurf' },
  { value: 'archived', label: 'Archiviert' },
];

export function ProductForm({
  values,
  onChange,
  showStoreSelect = false,
  productId,
  mode,
}: {
  values: ProductFormValues;
  onChange: (values: ProductFormValues) => void;
  showStoreSelect?: boolean;
  productId?: number;
  mode: 'admin' | 'vendor';
}) {
  function set<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) {
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Titel</label>
        <Input value={values.title} onChange={(e) => set('title', e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Slug (optional)</label>
        <Input value={values.slug} onChange={(e) => set('slug', e.target.value)} />
      </div>
      {showStoreSelect ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Shop</label>
          <StoreSelect value={values.storeId ?? 0} onChange={(id) => set('storeId', id)} />
        </div>
      ) : null}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Kategorie</label>
        <CategorySelect
          value={values.categoryId}
          onChange={(id) => set('categoryId', id)}
          admin={mode === 'admin'}
        />
      </div>
      <div>
        {mode === 'vendor' ? (
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.price === 0}
              onChange={(e) => set('price', e.target.checked ? 0 : 100)}
            />
            Preis auf Anfrage
          </label>
        ) : null}
        {values.price === 0 && mode === 'vendor' ? (
          <p className="text-sm text-[var(--db-muted)]">Kunden sehen „Preis auf Anfrage“ im Shop.</p>
        ) : (
          <EuroInput label="Preis" valueCents={values.price} onChangeCents={(c) => set('price', c)} />
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Bestand (leer = nicht verfolgt)</label>
        <Input
          type="number"
          min="0"
          value={values.stockQty ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            set('stockQty', v === '' ? null : Number(v));
          }}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
          value={values.status}
          onChange={(e) => set('status', e.target.value)}
        >
          {PRODUCT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Beschreibung</label>
        <Textarea
          rows={4}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <ProductImagesField
          images={values.images}
          onChange={(imgs) => set('images', imgs)}
          productId={productId}
          mode={mode}
        />
      </div>
    </div>
  );
}

export const emptyProductForm = (overrides?: Partial<ProductFormValues>): ProductFormValues => ({
  title: '',
  slug: '',
  description: '',
  price: 0,
  stockQty: null,
  categoryId: 0,
  storeId: 0,
  status: 'active',
  images: [],
  ...overrides,
});
