import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '../../../shared/ui/LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import PlatformLogo from '../../../shared/ui/PlatformLogo';
import AuthServices from '../../../shared/api/authService';

const navLinks = [
  { key: 'features', href: '/#features', labelKey: 'landing.featuresTitleNav' },
  { key: 'academies', href: '/#academies', labelKey: 'landing.academiesTitleNav' },
  { key: 'categories', href: '/#categories', labelKey: 'landing.categoriesTitleNav' },
  { key: 'contact', href: '/contact', route: true, labelKey: 'nav.contact' },
];

export default function MarketingNavbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const auth = new AuthServices();
  const token = auth.getToken();
  const role = auth.getRole();
  const dashboardPath = auth.getDashboardPath?.(role) || '/dashboard/student';

  useEffect(() => {
    if (!open) return undefined;

    document.body.classList.add('ce-marketing-drawer-open');
    return () => {
      document.body.classList.remove('ce-marketing-drawer-open');
    };
  }, [open]);

  const closeDrawer = () => setOpen(false);

  const goDashboard = () => {
    closeDrawer();
    navigate(dashboardPath);
  };

  const bottomNavItems = token
    ? [
        { label: t('nav.home'), href: '/' },
        { label: t('nav.academies'), href: '/#academies' },
        { label: t('nav.dashboard'), href: dashboardPath, route: true },
      ]
    : [
        { label: t('nav.home'), href: '/' },
        { label: t('nav.academies'), href: '/#academies' },
        { label: t('nav.contact'), href: '/contact', route: true },
        { label: t('nav.login'), href: '/auth/login', route: true },
      ];

  return (
    <>
      <header className="ce-marketing-header sticky top-0 z-50">
        <div className="ce-container flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <PlatformLogo className="h-11 w-11" />
            <div className="hidden min-w-0 lg:block">
              <div className="truncate text-lg font-extrabold tracking-tight text-[var(--ce-text)]">
                {t('brand.name')}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--ce-text)] lg:flex">
            {navLinks.map((link) =>
              link.route ? (
                <Link key={link.key} to={link.href} className="hover:text-[var(--ce-accent)]">
                  {t(link.labelKey)}
                </Link>
              ) : (
                <a key={link.key} href={link.href} className="hover:text-[var(--ce-accent)]">
                  {t(link.labelKey)}
                </a>
              )
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />

            <LanguageSwitcher />
            {token ? (
              <button type="button" className="ce-btn ce-btn-primary text-sm" onClick={goDashboard}>
                {t('nav.dashboard')}
              </button>
            ) : (
              <>
                <Link to="/auth/login" className="ce-btn ce-btn-ghost text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/auth/register" className="ce-btn ce-btn-accent text-sm">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="ce-icon-btn flex lg:hidden"
            onClick={() => setOpen(true)}
            aria-label={t('dashboard.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="ce-marketing-drawer-backdrop absolute inset-0"
            onClick={closeDrawer}
            aria-label={t('common.cancel')}
          />
          <aside className="ce-marketing-drawer absolute end-0 top-0 flex h-full w-[min(100%,320px)] flex-col p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex min-w-0 items-center gap-3" onClick={closeDrawer}>
                <PlatformLogo className="h-10 w-10" />
              </Link>
              <button type="button" className="ce-icon-btn shrink-0" onClick={closeDrawer} aria-label={t('common.cancel')}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-1">
              {navLinks.map((link) =>
                link.route ? (
                  <Link
                    key={link.key}
                    to={link.href}
                    className="rounded-xl px-3 py-3 text-base font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)] hover:text-[var(--ce-accent)]"
                    onClick={closeDrawer}
                  >
                    {t(link.labelKey)}
                  </Link>
                ) : (
                  <a
                    key={link.key}
                    href={link.href}
                    className="rounded-xl px-3 py-3 text-base font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)] hover:text-[var(--ce-accent)]"
                    onClick={closeDrawer}
                  >
                    {t(link.labelKey)}
                  </a>
                )
              )}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-[var(--ce-border)] pt-5">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher className="flex-1 justify-center" />
              </div>
              {token ? (
                <button type="button" className="ce-btn ce-btn-primary w-full text-sm" onClick={goDashboard}>
                  {t('nav.dashboard')}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/auth/login" className="ce-btn ce-btn-ghost text-sm" onClick={closeDrawer}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/auth/register" className="ce-btn ce-btn-accent text-sm" onClick={closeDrawer}>
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {!open && (
        <nav className="ce-marketing-bottom-nav fixed bottom-0 inset-x-0 z-40 lg:hidden">
          <div className={`grid gap-1 px-2 py-2 ${bottomNavItems.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {bottomNavItems.map((item) =>
              item.route ? (
                <Link key={item.label} to={item.href} className="rounded-xl px-2 py-2 text-center text-[11px] font-bold">
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className="rounded-xl px-2 py-2 text-center text-[11px] font-bold">
                  {item.label}
                </a>
              )
            )}
          </div>
        </nav>
      )}
    </>
  );
}
