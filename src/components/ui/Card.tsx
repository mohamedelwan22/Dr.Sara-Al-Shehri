import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between gap-3 p-5 pb-0', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-display text-lg font-bold text-primary-900', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between gap-3 p-5 pt-0', className)} {...props} />;
}

export function MetricChip({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <span className="metric-chip">
      {icon}
      <span className="font-bold text-primary-900">{value}</span>
      <span className="text-slateGray">{label}</span>
    </span>
  );
}

export function SectionHeading({
  title,
  subtitle,
  className,
  align = 'center',
}: {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'center' | 'start';
}) {
  return (
    <div
      className={cn(
        'mb-8',
        align === 'center' ? 'text-center' : 'text-start',
        className,
      )}
    >
      <h2 className="section-heading">{title}</h2>
      <div className={cn('gold-divider', align === 'start' && 'ms-0')} />
      {subtitle && <p className="mt-3 text-sm text-slateGray-dark">{subtitle}</p>}
    </div>
  );
}
