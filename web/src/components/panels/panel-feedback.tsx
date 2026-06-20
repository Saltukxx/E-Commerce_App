'use client';

import { cn } from '@/lib/utils';

export function PanelAlert({
  tone = 'info',
  children,
  className,
}: {
  tone?: 'info' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm', tones[tone], className)}>
      {children}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-[#001529]">{title}</p>
      {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
    </div>
  );
}

export function LoadingBlock({ label = 'Laden…' }: { label?: string }) {
  return <p className="text-sm text-gray-500">{label}</p>;
}
