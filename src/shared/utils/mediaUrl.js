/**
 * Resolve upload/media URLs so images load from the API host in dev and production.
 */
import { getApiBase } from '../config/apiBase';

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Vite public folder assets — must not be prefixed with API base
  if (trimmed.startsWith('/images/') || trimmed.startsWith('/vite')) {
    return trimmed;
  }

  const apiBase = getApiBase();

  if (trimmed.startsWith('/')) {
    return `${apiBase}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `${apiBase}/${trimmed}`;
  }

  return trimmed;
}

/** Logo / brand image: static public path or uploaded media */
export function resolveBrandLogo(url, fallback = '/images/LOGO.png') {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  return resolveMediaUrl(url.trim()) || fallback;
}

export default resolveMediaUrl;
