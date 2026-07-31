let accessToken = localStorage.getItem('admin_token');

export const getAccessToken = () => accessToken;

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
}

export const clearAccessToken = () => setAccessToken(null);
