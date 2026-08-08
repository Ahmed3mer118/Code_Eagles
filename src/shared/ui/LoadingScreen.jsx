import { useTranslation } from 'react-i18next';

export default function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--ce-border)] border-t-[var(--ce-accent)]" />
        <p className="font-semibold text-[var(--ce-muted)]">{t('common.loading')}</p>
      </div>
    </div>
  );
}
