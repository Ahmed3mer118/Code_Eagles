import { Navigate, useLocation } from 'react-router-dom';
import AuthServices, { normalizeRole } from '../api/authService';
import { buildQueryString, getCleanParam } from '../utils/queryParams';

export function buildLoginUrl(returnPath) {
  const path = returnPath || '/dashboard/student/join';
  return `/auth/login?returnTo=${encodeURIComponent(path)}`;
}

export function buildRegisterUrl(returnPath, extra = {}) {
  const query = buildQueryString({ role: 'student', ...extra, returnTo: returnPath });
  return `/auth/register?${query}`;
}

export function resolveReturnTo(params, fallback) {
  const raw = getCleanParam(params, 'returnTo');
  if (raw && raw.startsWith('/')) return raw;
  const group = getCleanParam(params, 'group');
  const academy = getCleanParam(params, 'academy');
  if (group) return `/dashboard/student/join?${buildQueryString({ group, academy })}`;
  if (academy) return `/dashboard/student/join?${buildQueryString({ academy })}`;
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
