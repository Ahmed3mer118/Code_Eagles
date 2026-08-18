import { Suspense, memo, useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import NotificationBell from '../ui/NotificationBell';
import TeacherGlobalSearch from '../ui/TeacherGlobalSearch';
import ContentLoader from '../ui/ContentLoader';
import AuthServices from '../api/authService';
import { getStoredTenant, setStoredTenant } from '../api/tenantContext';
import resolveMediaUrl from '../utils/mediaUrl';

/** Memoized so page navigation never re-renders the navigation column. */
const SidebarNav = memo(function SidebarNav({ navItems, onNavigate }) {
  const { t } = useTranslation();

  return (
    <nav className="ce-sidebar-nav flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-white text-[var(--ce-primary)] shadow-sm' : 'text-white/80 hover:bg-white/10'
              }`
            }
          >
            {Icon && <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />}
            <span className="truncate">{t(item.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
});

export default function DashboardShell({
  titleKey,
  navItems = [],
  showTeacherSearch = false,
  brandMode = 'academy',
  headerExtra = null,
  sidebarExtra = null,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = new AuthServices();
  const userName = auth.getUserName?.() || 'User';
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const [brand, setBrand] = useState(() => {
    if (brandMode === 'platform') {
      return { name: '', logoUrl: '/images/LOGO.png' };
    }
    const tenant = getStoredTenant();
    return {
      name: tenant?.name || '',
      logoUrl: tenant?.logoUrl || '/images/LOGO.png',
    };
  });

  useEffect(() => {
    if (brandMode === 'platform') {
      setBrand({ name: t('brand.name'), logoUrl: '/images/LOGO.png' });
      return;
    }

    const stored = getStoredTenant();
    if (stored?.name) {
      setBrand({
        name: stored.name,
        logoUrl: stored.logoUrl || '/images/LOGO.png',
      });
    }

    const role = auth.getRole();

    auth.me()
      .then((data) => {
        if (role === 'student') {
          const selected = getStoredTenant();
          if (selected?.slug) {
            setBrand({
              name: selected.name,
              logoUrl: selected.logoUrl || '/images/LOGO.png',
            });
            return;
          }
          if (data.tenant) {
            setStoredTenant(data.tenant);
            setBrand({
              name: data.tenant.name,
              logoUrl: data.tenant.logoUrl || '/images/LOGO.png',
            });
          }
          return;
        }

        if (data.tenant) {
          setStoredTenant(data.tenant);
          setBrand({
            name: data.tenant.name,
            logoUrl: data.tenant.logoUrl || '/images/LOGO.png',
          });
        } else if (data.user?.name && brandMode === 'academy') {
          setBrand({
            name: data.user.name,
            logoUrl: '/images/LOGO.png',
          });
        }
      })
      .catch(() => {});
  }, [brandMode, t]);

  // The drawer only exists below the lg breakpoint, so lock scrolling while it is open.
  useEffect(() => {
    if (!navOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [navOpen]);

  const displayName = brand.name || (brandMode === 'platform' ? t('brand.name') : t('brand.academy'));

  const role = auth.getRole();
  const notificationsPath = {
    super_admin: '/dashboard/super-admin/notifications',
    teacher: '/dashboard/teacher/notifications',
    assistant: '/dashboard/assistant/notifications',
    student: '/dashboard/student/notifications',
    parent: '/dashboard/parent/notifications',
  }[role] || '/dashboard/student/notifications';

  const logout = async () => {
    try {
      await auth.logout();
    } catch (_) {
      auth.handleLogout();
    }
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr] xl:grid-cols-[268px_1fr]">
      {navOpen && (
        <div className="ce-sidebar-backdrop" role="presentation" onClick={closeNav} />
      )}

      <aside
        className={`ce-sidebar flex min-h-0 flex-col bg-[var(--ce-primary)] text-white ${navOpen ? 'is-open' : ''}`}
        aria-label={t(titleKey)}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <img
            src={resolveMediaUrl(brand.logoUrl) || '/images/LOGO.png'}
            alt=""
            className="h-9 w-9 shrink-0 rounded-lg bg-white/10 object-contain p-1"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-extrabold">{displayName}</div>
            <div className="text-xs text-white/70">{t(titleKey)}</div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 lg:hidden"
            onClick={closeNav}
            aria-label={t('common.cancel')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarExtra}
        <SidebarNav navItems={navItems} onNavigate={closeNav} />
        <div className="mt-auto border-t border-white/10 px-5 py-4 text-center text-xs text-white/50">
          {t('dashboard.createdBy')}
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-[var(--ce-border)] bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <button
            type="button"
            className="rounded-xl border border-[var(--ce-border)] p-2 text-[var(--ce-primary)] transition hover:bg-[var(--ce-bg)] lg:hidden"
            onClick={() => setNavOpen(true)}
            aria-label={t('dashboard.openMenu')}
            aria-expanded={navOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-extrabold text-[var(--ce-primary)] sm:text-lg">{displayName}</h1>
            <p className="truncate text-xs text-[var(--ce-muted)] sm:text-sm">
              {t(titleKey)} · {t('dashboard.welcome', { name: userName })}
            </p>
          </div>
          {showTeacherSearch && <TeacherGlobalSearch />}
          {headerExtra}
          <div className="flex items-center gap-2">
            <NotificationBell notificationsPath={notificationsPath} />
            <LanguageSwitcher />
            <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={logout}>
              {t('nav.logout')}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {/* Scoped boundary: lazy pages swap here while the sidebar stays mounted. */}
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
