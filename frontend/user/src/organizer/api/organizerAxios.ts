import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@shared/constants';
import { toApiError } from '@shared/utils/apiError';
import { clearAccessToken, getAccessToken, setAccessToken } from '@organizer/api/authSession';

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

let refreshPromise: Promise<string> | null = null;
// refreshPromise is a variable that stores an ongoing refresh request.
// null → no refresh is happening.
// Promise<string> → a refresh request is currently running and will eventually return a new access token (a string).


function refreshAccessToken(): Promise<string> {
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


/*
api.interceptors.response.use(
  successHandler,
  errorHandler
  
  successHandler: (response) => response,
  errorHandler: async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(toApiError(error));
);
*/
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(toApiError(error));

    // in case of 401 or something, it is stored as error.config
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    //     It means:
    // response status is 401
    // the original request exists
    // it has not already been retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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