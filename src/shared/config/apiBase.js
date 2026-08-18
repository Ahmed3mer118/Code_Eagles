const PRODUCTION_API = 'https://api-codeeagles-cpq8.vercel.app';

/** API origin used for uploads and authenticated requests. */
export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'www.code-eagles.com' || host === 'code-eagles.com') {
      return PRODUCTION_API;
    }
  }

  return 'http://localhost:8000';
}

export default getApiBase;
