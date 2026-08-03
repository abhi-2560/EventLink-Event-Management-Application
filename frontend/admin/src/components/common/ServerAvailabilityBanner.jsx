import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/helpers';
import ServerUnavailable from './ServerUnavailable';

const DEFAULT_HEALTH_CHECK_INTERVAL_MS = 60_000;

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const HEALTH_CHECK_INTERVAL_MS = positiveInteger(
  import.meta.env.VITE_HEALTH_CHECK_INTERVAL_MS,
  DEFAULT_HEALTH_CHECK_INTERVAL_MS,
);

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
    const interval = window.setInterval(checkHealth, HEALTH_CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return unavailable ? <ServerUnavailable onRetry={checkHealth} /> : null;
}
