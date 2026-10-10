// Simple fetch-based helper if you ever need raw fetch outside axios
import API_BASE, { STORAGE_KEYS } from '../config/apiBase';

export async function platformFetch(path, options = {}) {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed');
    err.response = { status: res.status, data };
    throw err;
  }
  return data;
}