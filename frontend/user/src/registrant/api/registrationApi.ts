import api from '@registrant/api/axios';
import type { Registration } from '@shared/types/api';

export const createRegistration = (payload: Record<string, unknown>) =>
  api.post<Registration>('/registrations', payload).then((r) => r.data);

export const getRegistration = (registrationId: string) =>
  api.get<Registration>(`/registrations/${registrationId}`).then((r) => r.data);
