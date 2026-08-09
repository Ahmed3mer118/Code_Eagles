import { Suspense, memo, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import TeacherGlobalSearch from '../ui/TeacherGlobalSearch';
import ContentLoader from '../ui/ContentLoader';
import AuthServices from '../api/authService';
import { getStoredTenant, setStoredTenant } from '../api/tenantContext';
import resolveMediaUrl from '../utils/mediaUrl';

/** Memoized so page navigation never re-renders the navigation column. */
const SidebarNav = memo(function SidebarNav({ navItems }) {
  const { t } = useTranslation();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-1 md:flex-col md:overflow-visible">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-white text-[var(--ce-primary)] shadow-sm' : 'text-white/80 hover:bg-white/10'
              }`
            }
          >
            {Icon && <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />}
            <span>{t(item.labelKey)}</span>
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
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = new AuthServices();
  const userName = auth.getUserName?.() || 'User';
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

  const displayName = brand.name || (brandMode === 'platform' ? t('brand.name') : t('brand.academy'));

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
      <aside className="ce-sidebar flex min-h-0 flex-col border-b border-[var(--ce-border)] bg-[var(--ce-primary)] text-white md:sticky md:top-0 md:h-screen md:border-b-0 md:overflow-y-auto">
        <div className="flex items-center gap-3 px-5 py-5">
          <img
            src={resolveMediaUrl(brand.logoUrl) || '/images/LOGO.png'}
            alt=""
            className="h-9 w-9 rounded-lg bg-white/10 object-contain p-1"
          />
          <div className="min-w-0">
            <div className="truncate font-extrabold">{displayName}</div>
            <div className="text-xs text-white/70">{t(titleKey)}</div>
          </div>
        </div>
        <SidebarNav navItems={navItems} />
        <div className="mt-auto border-t border-white/10 px-5 py-4 text-center text-xs text-white/50">
          {t('dashboard.createdBy')}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ce-border)] bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold text-[var(--ce-primary)]">{displayName}</h1>
            <p className="text-sm text-[var(--ce-muted)]">{t(titleKey)} · {t('dashboard.welcome', { name: userName })}</p>
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
          {/* Scoped boundary: lazy pages swap here while the sidebar stays mounted. */}
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
