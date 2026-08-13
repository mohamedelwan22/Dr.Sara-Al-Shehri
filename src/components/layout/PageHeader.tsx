import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-b border-primary-100 bg-gradient-to-b from-primary-50/60 to-white', className)}>
      <div className="container-page py-10 text-center sm:py-12">
        <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h1>
        <div className="gold-divider" />
        {subtitle && <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slateGray-dark sm:text-base">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
