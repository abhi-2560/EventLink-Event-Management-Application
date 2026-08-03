import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from '../api/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('organizer_token'));

  useEffect(() => subscribeToAccessToken(setToken), []);

  const login = useCallback((accessToken) => {
    setAccessToken(accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
