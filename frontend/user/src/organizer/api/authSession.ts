let accessToken = localStorage.getItem('organizer_token');
const listeners = new Set<(_token: string | null) => void>();

export const getAccessToken = () => accessToken;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem('organizer_token', token);
  else localStorage.removeItem('organizer_token');
  listeners.forEach((listener) => listener(accessToken));
}

export const clearAccessToken = () => setAccessToken(null);

export function subscribeToAccessToken(listener: (_token: string | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
