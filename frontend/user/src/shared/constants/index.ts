export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';


export const EVENT_TYPES = [
  { value: '', label: 'All types' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export const CATEGORIES = [
  'Conference',
  'Workshop',
  'Movie',
  'Concert',
  'Sports',
  'Other',
];

export const formatCurrency = (amount: string | number | null | undefined) => {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateStr: string | number | Date | null | undefined) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

export const formatDateShort = (dateStr: string | number | Date | null | undefined) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

export const formatTime = (dateStr: string | number | Date | null | undefined) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};
