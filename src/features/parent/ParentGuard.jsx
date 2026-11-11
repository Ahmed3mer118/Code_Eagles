// src/features/parent/ParentGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function ParentGuard() {
  const { user, activeTenant, memberships, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  // ✅ اجمع كل المصادر الممكنة للـ role
  const possibleRoles = [
    user?.role,
    user?.platformRole,
    activeTenant?.role,
    activeTenant?.membership?.role,
    ...(memberships || []).map((m) => m?.role),
    ...(memberships || []).map((m) => m?.tenant?.role),
    ...(user?.memberships || []).map((m) => m?.role),
    ...(user?.memberships || []).map((m) => m?.tenant?.role),
  ]
    .filter(Boolean)
    .map((r) => String(r).toLowerCase());

  const isParent = possibleRoles.includes('parent');

  console.log('🔍 ParentGuard check:', {
    userRole: user?.role,
    activeRole: activeTenant?.role,
    membershipsCount: memberships?.length,
    possibleRoles,
    isParent,
  });

  if (isParent) {
    return <Outlet />;
  }

  // ⚠️ لو مفيش memberships خالص (لسه بتحمل أو المستخدم جديد)
  // سيبه يعدي والباك إند هو اللي يرفض
  if (!memberships || memberships.length === 0) {
    return <Outlet />;
  }

  console.warn('🛑 Not a parent, redirecting home. Roles found:', possibleRoles);
  return <Navigate to="/" replace />;
}
