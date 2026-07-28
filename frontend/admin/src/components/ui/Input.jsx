import { cn } from '../../utils/helpers';

export default function Input({ label, error, className, id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        id={inputId}
        className={cn('w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20', error && 'border-danger', className)}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select className={cn('w-full rounded-lg border border-border bg-white px-3 py-2 text-sm', className)} {...props}>{children}</select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <textarea className={cn('w-full rounded-lg border border-border px-3 py-2 text-sm', className)} rows={4} {...props} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
