// src/features/parent/ParentGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function ParentGuard() {
  const { user, activeTenant, memberships, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  const activeRole = activeTenant?.role || activeTenant?.membership?.role;
  const hasParentMembership = memberships?.some(m => m.role === 'parent') || false;
  const isParent = activeRole === 'parent' || hasParentMembership;

  if (!isParent) {
    console.warn('🛑 Not a parent, redirecting home. Role:', activeRole);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
