import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <div className="ce-card max-w-lg p-10">
        <div className="text-6xl font-extrabold text-[var(--ce-accent)]">404</div>
        <h1 className="mt-4 text-2xl font-extrabold text-[var(--ce-primary)]">
          {t('common.error')}
        </h1>
        <p className="mt-3 text-[var(--ce-muted)]">{t('dashboard.moduleHint')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="ce-btn ce-btn-primary">
            {t('nav.home')}
          </Link>
          <Link to="/contact" className="ce-btn ce-btn-ghost">
            {t('nav.contact')}
          </Link>
        </div>
      </div>
    </div>
  );
}
