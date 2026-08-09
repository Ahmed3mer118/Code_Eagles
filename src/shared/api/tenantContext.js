export function getStoredTenant() {
  try {
    const raw = localStorage.getItem('ce_tenant');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredTenantSlug() {
  try {
    const fromSession = sessionStorage.getItem('ce_tenant_slug');
    if (fromSession) return fromSession;
    return getStoredTenant()?.slug || null;
  } catch {
    return null;
  }
}

export function setStoredTenant(academy) {
  if (!academy) return;
  localStorage.setItem('ce_tenant', JSON.stringify(academy));
  if (academy.slug) sessionStorage.setItem('ce_tenant_slug', academy.slug);
}

export function setTenantSlug(slug) {
  if (slug) sessionStorage.setItem('ce_tenant_slug', slug);
}

export function clearTenantSlug() {
  sessionStorage.removeItem('ce_tenant_slug');
}

export function clearStoredTenant() {
  localStorage.removeItem('ce_tenant');
  clearTenantSlug();
}
