import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#0c87eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d'];

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
  return `${value}: ${count} (${pct}%)`;
}

export function MonthlyBarChart({ data, loading, error }) {
  if (loading) return <Loader message="Loading chart..." />;
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!data?.length) {
    return <EmptyState icon={BarChart3} title="No data" description="No report data for the selected period." />;
  }

  const chartData = data.map((d) => ({
    month: d.month,
    Registrations: Number(d.registrations),
    Revenue: Number(d.revenue),
    Events: Number(d.events),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Registrations" fill="#0c87eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Revenue" fill="#059669" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Events" fill="#d97706" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data, loading, error }) {
  if (loading) return <Loader message="Loading chart..." />;
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;

  const chartData = normalizePieData(data);
  if (!chartData.length) {
    return <EmptyState icon={BarChart3} title="No data" description="No events in the selected period." />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="event_count"
          nameKey="category_name"
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={({ category_name, event_count, percentage }) => `${category_name}: ${event_count} (${percentage}%)`}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={pieTooltipFormatter} />
        <Legend formatter={pieLegendFormatter} />
      </PieChart>
    </ResponsiveContainer>
  );
}
