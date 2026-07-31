import { toApiError } from './apiError';

test('maps network failures to a friendly error', () => {
  const error = toApiError({ code: 'ERR_NETWORK', message: 'Network Error' });

  expect(error.isNetworkError).toBe(true);
  expect(error.message).toMatch(/Unable to connect to the server/);
});

test('maps authorization failures to a safe message', () => {
  const error = toApiError({ response: { status: 403, data: { error: 'raw detail' } } });

  expect(error.message).toBe('You do not have permission to perform this action.');
});
