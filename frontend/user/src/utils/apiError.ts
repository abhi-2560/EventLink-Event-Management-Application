import axios from 'axios';

interface ApiErrorOptions {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;

  constructor(message: string, { status, code, isNetworkError }: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isNetworkError = Boolean(isNetworkError);
  }
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) return error;

  const axiosError = axios.isAxiosError(error) ? error : undefined;
  const status = axiosError?.response?.status;
  const responseData = axiosError?.response?.data;
  const message = typeof responseData === 'object' && responseData !== null && 'error' in responseData
    ? responseData.error
    : undefined;
  const isNetworkError = !axiosError?.response;

  if (isNetworkError) {
    return new ApiError('Unable to connect to the server. Please try again in a few moments.', {
      isNetworkError: true,
      code: axiosError?.code,
    });
  }
  if ((status ?? 0) >= 500) {
    return new ApiError('Our servers are temporarily unavailable.', { status });
  }
  if (status === 401) return new ApiError('Your session has expired. Please sign in again.', { status });
  if (status === 403) return new ApiError('You do not have permission to perform this action.', { status });
  return new ApiError(
    typeof message === 'string' ? message : error instanceof Error ? error.message : 'Something went wrong.',
    { status },
  );
}

export function isServerUnavailable(error: unknown) {
  return error instanceof ApiError && (error.isNetworkError || (error.status ?? 0) >= 500);
}
