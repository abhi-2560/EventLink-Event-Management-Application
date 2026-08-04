import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

beforeEach(() => {
  localStorage.clear();
});

test('restores organizer token from localStorage on mount', () => {
  localStorage.setItem('organizer_token', 'stored-token');

  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });

  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.token).toBe('stored-token');
});

test('login persists token and logout clears session', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });

  act(() => result.current.login('fresh-token'));
  expect(localStorage.getItem('organizer_token')).toBe('fresh-token');
  expect(result.current.isAuthenticated).toBe(true);

  act(() => result.current.logout());
  expect(localStorage.getItem('organizer_token')).toBeNull();
  expect(result.current.isAuthenticated).toBe(false);
});
