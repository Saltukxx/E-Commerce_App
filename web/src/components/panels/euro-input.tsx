'use client';

import { Input } from '@/components/ui';

export function EuroInput({
  valueCents,
  onChangeCents,
  label,
}: {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  label?: string;
}) {
  const euroValue = (valueCents / 100).toFixed(2);

  return (
    <div>
      {label ? <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label> : null}
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={euroValue}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            onChangeCents(Number.isFinite(parsed) ? Math.round(parsed * 100) : 0);
          }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
          €
        </span>
      </div>
    </div>
  );
}

export function centsToEuro(cents: number) {
  return (cents / 100).toFixed(2);
}

export function formatEuroFromCents(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
