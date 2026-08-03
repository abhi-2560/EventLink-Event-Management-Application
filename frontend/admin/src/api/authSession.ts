let accessToken: string | null = localStorage.getItem('admin_token');
const listeners = new Set<(token: string | null) => void>();

export const getAccessToken = () => accessToken;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
  listeners.forEach((listener) => listener(accessToken));
}

export const clearAccessToken = () => setAccessToken(null);

export function subscribeToAccessToken(listener: (token: string | null) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
