import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
}

export function FieldWrapper({
  label,
  error,
  hint,
  id,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="label-field">
          {label}
        </label>
      )}
      {children}
      {error ? <p className="error-text">{error}</p> : hint ? <p className="mt-1.5 text-xs text-slateGray">{hint}</p> : null}
    </div>
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn('input-field', error && 'border-red-400 focus:border-red-500 focus:ring-red-100', className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  function Textarea({ className, error, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn('input-field min-h-28 resize-y', error && 'border-red-400', className)}
        {...props}
      />
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn('input-field appearance-none', error && 'border-red-400', className)}
      {...props}
    >
      {children}
    </select>
  );
});

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className, ...props },
  ref,
) {
  return (
    <label htmlFor={id} className={cn('inline-flex min-h-11 cursor-pointer items-center gap-2.5', className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        {...props}
      />
      {label && <span className="text-sm font-medium text-primary-900">{label}</span>}
    </label>
  );
});

export interface RadioOption {
  value: string;
  label: string;
}

export function RadioGroup({
  id,
  name,
  options,
  value,
  onChange,
  label,
}: {
  id: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="mb-4">
      {label && <span className="label-field">{label}</span>}
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${id}-${option.value}`}
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
              value === option.value
                ? 'border-primary-500 bg-primary-50 text-primary-800'
                : 'border-slate-200 bg-white text-primary-900 hover:border-primary-300',
            )}
          >
            <input
              type="radio"
              id={`${id}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
