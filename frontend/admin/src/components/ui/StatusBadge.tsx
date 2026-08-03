import { cn } from '../../utils/helpers';

const map = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  INACTIVE: 'bg-slate-100 text-slate-600',
  DRAFT: 'bg-slate-100 text-slate-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-amber-100 text-amber-800',
  OPEN: 'bg-indigo-100 text-indigo-800',
  CLOSED: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  if (!status) return null;
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', map[status as keyof typeof map] || 'bg-slate-100 text-slate-600', className)}>
      {status}
    </span>
  );
}
