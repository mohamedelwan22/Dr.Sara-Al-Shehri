import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-xs',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-7 py-3 text-base',
  icon: 'min-h-11 min-w-11 px-0 py-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});
