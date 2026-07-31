let accessToken = localStorage.getItem('organizer_token');

export const getAccessToken = () => accessToken;

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('organizer_token', token);
  else localStorage.removeItem('organizer_token');
}

export const clearAccessToken = () => setAccessToken(null);
