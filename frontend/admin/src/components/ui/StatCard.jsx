export default function StatCard({ label, value, icon: Icon, sub }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
        </div>
        {Icon && <div className="rounded-lg bg-indigo-50 p-2.5 text-accent"><Icon className="h-5 w-5" /></div>}
      </div>
    </div>
  );
}
