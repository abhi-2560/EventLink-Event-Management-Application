jest.mock('axios', () => {
  const mockApiInstance = jest.fn();
  mockApiInstance.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  const mockedAxios = jest.fn();
  mockedAxios.create = jest.fn(() => mockApiInstance);
  mockedAxios.post = jest.fn();
  return { __esModule: true, default: mockedAxios };
});

jest.mock('../utils/constants', () => ({ API_BASE_URL: '/api' }));

import axios from 'axios';
import './organizerAxios';

const mockApi = axios.create.mock.results[0].value;
const responseErrorHandler = () => mockApi.interceptors.response.use.mock.calls[0][1];

beforeEach(() => {
  localStorage.clear();
  axios.post.mockClear();
  mockApi.mockClear();
});

test('retries concurrent 401 responses with one refresh request', async () => {
  axios.post.mockResolvedValue({ data: { access_token: 'refreshed-token' } });
  mockApi.mockResolvedValue({ data: { ok: true } });
  const retry = responseErrorHandler();

  await Promise.all([
    retry({ config: { headers: {} }, response: { status: 401 } }),
    retry({ config: { headers: {} }, response: { status: 401 } }),
  ]);

  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(mockApi).toHaveBeenCalledTimes(2);
  expect(localStorage.getItem('organizer_token')).toBe('refreshed-token');
});

test('clears the session when refresh fails', async () => {
  localStorage.setItem('organizer_token', 'expired-token');
  axios.post.mockRejectedValue(new Error('refresh rejected'));
  const retry = responseErrorHandler();

  await expect(
    retry({ config: { headers: {} }, response: { status: 401 } }),
  ).rejects.toMatchObject({ message: expect.any(String) });

  expect(localStorage.getItem('organizer_token')).toBeNull();
});

test('keeps the session on an authorization-only 403 response', async () => {
  localStorage.setItem('organizer_token', 'valid-token');
  const reject = responseErrorHandler();

  await expect(
    reject({ config: { headers: {} }, response: { status: 403 } }),
  ).rejects.toMatchObject({ message: expect.any(String) });

  expect(localStorage.getItem('organizer_token')).toBe('valid-token');
});
