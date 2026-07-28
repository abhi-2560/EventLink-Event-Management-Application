import api from './axios';

export const loginAdmin = (email, password) =>
  api.post('/auth/admin/login', { email, password }).then((r) => r.data);

export const logoutAdmin = () => api.post('/auth/admin/logout').then((r) => r.data);

export const getDashboard = () => api.get('/admin/reports/dashboard').then((r) => r.data);

export const getMonthlyReport = (params) =>
  api.get('/admin/reports/monthly', { params }).then((r) => r.data);

export const getCategoryReport = (params) =>
  api.get('/admin/reports/category', { params }).then((r) => r.data);

export const getOrganizers = () => api.get('/admin/organizers').then((r) => r.data);

export const getOrganizer = (id) => api.get(`/admin/organizers/${id}`).then((r) => r.data);

export const updateOrganizer = (id, payload) =>
  api.put(`/admin/organizers/${id}`, payload).then((r) => r.data);

export const archiveOrganizer = (id) =>
  api.patch(`/admin/organizers/${id}/archive`).then((r) => r.data);

export const deleteOrganizer = (id) =>
  api.delete(`/admin/organizers/${id}`).then((r) => r.data);

export const getEvents = () => api.get('/admin/events').then((r) => r.data);

export const getEvent = (id) => api.get(`/admin/events/${id}`).then((r) => r.data);

export const updateEvent = (id, payload) =>
  api.put(`/admin/events/${id}`, payload).then((r) => r.data);

export const archiveEvent = (id) =>
  api.patch(`/admin/events/${id}/archive`).then((r) => r.data);

export const deleteEvent = (id) =>
  api.delete(`/admin/events/${id}`).then((r) => r.data);

export const getCategories = () => api.get('/admin/categories').then((r) => r.data);

export const createCategory = (payload) =>
  api.post('/admin/categories', payload).then((r) => r.data);

export const updateCategory = (id, payload) =>
  api.put(`/admin/categories/${id}`, payload).then((r) => r.data);

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data);

export const archiveCategory = (id) =>
  api.patch(`/admin/categories/${id}/archive`).then((r) => r.data);

export const getAuditLogs = (params) =>
  api.get('/admin/audit-logs', { params }).then((r) => r.data);

export const getAuditLog = (id) =>
  api.get(`/admin/audit-logs/${id}`).then((r) => r.data);

export const getProfile = () => api.get('/admin/profile').then((r) => r.data);

export const updateProfile = (payload) =>
  api.put('/admin/profile', payload).then((r) => r.data);

export const changePassword = (current_password, new_password) =>
  api.post('/admin/profile/change-password', { current_password, new_password }).then((r) => r.data);
