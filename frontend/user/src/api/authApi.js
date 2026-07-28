import api from './organizerAxios';

export const loginOrganizer = (email, password) =>
  api.post('/auth/organizer/login', { email, password }).then((r) => r.data);

export const logoutOrganizer = () =>
  api.post('/auth/organizer/logout').then((r) => r.data);

export const requestPasswordReset = (email) =>
  api.post('/auth/organizer/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, newPassword) =>
  api.post('/auth/organizer/reset-password', { token, new_password: newPassword }).then((r) => r.data);
