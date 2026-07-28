import api from './axios';

export const getEvents = () => api.get('/events').then((r) => r.data);

export const searchEvents = (params) =>
  api.get('/events/search', { params }).then((r) => r.data);

export const getEvent = (eventId) =>
  api.get(`/events/${eventId}`).then((r) => r.data);
