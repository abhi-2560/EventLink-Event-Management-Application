import { cn } from '../../utils/cn';

export function FieldLabel({ htmlFor, label, required, className }) {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-gray-700', className)}>
      {label}
      {required && <span className="text-danger" aria-hidden="true"> *</span>}
    </label>
  );
}

export default function Input({ label, error, className, id, required, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={inputId} label={label} required={required} />
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className, id, required, children, ...props }) {
  const selectId = id || props.name;
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={selectId} label={label} required={required} />
      <select
        id={selectId}
        className={cn(
          'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, id, required, ...props }) {
  const textareaId = id || props.name;
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={textareaId} label={label} required={required} />
      <textarea
        id={textareaId}
        className={cn(
          'w-full rounded-lg border border-border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
