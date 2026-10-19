import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function StudentGuard() {
  const { user, activeTenant, memberships, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  // 1. هل المستخدم طالب في activeTenant؟
  const activeRole = activeTenant?.role || activeTenant?.membership?.role;
  
  // 2. أو هل هو طالب في أي أكاديمية تانية؟ (لو مش مختار أكاديمية)
  const hasStudentMembership = memberships?.some(m => m.role === 'student') || false;

  const isStudent = activeRole === 'student' || hasStudentMembership;

  if (!isStudent) {
    console.warn('🛑 Not a student, redirecting home. Role:', activeRole);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
