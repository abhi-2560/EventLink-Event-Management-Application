import api from './organizerAxios';

export const getDashboard = () => api.get('/organizer/dashboard').then((r) => r.data);

export const getMonthlyReport = (params) =>
  api.get('/organizer/reports/monthly', { params }).then((r) => r.data);

export const getCategoryReport = (params) =>
  api.get('/organizer/reports/category', { params }).then((r) => r.data);

export const getEvents = () => api.get('/organizer/events').then((r) => r.data);

export const getEvent = (eventId) =>
  api.get(`/organizer/events/${eventId}`).then((r) => r.data);

export const createEvent = (payload) =>
  api.post('/organizer/events', payload).then((r) => r.data);

export const updateEvent = (eventId, payload) =>
  api.put(`/organizer/events/${eventId}`, payload).then((r) => r.data);

export const updateCapacity = (eventId, capacity) =>
  api.put(`/organizer/events/${eventId}/capacity`, { capacity }).then((r) => r.data);

export const publishEvent = (eventId) =>
  api.post(`/organizer/events/${eventId}/publish`).then((r) => r.data);

export const closeRegistration = (eventId) =>
  api.post(`/organizer/events/${eventId}/close-registration`).then((r) => r.data);

export const archiveEvent = (eventId) =>
  api.post(`/organizer/events/${eventId}/archive`).then((r) => r.data);

export const getRegistrations = (eventId) =>
  api.get(`/organizer/events/${eventId}/registrations`).then((r) => r.data);

export const getEventSales = (eventId) =>
  api.get(`/organizer/events/${eventId}/sales`).then((r) => r.data);

export const getSalesSummary = () =>
  api.get('/organizer/sales/summary').then((r) => r.data);

export const getCategories = () =>
  api.get('/organizer/categories').then((r) => r.data);

export const getProfile = () =>
  api.get('/organizer/profile').then((r) => r.data);

export const updateProfile = (payload) =>
  api.put('/organizer/profile', payload).then((r) => r.data);

export const changePassword = (currentPassword, newPassword) =>
  api.post('/organizer/profile/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  }).then((r) => r.data);
