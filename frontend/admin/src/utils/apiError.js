export class ApiError extends Error {
  constructor(message, { status, code, isNetworkError } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isNetworkError = Boolean(isNetworkError);
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error;
  const status = error.response?.status;
  if (!error.response) {
    return new ApiError('Unable to connect to the server. Please try again in a few moments.', {
      isNetworkError: true,
      code: error.code,
    });
  }
  if (status >= 500) return new ApiError('Our servers are temporarily unavailable.', { status });
  if (status === 401) return new ApiError('Your session has expired. Please sign in again.', { status });
  if (status === 403) return new ApiError('You do not have permission to perform this action.', { status });
  return new ApiError(error.response.data?.error || error.message || 'Something went wrong.', { status });
}

export function isServerUnavailable(error) {
  return error instanceof ApiError && (error.isNetworkError || error.status >= 500);
}
