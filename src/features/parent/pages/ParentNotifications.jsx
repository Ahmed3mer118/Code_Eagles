// src/features/parent/pages/ParentNotifications.jsx
import { Bell } from 'lucide-react';

export default function ParentNotifications() {
  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={24} className="text-primary-600" /> الإشعارات
        </h1>
      </div>
      <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
        <p className="text-gray-500">لا توجد إشعارات جديدة.</p>
      </div>
    </div>
  );
}
