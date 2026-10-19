// src/features/assistant/AssistantGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function AssistantGuard() {
  const { user, activeTenant, memberships, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  const activeRole = activeTenant?.role || activeTenant?.membership?.role;
  const hasAssistantMembership = memberships?.some(m => m.role === 'assistant') || false;
  const isAssistant = activeRole === 'assistant' || hasAssistantMembership;

  if (!isAssistant) {
    console.warn('🛑 Not an assistant, redirecting home. Role:', activeRole);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
