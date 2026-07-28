export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const DEFAULT_CATEGORIES = [
  'Conference', 'Workshop', 'Movie', 'Concert', 'Sports', 'Other',
];

export const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v ?? 0));

export const formatDate = (d) =>
  d ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d)) : '—';

export const formatDateShort = (d) =>
  d ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(d)) : '—';

export function cn(...c) { return c.filter(Boolean).join(' '); }

export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, totalPages, total: items.length };
}

export function defaultDateRange(months = 6) {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}
