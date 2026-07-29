import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../../components/organizer/StatCard';
import { MonthlyBarChart, CategoryPieChart } from '../../components/organizer/DashboardCharts';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/organizer/StatusBadge';
import { getSalesSummary, getMonthlyReport, getCategoryReport, getPeriodReport } from '../../api/organizerApi';
import { formatCurrency, formatDate } from '../../utils/constants';
import { CalendarDays, IndianRupee, Users, Ticket } from 'lucide-react';

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export default function SalesReport() {
  const [range, setRange] = useState(defaultRange);
  const params = useMemo(() => ({
    start_date: new Date(range.start).toISOString(),
    end_date: new Date(`${range.end}T23:59:59`).toISOString(),
  }), [range]);

  const period = useQuery({ queryKey: ['organizer-period-report', params], queryFn: () => getPeriodReport(params) });
  const monthly = useQuery({ queryKey: ['organizer-sales-monthly', params], queryFn: () => getMonthlyReport(params) });
  const category = useQuery({ queryKey: ['organizer-sales-category', params], queryFn: () => getCategoryReport(params) });
  const summary = useQuery({ queryKey: ['organizer-sales-summary'], queryFn: getSalesSummary });

  if (summary.isLoading) return <Loader message="Loading sales report..." />;

  const s = summary.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-900">Custom Period Report</h1>
          <p className="mt-1 text-muted">Revenue and activity for the selected date range</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input type="date" value={range.end} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
      </div>

      {summary.isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{summary.error.message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Events" value={period.data?.total_events ?? 0} icon={CalendarDays} />
        <StatCard label="Revenue" value={formatCurrency(period.data?.total_revenue)} icon={IndianRupee} />
        <StatCard label="Registrations" value={period.data?.total_registrations ?? 0} icon={Users} />
        <StatCard label="Tickets Sold" value={s?.total_tickets_sold ?? 0} icon={Ticket} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Monthly Activity</h2>
          <MonthlyBarChart data={monthly.data} loading={monthly.isLoading} error={monthly.error?.message} />
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Events by Category</h2>
          <CategoryPieChart data={category.data} loading={category.isLoading} error={category.error?.message} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        {!s?.recent_transactions?.length ? (
          <p className="mt-4 text-sm text-muted">No transactions yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2">Event</th>
                  <th className="px-2 py-2">Buyer</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.recent_transactions.map((t) => (
                  <tr key={t.payment_id}>
                    <td className="px-2 py-3">{t.event_title}</td>
                    <td className="px-2 py-3">{t.buyer_name}</td>
                    <td className="px-2 py-3">{formatCurrency(t.amount)}</td>
                    <td className="px-2 py-3"><StatusBadge status={t.payment_status} /></td>
                    <td className="px-2 py-3">{formatDate(t.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
