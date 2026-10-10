import { Navigate } from 'react-router-dom';
import { isAuthenticated, getStoredUser } from '../api/client';

export default function RoleGuard({ roles = [], children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const user = getStoredUser();
  const userRole = user?.platformRole;

  if (roles.length && userRole && !roles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}