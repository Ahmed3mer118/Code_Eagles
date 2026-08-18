/**
 * Resolve upload/media URLs so images load from the API host in dev and production.
 */
import { getApiBase } from '../config/apiBase';

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const apiBase = getApiBase();

  if (trimmed.startsWith('/')) {
    return `${apiBase}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `${apiBase}/${trimmed}`;
  }

  return trimmed;
}

export default resolveMediaUrl;
