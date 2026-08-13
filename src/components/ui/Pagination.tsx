import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const pages = getPageWindow(page, totalPages);

  return (
    <nav
      className={cn('mt-8 flex items-center justify-center gap-1', className)}
      aria-label={t('common.page')}
    >
      <button
        type="button"
        className="btn-outline min-h-10 px-3 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label={t('common.previous')}
      >
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </button>

      {pages.map((p, index) =>
        p === '…' ? (
          <span key={`gap-${index}`} className="px-2 text-slateGray">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(Number(p))}
            className={cn(
              'min-h-10 min-w-10 rounded-lg px-3 text-sm font-bold transition-colors',
              p === page
                ? 'bg-primary-600 text-white'
                : 'text-primary-800 hover:bg-primary-50',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className="btn-outline min-h-10 px-3 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label={t('common.next')}
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      </button>
    </nav>
  );
}

function getPageWindow(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: Array<number | '…'> = [1];
  if (page > 3) pages.push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push('…');
  pages.push(totalPages);
  return pages;
}
