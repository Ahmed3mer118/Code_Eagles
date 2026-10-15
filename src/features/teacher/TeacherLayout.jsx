import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import { useTeacherStats } from './hooks/useTeacherStats';

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: stats } = useTeacherStats();

  // Badges ديناميكية من الـ API
  const badges = {
    pendingRequests: stats?.pendingEnrollments || 0,
    pendingPayments: stats?.pendingPayments || 0,
    unreadNotifications: stats?.unreadNotifications || 0,
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <TeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        badges={badges}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
