import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useI18n } from '../../../shared/i18n';

export default function LandingHeader() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ce-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--ce-border)] bg-[var(--ce-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* ============ Logo ============ */}
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <img
              src="/images/LOGO.png"
              alt="Code Eagles"
              className="h-11 w-11 rounded-2xl object-contain"
              width="44"
              height="44"
            />
            <div className="hidden min-w-0 lg:block">
              <div className="truncate text-lg font-extrabold tracking-tight text-[var(--ce-text)]">
                Code Eagles
              </div>
            </div>
          </Link>

          {/* ============ Desktop Nav ============ */}
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--ce-text)] lg:flex">
            <a href="#features" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.features')}
            </a>
            <a href="#academies" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.academies')}
            </a>
            <a href="#categories" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.categories')}
            </a>
            <Link to="/contact" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.contact')}
            </Link>
          </nav>

          {/* ============ Desktop Actions ============ */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-text)] transition hover:bg-[var(--ce-accent)] hover:text-white"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* ✅ Language switch — مربوط بالـ I18nContext */}
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

            {/* Login */}
            <Link
              to="/auth/login"
              className="rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] px-4 py-2 text-sm font-semibold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
            >
              {t('landing.nav.login')}
            </Link>

            {/* Register */}
            <Link
              to="/auth/register"
              className="rounded-full bg-[var(--ce-accent)] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[var(--ce-accent)]/20 transition hover:opacity-90"
            >
              {t('landing.nav.register')}
            </Link>
          </div>

          {/* ============ Mobile Menu Button ============ */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="border-t border-[var(--ce-border)] bg-[var(--ce-surface)] px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ce-text)] hover:bg-[var(--ce-bg)]"
              >
                {t('landing.nav.features')}
              </a>
              <a
                href="#academies"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ce-text)] hover:bg-[var(--ce-bg)]"
              >
                {t('landing.nav.academies')}
              </a>
              <a
                href="#categories"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ce-text)] hover:bg-[var(--ce-bg)]"
              >
                {t('landing.nav.categories')}
              </a>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ce-text)] hover:bg-[var(--ce-bg)]"
              >
                {t('landing.nav.contact')}
              </Link>

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
                  <Link
                    to="/auth/login"
                    className="rounded-full border border-[var(--ce-border)] px-4 py-2 text-sm font-semibold text-[var(--ce-text)]"
                  >
                    {t('landing.nav.login')}
                  </Link>
                  <Link
                    to="/auth/register"
                    className="rounded-full bg-[var(--ce-accent)] px-4 py-2 text-sm font-bold text-white"
                  >
                    {t('landing.nav.register')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============ Mobile Bottom Nav ============ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ce-border)] bg-[var(--ce-surface)] lg:hidden">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <Link
            to="/"
            className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
          >
            {t('landing.mobileNav.home')}
          </Link>
          <a
            href="#academies"
            className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
          >
            {t('landing.mobileNav.academies')}
          </a>
          <Link
            to="/contact"
            className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
          >
            {t('landing.mobileNav.contact')}
          </Link>
          <Link
            to="/auth/login"
            className="rounded-xl px-2 py-2 text-center text-[11px] font-bold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
          >
            {t('landing.mobileNav.login')}
          </Link>
        </div>
      </nav>
    </>
  );
}