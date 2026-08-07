import api from '@registrant/api/axios';
import type { Event } from '@shared/types/api';

// // <Event[]> is a TypeScript generic that tells Axios:
// "I expect the response body to be an array of Event objects."
export const getEvents = () => api.get<Event[]>('/events').then((r) => r.data);

export const searchEvents = (params: Record<string, string | number | boolean | undefined>) =>
  api.get<Event[]>('/events/search', { params }).then((r) => r.data);

export const getEvent = (eventId: string) =>
  api.get<Event>(`/events/${eventId}`).then((r) => r.data);
