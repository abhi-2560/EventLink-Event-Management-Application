import { cn } from '../../utils/helpers';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldLabelProps = { htmlFor?: string; label?: ReactNode; required?: boolean; className?: string };
type FieldProps = { label?: ReactNode; error?: unknown };

function FieldLabel({ htmlFor, label, required, className }: FieldLabelProps) {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-slate-700', className)}>
      {label}
      {required && <span className="text-danger" aria-hidden="true"> *</span>}
    </label>
  );
}

export default function Input({ label, error, className, id, required, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1">
      <FieldLabel htmlFor={inputId} label={label} required={required} />
      <input
        id={inputId}
        className={cn('w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20', Boolean(error) && 'border-danger', className)}
        {...props}
      />
      {typeof error === 'string' && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, id, required, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const selectId = id || props.name;
  return (
    <div className="space-y-1">
      <FieldLabel htmlFor={selectId} label={label} required={required} />
      <select id={selectId} className={cn('w-full rounded-lg border border-border bg-white px-3 py-2 text-sm', className)} {...props}>{children}</select>
      {typeof error === 'string' && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, id, required, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaId = id || props.name;
  return (
    <div className="space-y-1">
      <FieldLabel htmlFor={textareaId} label={label} required={required} />
      <textarea id={textareaId} className={cn('w-full rounded-lg border border-border px-3 py-2 text-sm', className)} rows={4} {...props} />
      {typeof error === 'string' && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
