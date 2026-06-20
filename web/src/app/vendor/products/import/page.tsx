'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Button, PageHeader } from '@/components/ui';
import { vendorProducts } from '@/lib/panel-api';
import { VendorDesktopBar } from '@/components/vendor/vendor-header';
import { PanelAlert } from '@/components/panels/panel-feedback';

export default function VendorProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ total: number; valid: number; invalid: number; rows: Array<{ row: number; title: string; errors: string[] }> } | null>(null);
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewMutation = useMutation({
    mutationFn: (f: File) => vendorProducts.importPreview(f),
    onSuccess: (res) => {
      setPreview(res.data);
      setResult(null);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const importMutation = useMutation({
    mutationFn: (f: File) => vendorProducts.importExecute(f, 'upsert'),
    onSuccess: (res) => {
      setResult(res.data);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div>
      <VendorDesktopBar />
      <PageHeader
        title="Produkt-Import"
        subtitle="Excel oder CSV hochladen"
        action={
          <Link href="/vendor/products"><Button variant="secondary">Zurück</Button></Link>
        }
      />
      {error ? <PanelAlert tone="error" className="mb-4">{error}</PanelAlert> : null}
      <div className="space-y-6 rounded-2xl border border-[var(--db-border)] bg-[var(--db-surface)] p-4 md:p-6">
        <div>
          <h2 className="font-semibold">1. Vorlage herunterladen</h2>
          <p className="mt-1 text-sm text-[var(--db-muted)]">Spalten: title, description, category, price_eur, stockQty, status, slug</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => vendorProducts.downloadTemplate().catch((e: Error) => setError(e.message))}
          >
            CSV-Vorlage
          </Button>
        </div>
        <div>
          <h2 className="font-semibold">2. Datei hochladen</h2>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="mt-2 block w-full text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setPreview(null);
              setResult(null);
            }}
          />
          <Button
            className="mt-3"
            variant="secondary"
            disabled={!file || previewMutation.isPending}
            onClick={() => file && previewMutation.mutate(file)}
          >
            Vorschau
          </Button>
        </div>
        {preview ? (
          <div>
            <h2 className="font-semibold">3. Vorschau</h2>
            <p className="text-sm text-[var(--db-muted)]">
              {preview.valid} gültig · {preview.invalid} fehlerhaft · {preview.total} gesamt
            </p>
            <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto text-sm">
              {preview.rows.slice(0, 50).map((row) => (
                <li key={row.row} className={row.errors.length ? 'text-red-600' : 'text-gray-700'}>
                  Zeile {row.row}: {row.title || '—'}
                  {row.errors.length ? ` — ${row.errors.join(', ')}` : ''}
                </li>
              ))}
            </ul>
            <Button
              className="mt-4"
              disabled={!file || preview.valid === 0 || importMutation.isPending}
              onClick={() => file && importMutation.mutate(file)}
            >
              Import starten
            </Button>
          </div>
        ) : null}
        {result ? (
          <PanelAlert tone="success">
            Import abgeschlossen: {result.created} neu, {result.updated} aktualisiert, {result.skipped} übersprungen.
          </PanelAlert>
        ) : null}
      </div>
    </div>
  );
}
