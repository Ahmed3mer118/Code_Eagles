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
      if (!token) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const tenantId = getTenantId();
        const data = await authService.me(tenantId);

        if (!mounted) return;

        setUser(data.user ?? null);
        setMemberships(data.memberships ?? []);

        // ✅ الحل: استخراج الـ Tenant ID من أي مكان متاح
        let finalTenantId = null;

        if (data.currentTenant) {
          finalTenantId = data.currentTenant.tenantId || data.currentTenant.id;
          setActiveTenant(data.currentTenant);
        } else if (data.memberships && data.memberships.length > 0) {
          const fallback = data.memberships.find((m) => m.tenantId === tenantId) || data.memberships[0];
          finalTenantId = fallback.tenantId;
          setActiveTenant(fallback);
        }

        // ✅ الحفظ الإجباري في الـ localStorage
        if (finalTenantId) {
          setTenantId(finalTenantId);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
          clearTenant();
          if (mounted) {
            setUser(null);
            setActiveTenant(null);
          }
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

    let finalTenantId = null;
    if (data.currentTenant) {
      finalTenantId = data.currentTenant.tenantId || data.currentTenant.id;
      setActiveTenant(data.currentTenant);
    } else if (data.memberships && data.memberships.length > 0) {
      finalTenantId = data.memberships[0].tenantId;
      setActiveTenant(data.memberships[0]);
    }

    if (finalTenantId) {
      setTenantId(finalTenantId);
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
      setTenantId(data.currentTenant.tenantId || data.currentTenant.id);
    } else {
      setTenantId(tenantId);
    }
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
    const tenantId = getTenantId();
    const data = await authService.me(tenantId);
    setUser(data.user ?? null);
    setMemberships(data.memberships ?? []);
    if (data.currentTenant) {
      setActiveTenant(data.currentTenant);
      setTenantId(data.currentTenant.tenantId || data.currentTenant.id);
    }
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
