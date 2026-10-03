const PRODUCTION_API = 'http://localhost:3000';

const API_PREFIX = 'api';
const API_VERSION = 'v1';

/**
 * API origin (بدون prefix).
 * في dev → '' (relative) عشان يعدي على proxy بتاع Vite ونتفادى CORS.
 */
export function getApiBase() {
  if (import.meta.env.DEV) return '';

  const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'www.code-eagles.com' || host === 'code-eagles.com') {
      return PRODUCTION_API;
    }
  }

  return PRODUCTION_API;
}

/** Base URL كامل مع الـ version prefix — للـ axios */
export function getApiUrl() {
  return `${getApiBase()}/${API_PREFIX}/${API_VERSION}`;
}

export { API_PREFIX, API_VERSION };
export default getApiBase;