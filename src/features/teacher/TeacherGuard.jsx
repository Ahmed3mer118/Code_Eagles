// src/features/teacher/TeacherGuard.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import { getTenantId } from '../../shared/api/tenantContext';

export default function TeacherGuard() {
  const { user, activeTenant, memberships, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen label="جاري التحقق..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const tenantId = activeTenant?.tenantId || getTenantId();

  if (!tenantId) {
    return <Navigate to="/select-tenant" replace />;
  }

  const membership = (memberships || []).find(
    (m) => m.tenantId === tenantId,
  );

  if (!membership) {
    return <Navigate to="/unauthorized" replace />;
  }

  const role = String(membership.role || '').toLowerCase();
  if (role !== 'teacher') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
