import api from '@organizer/api/organizerAxios';
import type { Category, Event, Organizer, Registration } from '@shared/types/api';

type QueryParams = Record<string, string | number | boolean | undefined>;
type EventId = string;

export interface DashboardData {
  total_events: number;
  active_events: number;
  draft_events: number;
  closed_events: number;
  total_registrations: number;
  total_revenue: string | number;
  upcoming_events: Event[];
}
export interface MonthlyReportItem {
  month: string;
  registrations: string | number;
  revenue: string | number;
  events: string | number;
}
export interface CategoryReportItem {
  category_name?: string;
  event_count: string | number;
}
export interface PeriodReport {
  total_events: number;
  total_revenue: string | number;
  total_registrations: number;
}
export interface SalesSummary {
  total_tickets_sold?: number;
  recent_transactions?: Array<{
    payment_id: string;
    event_title: string;
    buyer_name: string;
    amount: string | number;
    payment_status: string;
    completed_at: string;
  }>;
}

export const getDashboard = () => api.get<DashboardData>('/organizer/dashboard').then((r) => r.data);

export const getPeriodReport = (params: QueryParams) =>
  api.get<PeriodReport>('/organizer/reports/period', { params }).then((r) => r.data);

export const getMonthlyReport = (params: QueryParams) =>
  api.get<MonthlyReportItem[]>('/organizer/reports/monthly', { params }).then((r) => r.data);

export const getCategoryReport = (params: QueryParams) =>
  api.get<CategoryReportItem[]>('/organizer/reports/category', { params }).then((r) => r.data);

export const getEvents = () => api.get<Event[]>('/organizer/events').then((r) => r.data);

export const getEvent = (eventId: EventId) =>
  api.get<Event>(`/organizer/events/${eventId}`).then((r) => r.data);

export const createEvent = (payload: Record<string, unknown>) =>
  api.post<Event>('/organizer/events', payload).then((r) => r.data);

export const updateEvent = (eventId: EventId, payload: Record<string, unknown>) =>
  api.put<Event>(`/organizer/events/${eventId}`, payload).then((r) => r.data);

export const updateCapacity = (eventId: EventId, capacity: number) =>
  api.put(`/organizer/events/${eventId}/capacity`, { capacity }).then((r) => r.data);

export const publishEvent = (eventId: EventId) =>
  api.post(`/organizer/events/${eventId}/publish`).then((r) => r.data);

export const closeRegistration = (eventId: EventId) =>
  api.post(`/organizer/events/${eventId}/close-registration`).then((r) => r.data);

export const archiveEvent = (eventId: EventId) =>
  api.post(`/organizer/events/${eventId}/archive`).then((r) => r.data);

export const uploadBanner = (eventId: EventId, file: File) => {
  const data = new FormData();
  data.append('file', file);
  return api.post(`/organizer/events/${eventId}/banner`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const deleteBanner = (eventId: EventId) =>
  api.delete(`/organizer/events/${eventId}/banner`).then((r) => r.data);

export const uploadEventMedia = (eventId: EventId, file: File, mediaType: string) => {
  const data = new FormData();
  data.append('file', file);
  data.append('media_type', mediaType);
  return api.post(`/organizer/events/${eventId}/media`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const deleteEventMedia = (eventId: EventId, mediaId: string) =>
  api.delete(`/organizer/events/${eventId}/media/${mediaId}`).then((r) => r.data);

export const getRegistrations = (eventId: EventId) =>
  api.get<Registration[]>(`/organizer/events/${eventId}/registrations`).then((r) => r.data);

export const getEventSales = (eventId: EventId) =>
  api.get(`/organizer/events/${eventId}/sales`).then((r) => r.data);

export const getSalesSummary = () =>
  api.get<SalesSummary>('/organizer/sales/summary').then((r) => r.data);

export const getCategories = () =>
  api.get<Category[]>('/organizer/categories').then((r) => r.data);

export const getProfile = () =>
  api.get<Organizer>('/organizer/profile').then((r) => r.data);

export const updateProfile = (payload: Record<string, unknown>) =>
  api.put('/organizer/profile', payload).then((r) => r.data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/organizer/profile/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  }).then((r) => r.data);
