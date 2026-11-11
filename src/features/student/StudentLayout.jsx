// src/features/student/StudentLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import StudentSidebar from './StudentSidebar';
import StudentPendingPage from './pages/StudentPendingPage';
import { useAuth } from '../../shared/context/AuthContext';
import useStudentEnrollments from './hooks/useStudentEnrollments';

// ✅ المسارات المسموح بيها للطالب حتى لو مش مقبول بعد
const ALLOWED_BEFORE_APPROVAL = [
  '/student/payment-plans',
  '/student/payments',
  '/student/subscription',
  '/student/profile',
  '/student/notifications',
  '/student/pending',
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const { data: enrollments, loading } = useStudentEnrollments();

  const hasActiveEnrollment =
    Array.isArray(enrollments) && enrollments.some((e) => e.status === 'active');

  const isAllowedBeforeApproval = ALLOWED_BEFORE_APPROVAL.some((path) =>
    location.pathname.startsWith(path)
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        جاري التحقق من حالة الاشتراك...
      </div>
    );
  }

  const showPending = !hasActiveEnrollment && !isAllowedBeforeApproval;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isPending={!hasActiveEnrollment}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name || 'طالب'}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {showPending ? <StudentPendingPage /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
