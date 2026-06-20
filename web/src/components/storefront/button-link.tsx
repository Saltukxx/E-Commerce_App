import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'hero';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'db-btn-primary',
  secondary: 'db-btn-secondary',
  ghost: 'db-btn-ghost',
  hero: 'db-btn-hero',
};

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn('db-btn', variantClass[variant], className)}>
      {children}
    </Link>
  );
}
