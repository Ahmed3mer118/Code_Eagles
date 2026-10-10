import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../shared/api/authService';
import LoadingScreen from '../../shared/ui/LoadingScreen';

const DEBUG = true; // 👈 شيلها بعد ما نخلص

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function checkSuperAdmin(obj) {
  if (!obj) return false;
  const role = obj?.user?.platformRole || obj?.platformRole;
  if (typeof role === 'string' && role.toLowerCase() === 'super_admin') return true;

  const roles = [obj?.user?.role, obj?.role, obj?.currentTenant?.role]
    .filter(Boolean).map((r) => String(r).toLowerCase());
  if (roles.some((r) => r.includes('super'))) return true;

  if (obj?.user?.isSuperAdmin === true || obj?.isSuperAdmin === true) return true;
  return false;
}

function checkTokenFallback() {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token');
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const role = payload.platformRole || payload.role || payload.platform_role;
  return typeof role === 'string' && role.toLowerCase() === 'super_admin';
}

export default function SuperAdminGuard({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;

    // ✅ 1) flag
    try {
      const flag = localStorage.getItem('isSuperAdmin');
      if (DEBUG) console.log('🛡️ Guard: flag =', flag);
      if (flag === 'true') {
        if (DEBUG) console.log('✅ Guard: ALLOW via flag');
        setStatus('ok');
        return;
      }
    } catch (_) {}

    // ✅ 2) JWT
    const tokenOk = checkTokenFallback();
    if (DEBUG) console.log('🛡️ Guard: tokenFallback =', tokenOk);
    if (tokenOk) {
      try { localStorage.setItem('isSuperAdmin', 'true'); } catch (_) {}
      setStatus('ok');
      return;
    }

    // ⏳ 3) /me
    (async () => {
      try {
        const me = await authService.me();
        if (DEBUG) console.log('🛡️ Guard: /me response =', me);
        if (!mounted) return;

        if (checkSuperAdmin(me)) {
          try { localStorage.setItem('isSuperAdmin', 'true'); } catch (_) {}
          setStatus('ok');
        } else {
          if (DEBUG) console.log('❌ Guard: DENY — no super_admin in /me');
          setStatus('deny');
        }
      } catch (err) {
        if (DEBUG) console.log('❌ Guard: /me failed', err?.message);
        if (mounted) setStatus(checkTokenFallback() ? 'ok' : 'guest');
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (DEBUG) console.log('🛡️ Guard render: status =', status);

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'guest')
    return <Navigate to="/login" replace state={{ from: location }} />;
  if (status === 'deny') return <Navigate to="/dashboard" replace />;
  return children;
}