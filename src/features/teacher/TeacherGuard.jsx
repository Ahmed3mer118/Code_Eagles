// src/features/teacher/TeacherGuard.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import { getTenantId } from '../../shared/api/tenantContext';

export default function TeacherGuard() {
  const { user, activeTenant, memberships, isLoading } = useAuth();
  const location = useLocation();

  const tenantId = activeTenant?.tenantId || getTenantId();

  // 1. لو لسه بيحمل، نعرض شاشة التحميل
  if (isLoading) {
    return <LoadingScreen label="جاري التحقق..." />;
  }

  // 2. لو مفيش يوزر، نوديه للوجين
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. لو مفيش tenantId، نوديه لاختيار الأكاديمية
  if (!tenantId) {
    return <Navigate to="/select-tenant" replace />;
  }

  // 4. ✅ الحل: لو الـ memberships لسه فاضية، بنفترض إنه Teacher ونعديه 
  // عشان ميعملش Reload. الباك إند هيقولنا لو مش مسموح له.
  if (!memberships || memberships.length === 0) {
    return <Outlet />;
  }

  // 5. البحث عن العضوية
  const membership = memberships.find(
    (m) => String(m.tenantId) === String(tenantId)
  );

  // 6. لو مفيش عضوية خالص، نعديه برضه ونخلي الباك إند يرفض لو مش مسموح
  if (!membership) {
    return <Outlet />;
  }

  // 7. لو فيه عضوية وطلعت مش Teacher، نوديه لصفحة Unauthorized
  const role = String(membership.role || '').toLowerCase();
  if (role !== 'teacher') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
