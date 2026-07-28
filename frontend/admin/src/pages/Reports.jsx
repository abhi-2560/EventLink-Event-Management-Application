import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MonthlyBarChart, CategoryPieChart } from '../components/charts/ReportCharts';
import { getMonthlyReport, getCategoryReport } from '../api/adminApi';
import { defaultDateRange } from '../utils/helpers';

export default function Reports() {
  const [range, setRange] = useState(defaultDateRange);
  const params = useMemo(() => ({
    start_date: new Date(range.start).toISOString(),
    end_date: new Date(`${range.end}T23:59:59`).toISOString(),
  }), [range]);

  const monthly = useQuery({ queryKey: ['admin-reports-monthly', params], queryFn: () => getMonthlyReport(params) });
  const category = useQuery({ queryKey: ['admin-reports-category', params], queryFn: () => getCategoryReport(params) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted">Platform analytics for the selected period</p>
        </div>
        <div className="flex gap-2">
          <input type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input type="date" value={range.end} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Monthly Report</h2>
          <MonthlyBarChart data={monthly.data} loading={monthly.isLoading} error={monthly.error?.message} />
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Events by Category</h2>
          <CategoryPieChart data={category.data} loading={category.isLoading} error={category.error?.message} />
        </div>
      </div>
    </div>
  );
}
