import { Bell } from 'lucide-react';

export default function StudentNotifications() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Bell size={24} /> الإشعارات
      </h1>
      <p className="text-gray-500">هنا هتظهر إشعاراتك.</p>
    </div>
  );
}
