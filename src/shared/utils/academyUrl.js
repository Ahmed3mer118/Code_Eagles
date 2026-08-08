export function getAcademyPublicUrl(slug) {
  if (!slug) return '';
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/academy/${slug}`;
  }
  return `/academy/${slug}`;
}
