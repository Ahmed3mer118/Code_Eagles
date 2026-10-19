const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || 'api';
const API_VERSION = import.meta.env.VITE_API_VERSION || '';  // ← فاضي

// لو API_VERSION فاضي، متضيفش / في الآخر
export const API_BASE = API_VERSION
  ? `${API_BASE_URL}/${API_PREFIX}/${API_VERSION}`
  : `${API_BASE_URL}/${API_PREFIX}`;

export const API_ORIGIN = API_BASE_URL;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ce_access_token',
  REFRESH_TOKEN: 'ce_refresh_token',
  TENANT_ID: 'ce_tenant_id',
  USER: 'ce_user',
};

export const GOOGLE_OAUTH_URL =
  import.meta.env.VITE_GOOGLE_OAUTH_URL || `${API_BASE}/auth/google`;

export default API_BASE;
