import type { ComponentType, ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-white px-6 py-14 text-center">
      {Icon && <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500"><Icon className="h-7 w-7" /></div>}
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
