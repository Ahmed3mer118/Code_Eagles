import axios from 'axios';
import API_BASE, { STORAGE_KEYS } from '../config/apiBase';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/public',
];

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const url = config.url || '';
  const isPublic = PUBLIC_PATHS.some((p) => url.startsWith(p));

  if (!isPublic) {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);

    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers['X-Tenant-Id'] = tenantId;
  }

  return config;
});

export function setAuthSession({ accessToken, refreshToken, tenantId, user }) {
  if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  if (tenantId) localStorage.setItem(STORAGE_KEYS.TENANT_ID, tenantId);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

let refreshPromise = null;

async function refreshTokens() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);
  if (!refreshToken) throw new Error('No refresh token');

  // ✅ بنبعت tenantId الحالي عشان الباك ما يختارش tenant عشوائي
  const { data } = await axios.post(
    `${API_BASE}/auth/refresh`,
    { refreshToken, ...(tenantId ? { tenantId } : {}) },
    { headers: { 'Content-Type': 'application/json' } },
  );

  setAuthSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    // ✅ بنحافظ على tenantId الحالي (الباك مش بيرجعه)
    ...(tenantId ? { tenantId } : {}),
  });

  return data.accessToken;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';

    const isAuthRoute = PUBLIC_PATHS.some((p) => url.startsWith(p));

    if (status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshTokens().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (e) {
        clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;