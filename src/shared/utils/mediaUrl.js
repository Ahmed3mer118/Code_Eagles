/**
 * Resolve upload/media URLs so images load from the API host in dev and production.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  if (trimmed.startsWith('/')) {
    return apiBase ? `${apiBase}${trimmed}` : trimmed;
  }

  if (trimmed.startsWith('uploads/')) {
    return apiBase ? `${apiBase}/${trimmed}` : `/${trimmed}`;
  }

  return trimmed;
}

export default resolveMediaUrl;
