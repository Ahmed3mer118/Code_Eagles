import { Outlet } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">الإعدادات</h1>
      <Outlet />
    </div>
  );
}
