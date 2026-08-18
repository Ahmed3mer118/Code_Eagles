import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '../../../shared/ui/LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
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

  const goDashboard = () => {
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
      <header className="sticky top-0 z-50 border-b border-[var(--ce-border)] bg-[var(--ce-surface)]/85 backdrop-blur-xl">
        <div className="ce-container flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-accent)] text-sm font-extrabold text-white shadow-lg">
              CE
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-lg font-extrabold tracking-tight text-[var(--ce-primary)]">
                {t('brand.name')}
              </div>
              <div className="truncate text-xs text-[var(--ce-muted)]">{t('brand.tagline')}</div>
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

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {token ? (
              <button type="button" className="ce-btn ce-btn-primary hidden text-sm sm:inline-flex" onClick={goDashboard}>
                {t('nav.dashboard')}
              </button>
            ) : (
              <>
                <Link to="/auth/login" className="ce-btn ce-btn-ghost hidden text-sm sm:inline-flex">
                  {t('nav.login')}
                </Link>
                <Link to="/auth/register" className="ce-btn ce-btn-accent hidden text-sm sm:inline-flex">
                  {t('nav.register')}
                </Link>
              </>
            )}
            <button
              type="button"
              className="ce-icon-btn lg:hidden"
              onClick={() => setOpen(true)}
              aria-label={t('dashboard.openMenu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label={t('common.cancel')} />
          <aside className="absolute end-0 top-0 flex h-full w-[min(100%,320px)] flex-col bg-[var(--ce-surface)] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[var(--ce-primary)]">{t('brand.name')}</span>
              <button type="button" className="ce-icon-btn" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-4 text-base font-semibold">
              {navLinks.map((link) =>
                link.route ? (
                  <Link key={link.key} to={link.href} onClick={() => setOpen(false)}>
                    {t(link.labelKey)}
                  </Link>
                ) : (
                  <a key={link.key} href={link.href} onClick={() => setOpen(false)}>
                    {t(link.labelKey)}
                  </a>
                )
              )}
            </nav>
            <div className="mt-auto flex flex-col gap-2 pt-8">
              {token ? (
                <button type="button" className="ce-btn ce-btn-primary" onClick={() => { setOpen(false); goDashboard(); }}>
                  {t('nav.dashboard')}
                </button>
              ) : (
                <>
                  <Link to="/auth/login" className="ce-btn ce-btn-ghost" onClick={() => setOpen(false)}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/auth/register" className="ce-btn ce-btn-accent" onClick={() => setOpen(false)}>
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[var(--ce-border)] bg-[var(--ce-surface)]/95 backdrop-blur lg:hidden">
        <div className={`grid gap-1 px-2 py-2 ${bottomNavItems.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {bottomNavItems.map((item) =>
            item.route ? (
              <Link key={item.label} to={item.href} className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-muted)]">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-muted)]">
                {item.label}
              </a>
            )
          )}
        </div>
      </nav>
    </>
  );
}
