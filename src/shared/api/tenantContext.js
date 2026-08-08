export function getStoredTenantSlug() {
  try {
    const fromSession = sessionStorage.getItem('ce_tenant_slug');
    if (fromSession) return fromSession;
    const raw = localStorage.getItem('ce_tenant');
    if (!raw) return null;
    const tenant = JSON.parse(raw);
    return tenant?.slug || null;
  } catch {
    return null;
  }
}

export function setTenantSlug(slug) {
  if (slug) sessionStorage.setItem('ce_tenant_slug', slug);
}

export function clearTenantSlug() {
  sessionStorage.removeItem('ce_tenant_slug');
}
