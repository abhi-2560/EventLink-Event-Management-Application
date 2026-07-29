import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#6366f1', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed'];

export function normalizePieData(data) {
  if (!data?.length) return [];

  const normalized = data
    .map((item) => ({
      category_name: item.category_name?.trim() || 'Uncategorized',
      event_count: Number(item.event_count) || 0,
    }))
    .filter((item) => item.event_count > 0);

  const total = normalized.reduce((sum, item) => sum + item.event_count, 0);
  if (!total) return [];

  return normalized.map((item) => ({
    ...item,
    percentage: Number(((item.event_count / total) * 100).toFixed(1)),
  }));
}

function pieTooltipFormatter(value, name, props) {
  const count = props?.payload?.event_count ?? value;
  const pct = props?.payload?.percentage ?? 0;
  return [`${count} (${pct}%)`, props?.payload?.category_name ?? name];
}

function pieLegendFormatter(value, entry) {
  const count = entry?.payload?.event_count ?? 0;
  const pct = entry?.payload?.percentage ?? 0;
  return `${value}`;
}

export function MonthlyBarChart({ data, loading, error }) {
  if (loading) return <Loader message="Loading chart..." />;
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data?.length) return <EmptyState icon={BarChart3} title="No data" description="No records for selected period." />;

  const chartData = data.map((d) => ({
    month: d.month,
    Events: Number(d.events),
    Registrations: Number(d.registrations),
    Revenue: Number(d.revenue),
    Organizers: Number(d.organizers),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Events" fill="#6366f1" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Registrations" fill="#059669" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Organizers" fill="#d97706" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data, loading, error }) {
  if (loading) return <Loader message="Loading chart..." />;
  if (error) return <p className="text-sm text-danger">{error}</p>;

  const chartData = normalizePieData(data);
  if (!chartData.length) return <EmptyState icon={BarChart3} title="No data" description="No events in selected period." />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="event_count"
          nameKey="category_name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ category_name, event_count, percentage }) => `${category_name}: ${event_count} (${percentage}%)`}
        >
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={pieTooltipFormatter} />
        <Legend formatter={pieLegendFormatter} />
      </PieChart>
    </ResponsiveContainer>
  );
}
