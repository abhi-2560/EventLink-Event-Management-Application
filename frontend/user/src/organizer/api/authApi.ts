import api from '@organizer/api/organizerAxios';

export const loginOrganizer = (email: string, password: string) =>
  api.post('/auth/organizer/login', { email, password }).then((r) => r.data);

export const logoutOrganizer = () =>
  api.post('/auth/organizer/logout').then((r) => r.data);

export const requestPasswordReset = (email: string) =>
  api.post('/auth/organizer/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/auth/organizer/reset-password', { token, new_password: newPassword }).then((r) => r.data);

export const registerOrganizer = (payload: Record<string, unknown>) =>
  api.post('/organizers/register', payload).then((r) => r.data);
