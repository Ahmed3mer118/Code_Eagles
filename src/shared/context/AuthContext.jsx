// src/shared/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import authService from '../api/authService';
import {
  isAuthenticated as hasToken,
  getStoredUser,
  clearAuth,
  getAccessToken,
} from '../api/client';
import { getTenantId, setTenantId, clearTenant } from '../api/tenantContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [activeTenant, setActiveTenant] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const token = getAccessToken();
      console.log('🔵 [AuthProvider] bootstrap — token?', !!token);

      if (!token) {
        console.log('🔴 [AuthProvider] no token, skipping bootstrap');
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const tenantId = getTenantId();
        console.log('🔵 [AuthProvider] calling /auth/me with tenantId:', tenantId);

        const data = await authService.me(tenantId);
        console.log('🟢 [AuthProvider] /auth/me response:', data);

        if (!mounted) return;

        setUser(data.user ?? null);
        setMemberships(data.memberships ?? []);

        if (data.currentTenant) {
          setActiveTenant(data.currentTenant);
          if (data.currentTenant.tenantId) {
            setTenantId(data.currentTenant.tenantId);
          }
        } else {
          const fallback =
            (data.memberships || []).find((m) => m.tenantId === tenantId) ||
            (data.memberships || [])[0];

          if (fallback) {
            setActiveTenant(fallback);
            setTenantId(fallback.tenantId);
          }
        }
      } catch (err) {
        console.error('🔴 [AuthProvider] bootstrap failed:', err);
        console.error('🔴 Status:', err?.response?.status);
        console.error('🔴 Data:', err?.response?.data);

        // ⚠️ لا نعمل clearAuth إلا لو 401 صريح
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          console.warn('🔴 [AuthProvider] clearing auth due to', status);
          clearAuth();
          clearTenant();
          if (mounted) {
            setUser(null);
            setActiveTenant(null);
          }
        } else {
          console.warn('⚠️ [AuthProvider] NOT clearing auth (status=' + status + ')');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user ?? null);
    setMemberships(data.memberships ?? []);

    if (data.currentTenant) {
      setActiveTenant(data.currentTenant);
      if (data.currentTenant.tenantId) {
        setTenantId(data.currentTenant.tenantId);
      }
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    clearAuth();
    clearTenant();
    setUser(null);
    setActiveTenant(null);
    setMemberships([]);
  }, []);

  const switchTenant = useCallback(async (tenantOrId) => {
    const tenantId =
      typeof tenantOrId === 'string' ? tenantOrId : tenantOrId?.tenantId;
    if (!tenantId) return null;

    const data = await authService.switchTenant(tenantId);
    setUser(data.user ?? null);
    setMemberships(data.memberships ?? []);

    if (data.currentTenant) {
      setActiveTenant(data.currentTenant);
      setTenantId(data.currentTenant.tenantId);
    }
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
    const tenantId = getTenantId();
    const data = await authService.me(tenantId);
    setUser(data.user ?? null);
    setMemberships(data.memberships ?? []);
    if (data.currentTenant) setActiveTenant(data.currentTenant);
    return data;
  }, []);

  const value = {
    user,
    activeTenant,
    memberships,
    isLoading,
    isAuthenticated: !!user && hasToken(),
    login,
    logout,
    switchTenant,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
