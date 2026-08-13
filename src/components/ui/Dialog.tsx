import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export function Dialog({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const restoreFocus = () => {
      ref.current?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus();
    };
    const timer = setTimeout(restoreFocus, 50);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-primary-900/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        ref={ref}
        className={cn(
          'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-elevated animate-scale-in sm:rounded-2xl',
          sizes[size],
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-primary-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="font-display text-lg font-bold text-primary-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slateGray transition-colors hover:bg-ivory hover:text-primary-900"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <p className="mb-6 text-sm leading-relaxed text-slateGray-dark">{message}</p>
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
