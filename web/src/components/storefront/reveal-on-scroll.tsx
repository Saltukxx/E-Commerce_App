'use client';

import { cn } from '@/lib/utils';
import { useInView } from '@/lib/use-in-view';

type DelayStep = 0 | 1 | 2 | 3 | 4;

const delayClass: Record<DelayStep, string> = {
  0: '',
  1: 'motion-delay-1',
  2: 'motion-delay-2',
  3: 'motion-delay-3',
  4: 'motion-delay-4',
};

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: DelayStep;
  as?: 'div' | 'section' | 'article';
}) {
  const { ref, isVisible } = useInView();

  return (
    <Tag
      ref={ref}
      className={cn('motion-fade-up', delayClass[delay], isVisible && 'is-visible', className)}
    >
      {children}
    </Tag>
  );
}
