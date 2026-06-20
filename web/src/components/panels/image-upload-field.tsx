'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { resolveImageUrl } from '@/lib/utils';
import { apiUpload } from '@/lib/panel-api';

export function ImageUploadField({
  label,
  value,
  onChange,
  uploadPath,
}: {
  label: string;
  value: string;
  onChange: (path: string) => void;
  uploadPath:
    | 'admin/uploads/product-image'
    | 'admin/uploads/store-banner'
    | 'vendor/uploads/product-image'
    | 'vendor/uploads/store-banner';
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const path = await apiUpload(uploadPath, file);
      onChange(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap items-start gap-4">
        {value ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <Image src={resolveImageUrl(value)} alt="" fill className="object-cover" sizes="80px" />
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          {uploading ? <p className="text-xs text-gray-500">Wird hochgeladen…</p> : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          {value ? (
            <Button size="sm" variant="ghost" onClick={() => onChange('')}>
              Entfernen
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ProductImagesField({
  images,
  onChange,
  productId,
  mode,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  productId?: number;
  mode: 'admin' | 'vendor';
}) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      if (productId) {
        const path = await apiUpload(
          mode === 'admin'
            ? `admin/uploads/products/${productId}/images`
            : `vendor/uploads/products/${productId}/images`,
          file,
        );
        onChange([...images, path]);
      } else {
        const path = await apiUpload(
          mode === 'admin' ? 'admin/uploads/product-image' : 'vendor/uploads/product-image',
          file,
        );
        onChange([...images, path]);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">Bilder</label>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={`${img}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border">
            <Image src={resolveImageUrl(img)} alt="" fill className="object-cover" sizes="80px" />
            <button
              type="button"
              className="absolute right-0 top-0 bg-red-600 px-1 text-xs text-white"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        className="mt-2 text-sm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
