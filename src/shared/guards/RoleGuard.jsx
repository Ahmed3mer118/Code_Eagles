import { Navigate, useLocation } from 'react-router-dom';
import AuthServices, { normalizeRole } from '../api/authService';

export function buildLoginUrl(returnPath) {
  const path = returnPath || '/dashboard/student/join';
  return `/auth/login?returnTo=${encodeURIComponent(path)}`;
}

export function buildRegisterUrl(returnPath, extra = {}) {
  const params = new URLSearchParams({ role: 'student', ...extra });
  if (returnPath) params.set('returnTo', returnPath);
  return `/auth/register?${params.toString()}`;
}

export function resolveReturnTo(params, fallback) {
  const raw = params.get('returnTo');
  if (raw && raw.startsWith('/')) return raw;
  const group = params.get('group');
  const academy = params.get('academy');
  if (group) {
    const qs = new URLSearchParams({ group });
    if (academy) qs.set('academy', academy);
    return `/dashboard/student/join?${qs.toString()}`;
  }
  if (academy) return `/dashboard/student/join?academy=${academy}`;
  return fallback;
}

export default function RoleGuard({ roles = [], children }) {
  const auth = new AuthServices();
  const location = useLocation();
  const token = auth.getToken();
  const role = normalizeRole(auth.getRole());

  if (!token) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?returnTo=${returnTo}`} replace />;
  }

  if (roles.length && !roles.includes(role)) {
    return <Navigate to={auth.getDashboardPath(role)} replace />;
  }

  return children;
}
