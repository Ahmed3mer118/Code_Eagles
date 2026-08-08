import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAcademyPublicUrl } from '../utils/academyUrl';

export default function AcademyUrlCard({ slug }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const url = getAcademyPublicUrl(slug);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('settings.urlCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (!slug) return null;

  return (
    <div className="ce-card p-6">
      <h3 className="font-extrabold text-[var(--ce-primary)]">{t('settings.publicUrl')}</h3>
      <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('settings.publicUrlHint')}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="flex-1 break-all rounded-xl bg-[var(--ce-bg)] px-4 py-3 text-sm font-semibold text-[var(--ce-primary)]">
          {url}
        </code>
        <div className="flex gap-2">
          <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={copy}>
            <Copy className="h-4 w-4" />
            {copied ? t('settings.copied') : t('settings.copyLink')}
          </button>
          <Link to={`/academy/${slug}`} target="_blank" rel="noreferrer" className="ce-btn ce-btn-accent text-sm">
            <ExternalLink className="h-4 w-4" />
            {t('settings.openAcademy')}
          </Link>
        </div>
      </div>
    </div>
  );
}
