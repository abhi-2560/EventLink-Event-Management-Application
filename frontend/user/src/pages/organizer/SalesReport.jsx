import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/organizer/StatCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/organizer/StatusBadge';
import { getSalesSummary, getMonthlyReport } from '../../api/organizerApi';
import { formatCurrency, formatDate } from '../../utils/constants';
import { IndianRupee, Users, Ticket, TrendingUp } from 'lucide-react';

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

  const summary = useQuery({ queryKey: ['organizer-sales-summary'], queryFn: getSalesSummary });
  const monthly = useQuery({ queryKey: ['organizer-sales-monthly', params], queryFn: () => getMonthlyReport(params) });

  if (summary.isLoading) return <Loader message="Loading sales report..." />;

  const s = summary.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-gray-900">Sales Report</h1>
        <p className="mt-1 text-muted">Revenue and transaction overview</p>
      </div>

      {summary.isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{summary.error.message}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={formatCurrency(s?.total_sales)} icon={IndianRupee} />
        <StatCard label="Total Registrations" value={s?.total_registrations ?? 0} icon={Users} />
        <StatCard label="Tickets Sold" value={s?.total_tickets_sold ?? 0} icon={Ticket} />
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Chart</h2>
          <div className="flex gap-3">
            <input type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input type="date" value={range.end} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
        </div>
        {monthly.isLoading ? (
          <Loader message="Loading chart..." />
        ) : monthly.data?.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly.data.map((d) => ({ month: d.month, revenue: Number(d.revenue), registrations: d.registrations }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v, name) => [name === 'revenue' ? formatCurrency(v) : v, name]} />
              <Bar dataKey="revenue" fill="#0c87eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={TrendingUp} title="No revenue data" description="No transactions in the selected period." />
        )}
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
