// src/features/landing/components/LandingHeader.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useI18n } from '../../../shared/i18n';
import { platformApi } from '../../../lib/platformApi';
import { onLiveUpdate } from '../../../shared/utils/liveUpdates';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function siteText(site, key, lang) {
  const val = site?.[key];
  if (val == null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] ?? val.ar ?? val.en ?? null;
  return null;
}

function resolveImage(url) {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_URL}${url}`;
}

export default function LandingHeader() {
  const { lang, setLang } = useI18n();
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [site, setSite] = useState({});

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ce-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await platformApi.getSiteContent();
        if (mounted) setSite(res || {});
      } catch (err) {
        console.error('Landing header site load error:', err);
      }
    };

    load();

    const unsubscribe = onLiveUpdate(() => load());
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60_000);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  const txt = (key) => siteText(site, key, lang);

  const logoUrl = txt('landing.header.logoUrl');
  const brandName = txt('landing.header.brandName');
  const homePath = txt('landing.links.home') ?? '/';
  const loginPath = txt('landing.links.login') ?? '/login';
  const registerPath = txt('landing.links.register') ?? '/register';
  const contactPath = txt('landing.links.contact') ?? '/contact';

  const navFeatures = txt('landing.nav.features');
  const navAcademies = txt('landing.nav.academies');
  const navContact = txt('landing.nav.contact');
  const navLogin = txt('landing.nav.login');
  const navRegister = txt('landing.nav.register');
  const mobileHome = txt('landing.mobileNav.home');
  const mobileAcademies = txt('landing.mobileNav.academies');
  const mobileLogin = txt('landing.mobileNav.login');

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--ce-border)] bg-[var(--ce-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to={homePath} className="flex min-w-0 shrink-0 items-center gap-3">
            {logoUrl && (
              <img
                src={resolveImage(logoUrl)}
                alt={brandName ?? ''}
                className="h-11 w-11 rounded-2xl object-contain"
                width="44"
                height="44"
              />
            )}
            {brandName && (
              <div className="hidden min-w-0 lg:block">
                <div className="truncate text-lg font-extrabold tracking-tight text-[var(--ce-text)]">
                  {brandName}
                </div>
              </div>
            )}
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--ce-text)] lg:flex">
            {navFeatures && (
              <a href="#features" className="transition hover:text-[var(--ce-accent)]">
                {navFeatures}
              </a>
            )}
            {navAcademies && (
              <a href="#academies" className="transition hover:text-[var(--ce-accent)]">
                {navAcademies}
              </a>
            )}
            {navContact && (
              <Link to={contactPath} className="transition hover:text-[var(--ce-accent)]">
                {navContact}
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-text)] transition hover:bg-[var(--ce-accent)] hover:text-white"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div
              className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] p-1 text-sm"
              role="group"
              aria-label="Language"
            >
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  lang === 'ar'
                    ? 'bg-[var(--ce-brand)] text-white'
                    : 'text-[var(--ce-muted)] hover:text-[var(--ce-text)]'
                }`}
                aria-pressed={lang === 'ar'}
              >
                ع
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  lang === 'en'
                    ? 'bg-[var(--ce-brand)] text-white'
                    : 'text-[var(--ce-muted)] hover:text-[var(--ce-text)]'
                }`}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>

            {navLogin && (
              <Link
                to={loginPath}
                className="rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] px-4 py-2 text-sm font-semibold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
              >
                {navLogin}
              </Link>
            )}

            {navRegister && (
              <Link
                to={registerPath}
                className="rounded-full bg-[var(--ce-accent)] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[var(--ce-accent)]/20 transition hover:opacity-90"
              >
                {navRegister}
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[var(--ce-border)] bg-[var(--ce-surface)] px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navFeatures && (
                <a
                  href="#features"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ce-text)] hover:bg-[var(--ce-bg)]"
                >
                  {navFeatures}
                </a>
              )}
              {navAcademies && (
                <a
                  href="#academies"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ce-text)] hover:bg-[var(--ce-bg)]"
                >
                  {navAcademies}
                </a>
              )}
              {navContact && (
                <Link
                  to={contactPath}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ce-text)] hover:bg-[var(--ce-bg)]"
                >
                  {navContact}
                </Link>
              )}

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--ce-border)] pt-3">
                <div className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] p-1 text-sm">
                  <button
                    type="button"
                    onClick={() => setLang('ar')}
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      lang === 'ar' ? 'bg-[var(--ce-brand)] text-white' : 'text-[var(--ce-muted)]'
                    }`}
                  >
                    ع
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      lang === 'en' ? 'bg-[var(--ce-brand)] text-white' : 'text-[var(--ce-muted)]'
                    }`}
                  >
                    EN
                  </button>
                </div>
                <div className="flex gap-2">
                  {navLogin && (
                    <Link
                      to={loginPath}
                      className="rounded-full border border-[var(--ce-border)] px-4 py-2 text-sm font-semibold text-[var(--ce-text)]"
                    >
                      {navLogin}
                    </Link>
                  )}
                  {navRegister && (
                    <Link
                      to={registerPath}
                      className="rounded-full bg-[var(--ce-accent)] px-4 py-2 text-sm font-bold text-white"
                    >
                      {navRegister}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ce-border)] bg-[var(--ce-surface)] lg:hidden">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {mobileHome && (
            <Link
              to={homePath}
              className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
            >
              {mobileHome}
            </Link>
          )}
          {mobileAcademies && (
            <a
              href="#academies"
              className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
            >
              {mobileAcademies}
            </a>
          )}
          {mobileLogin && (
            <Link
              to={loginPath}
              className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
            >
              {mobileLogin}
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
