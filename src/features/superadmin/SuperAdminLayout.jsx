import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../../shared/ui/LanguageSwitcher';
import { useI18n } from '../../shared/i18n';
import authService from '../../shared/api/authService';
import { getStoredUser } from '../../shared/api/client';
import {
  IconOverview, IconAcademy, IconRequests, IconMessages, IconPlans,
  IconContent, IconUsers, IconSettings, IconBell, IconSearch,
  IconMenu, IconClose, IconLogout, IconChevronLeft, IconChevronRight,
} from './icons';

const NAV = [
  { to: '/admin/dashboard',     key: 'overview',      Icon: IconOverview,  badge: null },
  { to: '/admin/academies',     key: 'academies',     Icon: IconAcademy,   badge: null },
  { to: '/admin/requests',      key: 'requests',      Icon: IconRequests,  badge: 4 },
  { to: '/admin/messages',      key: 'messages',      Icon: IconMessages,  badge: 2 },
  { to: '/admin/plans',         key: 'plans',         Icon: IconPlans,     badge: null },
  { to: '/admin/content',       key: 'content',       Icon: IconContent,   badge: null },
  { to: '/admin/users',         key: 'users',         Icon: IconUsers,     badge: null },
  { to: '/admin/notifications', key: 'notifications', Icon: IconBell,      badge: 7 },
  { to: '/admin/settings',      key: 'settings',      Icon: IconSettings,  badge: null },
];

export default function SuperAdminLayout({ children }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser() || null);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // مزامنة بيانات المستخدم من localStorage (لو حصل تحديث في صفحة البروفايل)
  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener('storage', sync);
    // تحديث أولي
    sync();
    return () => window.removeEventListener('storage', sync);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const onLogout = async () => {
    try { await authService.logout?.(); } catch (_) {}
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || 'Super Admin';
  const displayEmail = user?.email || 'superadmin@code-eagles.com';
  const initials = (displayName.trim()[0] || 'S').toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#eef2f8] to-[#e3eaf5]">
      {/* ===== Sidebar ===== */}
      <aside
        className={`fixed inset-y-0 z-40 flex flex-col bg-gradient-to-b from-[#0f2744] to-[#0a1c33] text-white shadow-2xl shadow-[#0f2744]/40 transition-all duration-300
          ${collapsed ? 'lg:w-[84px]' : 'lg:w-[268px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          start-0 w-[268px]`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-[72px] shrink-0 border-b border-white/5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-amber-400/40 blur-md" />
            <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <img src="/images/LOGO.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[15px] font-bold leading-tight truncate">Code Eagles</div>
              <div className="text-[11px] text-amber-300/90 font-medium tracking-wide">SUPER ADMIN</div>
            </div>
          )}

          <button
            onClick={closeMobile}
            className="lg:hidden ms-auto p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="close"
          >
            <IconClose />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(({ to, key, Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-white/60 hover:text-white hover:bg-white/5'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-e-full" />
                  )}
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-amber-400' : ''}`}>
                    <Icon />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{t(`admin.nav.${key}`)}</span>
                      {badge != null && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-[#0f2744] text-[10px] font-bold flex items-center justify-center">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && badge != null && (
                    <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center gap-2 mx-3 mb-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition"
        >
          {collapsed ? (
            <IconChevronRight />
          ) : (
            <>
              <IconChevronLeft />
              <span>{t('admin.collapse')}</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition
            ${collapsed ? 'justify-center' : ''}`}
        >
          <IconLogout />
          {!collapsed && <span>{t('admin.logout')}</span>}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-[#0f2744]/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* ===== Main ===== */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ps-[84px]' : 'lg:ps-[268px]'}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
          <div className="h-full px-4 sm:px-6 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
              aria-label="menu"
            >
              <IconMenu />
            </button>

            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <span className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder={t('admin.search')}
                  className="w-full bg-slate-100/80 border border-transparent focus:border-[#1a3a5c]/20 focus:bg-white rounded-xl ps-10 pe-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#1a3a5c]/10 transition"
                />
              </div>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <LanguageSwitcher />

              <button
                onClick={() => navigate('/admin/notifications')}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                aria-label="notifications"
              >
                <IconBell />
                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              </button>

              {/* User box → clickable → profile */}
              <button
                type="button"
                onClick={() => navigate('/admin/settings')}
                className="flex items-center gap-2 ps-2 ms-1 border-s border-slate-200 hover:opacity-90 transition text-start"
                title="البروفايل"
              >
                <div className="hidden sm:block text-end">
                  <div className="text-[13px] font-semibold text-slate-800 leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-400">{displayEmail}</div>
                </div>
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={displayName}
                    className="w-9 h-9 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a3a5c] to-[#0f2744] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {initials}
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ——— Page Header ——— */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}