let accessToken = localStorage.getItem('admin_token');
const listeners = new Set();

export const getAccessToken = () => accessToken;

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
  listeners.forEach((listener) => listener(accessToken));
}

export const clearAccessToken = () => setAccessToken(null);

export function subscribeToAccessToken(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
