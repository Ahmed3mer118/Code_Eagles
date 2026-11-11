// src/features/teacher/TeacherLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import { useTeacherStats } from './hooks/useTeacherStats';
import { useI18n } from '../../shared/i18n';

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: stats } = useTeacherStats();
  const { dir } = useI18n();

  const badges = {
    pendingRequests: stats?.pendingEnrollments || 0,
    pendingPayments: stats?.pendingPayments || 0,
    unreadNotifications: stats?.unreadNotifications || 0,
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100" dir={dir}>
      <TeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        badges={badges}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TeacherHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
