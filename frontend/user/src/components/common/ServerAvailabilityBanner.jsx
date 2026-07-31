import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';
import ServerUnavailable from './ServerUnavailable';

export default function ServerAvailabilityBanner() {
  const [unavailable, setUnavailable] = useState(false);

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      setUnavailable(!response.ok);
    } catch {
      setUnavailable(true);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = window.setInterval(checkHealth, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return unavailable ? <ServerUnavailable onRetry={checkHealth} /> : null;
}
