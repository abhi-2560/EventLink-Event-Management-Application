import axios from 'axios';
import { API_BASE_URL } from '../utils/helpers';
import { toApiError } from '../utils/apiError';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if ([401, 403].includes(err.response?.status)) {
      localStorage.removeItem('admin_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(toApiError(err));
  },
);

export default api;
