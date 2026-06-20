'use client';

import { Button } from '@/components/ui';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Bestätigen',
  danger,
  loading,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onCancel} aria-label="Schließen" />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-[#001529]">{title}</h3>
        {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onCancel} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            className="w-full sm:w-auto"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
