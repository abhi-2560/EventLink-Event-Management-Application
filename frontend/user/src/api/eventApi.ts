import api from './axios';
import type { Event } from '../types/api';

export const getEvents = () => api.get<Event[]>('/events').then((r) => r.data);

export const searchEvents = (params: Record<string, string | number | boolean | undefined>) =>
  api.get<Event[]>('/events/search', { params }).then((r) => r.data);

export const getEvent = (eventId: string) =>
  api.get<Event>(`/events/${eventId}`).then((r) => r.data);
