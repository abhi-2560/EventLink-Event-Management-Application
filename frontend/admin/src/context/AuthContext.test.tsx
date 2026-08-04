import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

beforeEach(() => {
  localStorage.clear();
});

test('restores admin token from localStorage on mount', () => {
  localStorage.setItem('admin_token', 'stored-token');

  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });

  expect(result.current.isAuthenticated).toBe(true);
});

test('login persists token and logout clears session', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });

  act(() => result.current.login('fresh-token'));
  expect(localStorage.getItem('admin_token')).toBe('fresh-token');

  act(() => result.current.logout());
  expect(localStorage.getItem('admin_token')).toBeNull();
});
