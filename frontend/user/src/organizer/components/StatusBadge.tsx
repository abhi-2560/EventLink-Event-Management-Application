import { cn } from '@shared/lib/cn';

const styles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-amber-100 text-amber-800',
  OPEN: 'bg-brand-100 text-brand-800',
  CLOSED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-700',
  SUCCESS: 'bg-emerald-100 text-emerald-800',
  INITIATED: 'bg-gray-100 text-gray-700',
};

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide', styles[status] || 'bg-gray-100 text-gray-700', className)}>
      {status.replace('_', ' ')}
    </span>
  );
}
