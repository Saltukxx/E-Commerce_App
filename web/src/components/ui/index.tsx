import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-50 min-h-11 px-4',
  {
    variants: {
      variant: {
        primary: 'bg-[#001529] text-white hover:bg-[#002a45]',
        secondary: 'border border-[#001529] text-[#001529] hover:bg-[#E6F4FF]',
        ghost: 'text-[#001529] hover:bg-[#E6F4FF]',
        danger: 'bg-red-700 text-white hover:bg-red-800',
      },
      size: {
        sm: 'min-h-9 px-3 text-sm',
        md: 'min-h-11 px-4',
        lg: 'min-h-12 px-6',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#001529] focus:ring-2 focus:ring-[#001529]/20',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#001529] focus:ring-2 focus:ring-[#001529]/20',
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white p-6', className)}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
  };
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:flex-wrap md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold leading-tight text-[#001529] md:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 text-sm text-gray-600 md:mt-2 md:text-base">{subtitle}</p> : null}
      </div>
      {action ? (
        <div className="w-full shrink-0 md:w-auto [&_a]:block [&_button]:w-full md:[&_a]:inline-block md:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
