import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    toast: push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex min-h-12 w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-3.5 shadow-elevated animate-scale-in',
              toast.kind === 'success' && 'border-green-200',
              toast.kind === 'error' && 'border-red-200',
              toast.kind === 'info' && 'border-primary-100',
            )}
          >
            {toast.kind === 'success' && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            )}
            {toast.kind === 'error' && (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            {toast.kind === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />}
            <p className="flex-1 text-sm font-medium leading-relaxed text-primary-900">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-1 text-slateGray hover:bg-ivory"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
