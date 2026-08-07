import axios from 'axios';
import { API_BASE_URL } from '@shared/constants';
import { toApiError } from '@shared/utils/apiError';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

export default api;
