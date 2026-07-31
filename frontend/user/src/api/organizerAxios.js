import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { toApiError } from '../utils/apiError';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('organizer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('organizer_token');
      if (window.location.pathname.startsWith('/organizer')
        && !window.location.pathname.includes('/login')
        && !window.location.pathname.includes('/signup')) {
        window.location.href = '/organizer/login';
      }
    }
    return Promise.reject(toApiError(error));
  },
);

export default api;
