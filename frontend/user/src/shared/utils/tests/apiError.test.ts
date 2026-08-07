// Jest replaces the real axios package with a fake version.

// Normally:

// import axios from 'axios';

// would load the actual Axios library.
// But during this test, Jest substitutes it with the object you provided.

jest.mock('axios', () => ({
  __esModule: true, // "Treat this mock as an ES module with a default export."
  default: {
    isAxiosError: (error: unknown) => typeof error === 'object' && error !== null && 'isAxiosError' in error,
  },
}));

import { ApiError, isServerUnavailable, toApiError } from '@shared/utils/apiError';

test('maps network failures to a friendly error', () => {
  const error = toApiError({ code: 'ERR_NETWORK', message: 'Network Error', isAxiosError: true });

  expect(error.isNetworkError).toBe(true);
  expect(error.message).toMatch(/Unable to connect to the server/);
});

test('maps authorization failures to a safe message', () => {
  const error = toApiError({ response: { status: 403, data: { error: 'raw detail' } }, isAxiosError: true });

  expect(error.message).toBe('You do not have permission to perform this action.');
});

test('detects server unavailable errors', () => {
  expect(isServerUnavailable(new ApiError('down', { status: 503 }))).toBe(true);
  expect(isServerUnavailable(new ApiError('offline', { isNetworkError: true }))).toBe(true);
});
