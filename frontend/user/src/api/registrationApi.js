import api from './axios';

export const createRegistration = (payload) =>
  api.post('/registrations', payload).then((r) => r.data);

export const getRegistration = (registrationId) =>
  api.get(`/registrations/${registrationId}`).then((r) => r.data);
