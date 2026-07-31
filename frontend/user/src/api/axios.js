import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { toApiError } from '../utils/apiError';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

export default api;
