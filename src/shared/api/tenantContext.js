import { STORAGE_KEYS } from '../config/apiBase';

export function getTenantId() {
  return localStorage.getItem(STORAGE_KEYS.TENANT_ID);
}

export function setTenantId(tenantId) {
  if (tenantId) localStorage.setItem(STORAGE_KEYS.TENANT_ID, tenantId);
  else localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
}

export function clearTenant() {
  localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
}