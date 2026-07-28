import { cn } from '../../utils/cn';

export default function StatCard({ label, value, icon: Icon, trend, className }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="mt-1 text-xs text-muted">{trend}</p>}
        </div>
        {Icon && (
          <div className="rounded-xl bg-brand-50 p-3 text-brand-600">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
