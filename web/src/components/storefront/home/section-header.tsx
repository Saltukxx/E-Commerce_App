import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = 'Alle anzeigen',
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4 md:mb-8', className)}>
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--db-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold tracking-tight text-[var(--db-primary)] md:text-3xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 max-w-xl text-sm text-[var(--db-muted)]">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-[var(--db-primary)] underline-offset-4 hover:underline"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
