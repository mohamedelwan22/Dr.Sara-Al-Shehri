import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ContentStatus } from '@/types';

export function Badge({
  children,
  tone = 'primary',
  className,
}: {
  children: ReactNode;
  tone?: 'primary' | 'gold' | 'green' | 'red' | 'gray' | 'ivory';
  className?: string;
}) {
  const tones: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-800',
    gold: 'bg-gold-100 text-gold-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-slate-100 text-slate-600',
    ivory: 'bg-ivory text-primary-800',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', tones[tone], className)}>
      {children}
    </span>
  );
}

const statusTone: Record<ContentStatus, 'primary' | 'gold' | 'green' | 'red' | 'gray'> = {
  draft: 'gray',
  published: 'green',
  scheduled: 'gold',
  archived: 'red',
};

const statusLabelKey: Record<ContentStatus, string> = {
  draft: 'common.draft',
  published: 'common.published',
  scheduled: 'common.scheduled',
  archived: 'common.archived',
};

export function StatusBadge({
  status,
  labels,
}: {
  status: ContentStatus;
  labels: Record<ContentStatus, string>;
}) {
  return <Badge tone={statusTone[status]}>{labels[status] ?? statusLabelKey[status]}</Badge>;
}
