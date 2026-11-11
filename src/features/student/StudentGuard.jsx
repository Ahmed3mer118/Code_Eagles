// src/features/student/StudentGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function StudentGuard() {
  const { user, activeTenant, memberships, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  const activeRole = activeTenant?.role || activeTenant?.membership?.role || user?.role;
  const hasStudentMembership = memberships?.some(m => m.role === 'student') || false;
  
  // لو مفيش Role خالص، بنسمح بالدخول (عشان مشكلة الباك اند)
  if (!activeRole && !hasStudentMembership) {
    return <Outlet />;
  }

  const isStudent = activeRole === 'student' || hasStudentMembership;
  if (!isStudent) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
