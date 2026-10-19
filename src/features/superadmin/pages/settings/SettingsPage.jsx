// src/features/superadmin/pages/settings/SettingsPage.jsx
import { NavLink, Outlet } from 'react-router-dom';
import { useI18n } from '../../../../shared/i18n';

export default function SettingsPage() {
  const { t } = useI18n();

  const tabs = [
    { to: 'profile', label: t('admin.settings.tabs.profile'), icon: '👤' },
    { to: 'security', label: t('admin.settings.tabs.security'), icon: '🔐' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          {t('admin.settings.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`
            }
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
