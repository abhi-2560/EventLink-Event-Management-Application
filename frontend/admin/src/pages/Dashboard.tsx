import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, CalendarDays, Ticket, IndianRupee, Activity, Tags, BarChart3 } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { MonthlyBarChart, CategoryPieChart } from '../components/charts/ReportCharts';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { getDashboard, getMonthlyReport, getCategoryReport } from '../api/adminApi';
import { formatCurrency, defaultDateRange } from '../utils/helpers';
import { useDateRangeParams } from '../hooks/useListSearchParams';

export default function Dashboard() {
  const { range, setRange } = useDateRangeParams(defaultDateRange());
  const params = useMemo(() => ({
    start_date: new Date(range.start).toISOString(),
    end_date: new Date(`${range.end}T23:59:59`).toISOString(),
  }), [range]);

  const dash = useQuery({ queryKey: ['admin-dashboard'], queryFn: getDashboard });
  const monthly = useQuery({ queryKey: ['admin-monthly', params], queryFn: () => getMonthlyReport(params) });
  const category = useQuery({ queryKey: ['admin-category', params], queryFn: () => getCategoryReport(params) });

  if (dash.isLoading) return <Loader message="Loading dashboard..." />;

  const d = dash.data;

  // return (
  //   <div className="space-y-8">
  //     <div>
  //       <h1 className="text-2xl font-bold">Dashboard</h1>
  //       <p className="text-sm text-muted">Platform overview</p>
  //     </div>

  //     {dash.isError && <p className="text-sm text-danger">{dash.error.message}</p>}

  //     <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
  //       <StatCard label="Total Organizers" value={d?.total_organizers ?? 0} icon={Users} />
  //       <StatCard label="Total Events" value={d?.total_events ?? 0} icon={CalendarDays} />
  //       <StatCard label="Active Events" value={d?.active_events ?? 0} icon={Activity} />
  //       <StatCard label="Total Registrations" value={d?.total_registrations ?? 0} icon={Users} />
  //       <StatCard label="Tickets Sold" value={d?.total_tickets_sold ?? 0} icon={Ticket} />
  //       <StatCard label="Total Revenue" value={formatCurrency(d?.total_revenue)} icon={IndianRupee} />
  //     </div>

  //     <div className="flex flex-wrap gap-3">
  //       <Link to="/categories"><Button variant="secondary"><Tags className="h-4 w-4" />Manage Categories</Button></Link>
  //       <Link to="/reports"><Button variant="secondary"><BarChart3 className="h-4 w-4" />Reports</Button></Link>
  //     </div>

  //     <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
  //       <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
  //         <h2 className="font-semibold">Reports Preview</h2>
  //         <div className="flex gap-2">
  //           <input type="date" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="rounded-lg border border-border px-2 py-1.5 text-sm" />
  //           <input type="date" value={range.end} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="rounded-lg border border-border px-2 py-1.5 text-sm" />
  //         </div>
  //       </div>
  //       <div className="grid gap-6 lg:grid-cols-2">
  //         <div><h3 className="mb-3 text-sm font-medium text-muted">Monthly</h3><MonthlyBarChart data={monthly.data} loading={monthly.isLoading} error={monthly.error?.message} /></div>
  //         <div><h3 className="mb-3 text-sm font-medium text-muted">By Category</h3><CategoryPieChart data={category.data} loading={category.isLoading} error={category.error?.message} /></div>
  //       </div>
  //     </div>
  //   </div>
  // );

  if (dash.isError) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-danger">
          {dash.error?.message || "Something went wrong, server issue."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted">Platform overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Organizers" value={d?.total_organizers ?? 0} icon={Users} />
        <StatCard label="Total Events" value={d?.total_events ?? 0} icon={CalendarDays} />
        <StatCard label="Active Events" value={d?.active_events ?? 0} icon={Activity} />
        <StatCard label="Total Registrations" value={d?.total_registrations ?? 0} icon={Users} />
        <StatCard label="Tickets Sold" value={d?.total_tickets_sold ?? 0} icon={Ticket} />
        <StatCard label="Total Revenue" value={formatCurrency(d?.total_revenue)} icon={IndianRupee} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/categories">
          <Button variant="secondary_admin" className="transition-all duration-100 shadow-md active:translate-y-1 active:shadow-sm active:scale-[0.98]">
            <Tags className="h-4 w-4" />
            Manage Categories
          </Button>
        </Link>

        <Link to="/reports">
          <Button variant="secondary_admin"   className="transition-all duration-100 shadow-md active:translate-y-1 active:shadow-sm active:scale-[0.98]">
            <BarChart3 className="h-4 w-4" />
            Reports
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-semibold">Reports Preview</h2>

          <div className="flex gap-2">
            <input
              type="date"
              value={range.start}
              onChange={(e) =>
                setRange((r) => ({ ...r, start: e.target.value }))
              }
              className="rounded-lg border border-border px-2 py-1.5 text-sm"
            />

            <input
              type="date"
              value={range.end}
              onChange={(e) =>
                setRange((r) => ({ ...r, end: e.target.value }))
              }
              className="rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted">Monthly</h3>
            <MonthlyBarChart
              data={monthly.data}
              loading={monthly.isLoading}
              error={monthly.error?.message}
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted">By Category</h3>
            <CategoryPieChart
              data={category.data}
              loading={category.isLoading}
              error={category.error?.message}
            />
          </div>
        </div>
      </div>
    </div>
  );


}
