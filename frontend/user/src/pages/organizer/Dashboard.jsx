import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Users, IndianRupee, FileText, Lock } from 'lucide-react';
import StatCard from '../../components/organizer/StatCard';
import { MonthlyBarChart, CategoryPieChart } from '../../components/organizer/DashboardCharts';
import Loader from '../../components/common/Loader';
import { getDashboard, getMonthlyReport, getCategoryReport } from '../../api/organizerApi';
import { formatCurrency } from '../../utils/constants';



function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}


export default function OrganizerDashboard() {
  const [range, setRange] = useState(defaultRange);
  const params = useMemo(() => ({
    start_date: new Date(range.start).toISOString(),
    end_date: new Date(`${range.end}T23:59:59`).toISOString(),
  }), [range]);
  
  const dashboard = useQuery({ queryKey: ['organizer-dashboard'], queryFn: getDashboard });
  const monthly = useQuery({ queryKey: ['organizer-monthly', params], queryFn: () => getMonthlyReport(params) });
  const category = useQuery({ queryKey: ['organizer-category', params], queryFn: () => getCategoryReport(params) });

  if (dashboard.isLoading) return <Loader message="Loading dashboard..." />;

  const d = dashboard.data;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-gray-900">Dashboard</h1>
        <p className="mt-1 text-muted">Overview of your events and performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Events" value={d?.total_events ?? 0} icon={CalendarDays} />
        <StatCard label="Active Events" value={d?.active_events ?? 0} icon={CalendarDays} />
        <StatCard label="Draft Events" value={d?.draft_events ?? 0} icon={FileText} />
        <StatCard label="Closed Events" value={d?.closed_events ?? 0} icon={Lock} />
        <StatCard label="Total Registrations" value={d?.total_registrations ?? 0} icon={Users} />
        <StatCard label="Total Revenue" value={formatCurrency(d?.total_revenue)} icon={IndianRupee} />
      </div>

      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="text-xs text-muted">From</label>
              <input type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="mt-1 block rounded-lg border border-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted">To</label>
              <input type="date" value={range.end} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="mt-1 block rounded-lg border border-border px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Monthly Report</h3>
            <MonthlyBarChart data={monthly.data} loading={monthly.isLoading} error={monthly.error?.message} />
          </div>
          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Events by Category</h3>
            <CategoryPieChart data={category.data} loading={category.isLoading} error={category.error?.message} />
          </div>
        </div>
      </div>

      {d?.upcoming_events?.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <ul className="mt-4 divide-y divide-border">
            {d.upcoming_events.map((e) => (
              <li key={e.event_id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium">{e.title}</span>
                <span className="text-muted">{e.city} · {new Date(e.start_datetime).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
