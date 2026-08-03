import api from './axios';
import type { AuditLog, Category, CategoryPayload, Coupon, CouponPayload, DateParams, Event, EventPayload, Id, LoginPayload, LoginResponse, Organizer, OrganizerPayload, PaginatedAuditLogs, PasswordPayload, ProfilePayload } from '../types/admin';

export const loginAdmin = (email: LoginPayload['email'], password: LoginPayload['password']): Promise<LoginResponse> =>
  api.post<LoginResponse>('/auth/admin/login', { email, password }).then((r) => r.data);

export const logoutAdmin = () => api.post('/auth/admin/logout').then((r) => r.data);

export const getDashboard = () => api.get('/admin/reports/dashboard').then((r) => r.data);

export const getMonthlyReport = (params: DateParams) =>
  api.get('/admin/reports/monthly', { params }).then((r) => r.data);

export const getCategoryReport = (params: DateParams) =>
  api.get('/admin/reports/category', { params }).then((r) => r.data);

export const getPeriodReport = (params: DateParams) =>
  api.get('/admin/reports/period', { params }).then((r) => r.data);

export const getPlatformFees = () =>
  api.get('/admin/settings/platform-fees').then((r) => r.data);

export const updatePlatformFees = (payload: Record<string, number>) =>
  api.put('/admin/settings/platform-fees', payload).then((r) => r.data);

export const getOrganizers = (): Promise<Organizer[]> => api.get<Organizer[]>('/admin/organizers').then((r) => r.data);

export const getOrganizer = (id: Id): Promise<Organizer> => api.get<Organizer>(`/admin/organizers/${id}`).then((r) => r.data);

export const updateOrganizer = (id: Id, payload: OrganizerPayload) =>
  api.put(`/admin/organizers/${id}`, payload).then((r) => r.data);

export const archiveOrganizer = (id: Id) =>
  api.patch(`/admin/organizers/${id}/archive`).then((r) => r.data);

export const deleteOrganizer = (id: Id) =>
  api.delete(`/admin/organizers/${id}`).then((r) => r.data);

export const getEvents = (): Promise<Event[]> => api.get<Event[]>('/admin/events').then((r) => r.data);

export const getEvent = (id: Id): Promise<Event> => api.get<Event>(`/admin/events/${id}`).then((r) => r.data);

export const updateEvent = (id: Id, payload: Partial<EventPayload>) =>
  api.put(`/admin/events/${id}`, payload).then((r) => r.data);

export const archiveEvent = (id: Id) =>
  api.patch(`/admin/events/${id}/archive`).then((r) => r.data);

export const deleteEvent = (id: Id) =>
  api.delete(`/admin/events/${id}`).then((r) => r.data);

export const getCategories = (): Promise<Category[]> => api.get<Category[]>('/admin/categories').then((r) => r.data);

export const createCategory = (payload: CategoryPayload) =>
  api.post('/admin/categories', payload).then((r) => r.data);

export const updateCategory = (id: Id, payload: CategoryPayload) =>
  api.put(`/admin/categories/${id}`, payload).then((r) => r.data);

export const deleteCategory = (id: Id) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data);

export const archiveCategory = (id: Id) =>
  api.patch(`/admin/categories/${id}/archive`).then((r) => r.data);

export const getAuditLogs = (params: Record<string, string | number | undefined>): Promise<PaginatedAuditLogs> =>
  api.get<PaginatedAuditLogs>('/admin/audit-logs', { params }).then((r) => r.data);

export const getAuditLog = (id: Id): Promise<AuditLog> =>
  api.get<AuditLog>(`/admin/audit-logs/${id}`).then((r) => r.data);

export const getProfile = () => api.get('/admin/profile').then((r) => r.data);

export const updateProfile = (payload: ProfilePayload) =>
  api.put('/admin/profile', payload).then((r) => r.data);

export const changePassword = (current_password: PasswordPayload['current_password'], new_password: PasswordPayload['new_password']) =>
  api.post('/admin/profile/change-password', { current_password, new_password }).then((r) => r.data);

export const getCoupons = (): Promise<Coupon[]> => api.get<Coupon[]>('/admin/coupons').then((r) => r.data);

export const getCoupon = (id: Id) => api.get(`/admin/coupons/${id}`).then((r) => r.data);

export const createCoupon = (payload: CouponPayload) => api.post('/admin/coupons', payload).then((r) => r.data);

export const updateCoupon = (id: Id, payload: CouponPayload) => api.put(`/admin/coupons/${id}`, payload).then((r) => r.data);

export const deleteCoupon = (id: Id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data);
