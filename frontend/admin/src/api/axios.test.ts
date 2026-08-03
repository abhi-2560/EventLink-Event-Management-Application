jest.mock('axios', () => {
  const mockApiInstance = Object.assign(jest.fn(), {
    interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
    },
  });
  const mockedAxios = Object.assign(jest.fn(), {
    create: jest.fn(() => mockApiInstance),
    post: jest.fn(),
  });
  return { __esModule: true, default: mockedAxios };
});

jest.mock('../utils/helpers', () => ({ API_BASE_URL: '/api' }));

import axios from 'axios';
import './axios';

type MockApi = jest.Mock & {
  interceptors: { request: { use: jest.Mock }; response: { use: jest.Mock } };
};
type MockAxios = { create: jest.Mock; post: jest.Mock };
const mockedAxios = axios as unknown as MockAxios;
const mockApi = mockedAxios.create.mock.results[0].value as MockApi;
const responseErrorHandler = () => mockApi.interceptors.response.use.mock.calls[0][1];

beforeEach(() => {
  localStorage.clear();
  mockedAxios.post.mockClear();
  mockApi.mockClear();
});

test('retries concurrent 401 responses with one refresh request', async () => {
  mockedAxios.post.mockResolvedValue({ data: { access_token: 'refreshed-token' } });
  mockApi.mockResolvedValue({ data: { ok: true } });
  const retry = responseErrorHandler();

  await Promise.all([
    retry({ config: { headers: {} }, response: { status: 401 } }),
    retry({ config: { headers: {} }, response: { status: 401 } }),
  ]);

  expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  expect(mockApi).toHaveBeenCalledTimes(2);
  expect(localStorage.getItem('admin_token')).toBe('refreshed-token');
});

test('clears the session when refresh fails', async () => {
  localStorage.setItem('admin_token', 'expired-token');
  window.history.replaceState({}, '', '/login');
  mockedAxios.post.mockRejectedValue(new Error('refresh rejected'));
  const retry = responseErrorHandler();

  await expect(
    retry({ config: { headers: {} }, response: { status: 401 } }),
  ).rejects.toMatchObject({ message: expect.any(String) });

  expect(localStorage.getItem('admin_token')).toBeNull();
});

test('keeps the session on an authorization-only 403 response', async () => {
  localStorage.setItem('admin_token', 'valid-token');
  const reject = responseErrorHandler();

  await expect(
    reject({ config: { headers: {} }, response: { status: 403 } }),
  ).rejects.toMatchObject({ message: expect.any(String) });

  expect(localStorage.getItem('admin_token')).toBe('valid-token');
});
