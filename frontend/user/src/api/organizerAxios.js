import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { toApiError } from '../utils/apiError';
import { clearAccessToken, getAccessToken, setAccessToken } from './authSession';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios.post(
      `${API_BASE_URL}/auth/refresh`,
      null,
      {
        withCredentials: true,
        headers: { 'X-Refresh-Request': '1', 'X-Actor-Type': 'organizer' },
      },
    ).then((response) => {
      setAccessToken(response.data.access_token);
      return response.data.access_token;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        clearAccessToken();
        if (window.location.pathname.startsWith('/organizer')) window.location.href = '/organizer/login';
        return Promise.reject(toApiError(error));
      }
    }
    if (error.response?.status === 401) {
      clearAccessToken();
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
