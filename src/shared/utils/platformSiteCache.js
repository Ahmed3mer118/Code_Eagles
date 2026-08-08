const CACHE_KEY = 'ce_platform_site_cache';

/** Static fallback when API and cache both fail */
export const DEFAULT_PLATFORM_SITE = {
  site: {
    sections: [
      { key: 'hero', enabled: true, published: true, order: 0, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } },
      { key: 'features', enabled: true, published: true, order: 1, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } },
      { key: 'statistics', enabled: true, published: true, order: 2, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } },
      { key: 'featured', enabled: true, published: true, order: 3, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, content: { mode: 'programming_tracks' } },
      { key: 'testimonials', enabled: true, published: true, order: 4, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } },
      { key: 'faq', enabled: true, published: true, order: 5, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } },
      { key: 'cta', enabled: true, published: true, order: 6, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } },
    ],
    footer: {
      text: { ar: '', en: '' },
      contactEmail: '',
      contactPhone: '',
      socialLinks: [],
      usefulLinks: [],
      legalLinks: [],
    },
  },
  testimonials: [],
  faq: [],
};

export function readPlatformSiteCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writePlatformSiteCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, cachedAt: new Date().toISOString() }));
  } catch {
    /* ignore quota errors */
  }
}

export async function loadPlatformSite(fetcher) {
  try {
    const fresh = await fetcher();
    writePlatformSiteCache(fresh);
    return fresh;
  } catch {
    return readPlatformSiteCache() || DEFAULT_PLATFORM_SITE;
  }
}

export function isSectionVisible(sections, key) {
  const section = (sections || []).find((s) => s.key === key);
  if (!section) return true;
  return section.enabled !== false && section.published !== false;
}

export function sectionText(sections, key, field, lang, fallback = '') {
  const section = (sections || []).find((s) => s.key === key);
  return section?.[field]?.[lang] || fallback;
}
