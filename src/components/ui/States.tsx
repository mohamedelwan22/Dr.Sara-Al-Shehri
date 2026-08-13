import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox, TriangleAlert, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-primary-200 bg-white/60 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-400">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <h3 className="font-display text-lg font-bold text-primary-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-slateGray-dark">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl2 border border-red-100 bg-red-50/60 px-6 py-12 text-center',
        className,
      )}
    >
      <TriangleAlert className="h-10 w-10 text-red-500" />
      <p className="max-w-md text-sm font-medium text-red-800">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-slateGray" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <span className="text-sm font-medium">{label ?? t('common.loading')}</span>
    </div>
  );
}
