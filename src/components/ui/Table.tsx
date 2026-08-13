import type { ReactNode, TableHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { EmptyState } from './States';
import { LoadingState } from './States';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function AdminTable<T>({
  columns,
  rows,
  isLoading,
  rowKey,
  emptyTitle,
  emptyDescription,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-xl2 border border-primary-100 bg-white">
        <LoadingState label={t('common.loading')} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? t('common.empty')}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl2 border border-primary-100 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-primary-100 bg-ivory text-start">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn('px-4 py-3 text-start font-bold text-primary-900', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-primary-50 transition-colors last:border-0 hover:bg-primary-50/50',
                onRowClick && 'cursor-pointer',
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 align-top text-slateGray-dark', col.className)}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type TableProps = TableHTMLAttributes<HTMLTableElement>;
