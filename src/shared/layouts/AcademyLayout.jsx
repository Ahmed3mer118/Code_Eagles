import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import resolveMediaUrl from '../utils/mediaUrl';
import ThemeToggle from '../../features/marketing/components/ThemeToggle';
import AuthServices from '../api/authService';

const sectionLinks = [
  { key: 'about', href: '#about' },
  { key: 'courses', href: '#courses' },
  { key: 'groups', href: '#groups' },
  { key: 'pricing', href: '#pricing' },
];

export default function AcademyLayout({ tenant, children }) {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [open, setOpen] = useState(false);
  const auth = new AuthServices();
  const token = auth.getToken();
  const role = auth.getRole();
  const page = tenant?.publicPage || {};
  const footerLinks = (page.footerLinks || []).filter((link) => link.label && link.url);

  const theme = tenant?.theme || {};
  const style = {
    '--ce-primary': theme.primary || '#0B1F33',
    '--ce-accent': theme.accent || '#E8A317',
    '--ce-bg': theme.background || '#F5F7FA',
    '--ce-surface': theme.surface || '#FFFFFF',
    '--ce-text': theme.text || '#0F172A',
  };

  const dashboardPath = auth.getDashboardPath?.(role) || '/dashboard/student';

  const renderFooterLink = (link) => {
    const isExternal = /^https?:\/\//i.test(link.url);
    if (isExternal) {
      return (
        <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="hover:text-[var(--ce-accent-soft)]">
          {link.label}
        </a>
      );
    }
    return (
      <a key={`${link.label}-${link.url}`} href={link.url} className="hover:text-[var(--ce-accent-soft)]">
        {link.label}
      </a>
    );
  };

  const bottomNavItems = token
    ? [
        { label: t('nav.home'), href: `/academy/${slug}` },
        { label: t('academy.nav.pricing'), href: '#pricing' },
        { label: t('nav.dashboard'), href: dashboardPath, route: true },
      ]
    : [
        { label: t('nav.home'), href: `/academy/${slug}`, route: true },
        { label: t('academy.nav.pricing'), href: '#pricing' },
        { label: t('nav.login'), href: `/auth/login?academy=${slug}`, route: true },
        { label: t('academy.joinNow'), href: `/auth/register?role=student&academy=${slug}`, route: true },
      ];

  return (
    <div className="min-h-screen pb-mobile-nav" style={style}>
      <header className="sticky top-0 z-50 border-b border-[var(--ce-border)] bg-[var(--ce-surface)]/85 backdrop-blur-xl">
        <div className="ce-container flex items-center justify-between gap-4 py-3">
          <Link to={`/academy/${slug}`} className="flex min-w-0 items-center gap-3">
            {tenant?.logoUrl ? (
              <img src={resolveMediaUrl(tenant.logoUrl)} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ce-primary)] text-sm font-extrabold text-white">
                {tenant?.name?.charAt(0)}
              </div>
            )}
            <div className="min-w-0 hidden sm:block">
              <div className="truncate text-lg font-extrabold text-[var(--ce-primary)]">{tenant?.name}</div>
              <div className="text-xs text-[var(--ce-muted)]">{t('academy.poweredBy')}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 text-sm font-semibold lg:flex">
            {sectionLinks.map((link) => (
              <a key={link.key} href={link.href} className="text-[var(--ce-text)] hover:text-[var(--ce-accent)]">
                {t(`academy.nav.${link.key}`)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {token ? (
              <Link to={dashboardPath} className="ce-btn ce-btn-primary hidden text-sm sm:inline-flex">
                {t('nav.dashboard')}
              </Link>
            ) : (
              <>
                <Link to={`/auth/login?academy=${slug}`} className="ce-btn ce-btn-ghost hidden text-sm sm:inline-flex">
                  {t('nav.login')}
                </Link>
                <Link to={`/auth/register?role=student&academy=${slug}`} className="ce-btn ce-btn-accent hidden text-sm sm:inline-flex">
                  {t('academy.joinNow')}
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
              <span className="truncate font-extrabold text-[var(--ce-primary)]">{tenant?.name}</span>
              <button type="button" className="ce-icon-btn" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-4 text-base font-semibold">
              {sectionLinks.map((link) => (
                <a key={link.key} href={link.href} onClick={() => setOpen(false)}>
                  {t(`academy.nav.${link.key}`)}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 pt-8">
              {token ? (
                <Link to={dashboardPath} className="ce-btn ce-btn-primary" onClick={() => setOpen(false)}>
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <>
                  <Link to={`/auth/login?academy=${slug}`} className="ce-btn ce-btn-ghost" onClick={() => setOpen(false)}>
                    {t('nav.login')}
                  </Link>
                  <Link to={`/auth/register?role=student&academy=${slug}`} className="ce-btn ce-btn-accent" onClick={() => setOpen(false)}>
                    {t('academy.joinNow')}
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {children}

      <footer className="border-t border-[var(--ce-border)] bg-[var(--ce-primary)] text-white">
        <div className="ce-container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="text-xl font-extrabold">{tenant?.name}</div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{page.footerText || t('academy.footerHint')}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/75 sm:flex sm:flex-wrap sm:gap-4">
            {footerLinks.length > 0 ? (
              footerLinks.map(renderFooterLink)
            ) : (
              <>
                <a href="#about">{t('academy.nav.about')}</a>
                <a href="#courses">{t('academy.nav.courses')}</a>
                <a href="#pricing">{t('academy.nav.pricing')}</a>
              </>
            )}
            <Link to="/" className="hover:text-[var(--ce-accent-soft)]">{t('brand.name')}</Link>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
