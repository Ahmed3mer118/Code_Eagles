import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import TeacherGlobalSearch from '../ui/TeacherGlobalSearch';
import AuthServices from '../api/authService';

export default function DashboardShell({ titleKey, navItems = [], showTeacherSearch = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = new AuthServices();
  const userName = auth.getUserName?.() || 'User';

  const logout = async () => {
    try {
      await auth.logout();
    } catch (_) {
      auth.handleLogout();
    }
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="ce-sidebar border-b border-[var(--ce-border)] bg-[var(--ce-primary)] text-white md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:overflow-y-auto">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/images/LOGO.png" alt="" className="h-9 w-9 rounded-lg bg-white/10 p-1" />
          <div>
            <div className="font-extrabold">{t('brand.name')}</div>
            <div className="text-xs text-white/70">{t(titleKey)}</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-1 md:flex-col md:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-[var(--ce-primary)] shadow-sm' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ce-border)] bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold text-[var(--ce-primary)]">{t(titleKey)}</h1>
            <p className="text-sm text-[var(--ce-muted)]">{t('dashboard.welcome', { name: userName })}</p>
          </div>
          {showTeacherSearch && <TeacherGlobalSearch />}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={logout}>
              {t('nav.logout')}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
