import type { ReactNode } from 'react';
import { ShieldCheck, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoreTrust } from '@/lib/types';

type TrustInput = Partial<StoreTrust> & {
  isFeatured?: boolean;
  paymentsReady?: boolean;
  responseTimeLabel?: string | null;
};

function TrustPill({
  icon: Icon,
  label,
  compact,
  variant = 'default',
}: {
  icon: typeof ShieldCheck;
  label: string;
  compact?: boolean;
  variant?: 'default' | 'accent' | 'success';
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    accent: 'bg-[#E6F4FF] text-[#001529]',
    success: 'bg-emerald-50 text-emerald-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        variants[variant],
      )}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {label}
    </span>
  );
}

export function TrustBadges({
  store,
  compact = false,
  className,
}: {
  store: TrustInput;
  compact?: boolean;
  className?: string;
}) {
  const badges: Array<{ key: string; node: ReactNode }> = [];

  if (store.isFeatured) {
    badges.push({
      key: 'verified',
      node: (
        <TrustPill
          icon={ShieldCheck}
          label="Geprüfter Händler"
          compact={compact}
          variant="accent"
        />
      ),
    });
  }

  if (store.responseTimeLabel) {
    badges.push({
      key: 'response',
      node: (
        <TrustPill icon={Clock} label={store.responseTimeLabel} compact={compact} />
      ),
    });
  }

  if (store.paymentsReady) {
    badges.push({
      key: 'payments',
      node: (
        <TrustPill
          icon={Lock}
          label="Sicher bezahlen"
          compact={compact}
          variant="success"
        />
      ),
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {badges.map((badge) => (
        <span key={badge.key}>{badge.node}</span>
      ))}
    </div>
  );
}
