import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { parentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function ParentNotificationsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await parentApi.notifications();
      setItems(data.notifications || data.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [t]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.notificationsTitle')} subtitle={t('parent.notificationsSubtitle')} />

      {!items.length ? (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('parent.noNotifications')}</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item._id} className={`ce-card p-5 ${item.read ? 'opacity-80' : 'ring-1 ring-[var(--ce-accent)]/40'}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-bold text-[var(--ce-primary)]">
                  {item.title?.[lang] || item.title || item.type || t('parent.notification')}
                </h3>
                <time className="text-xs text-[var(--ce-muted)]">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                </time>
              </div>
              <p className="mt-2 text-sm text-[var(--ce-muted)]">
                {item.body?.[lang] || item.body || item.message || '—'}
              </p>
              {item.meta?.studentName && (
                <p className="mt-2 text-xs font-semibold text-[var(--ce-primary)]">
                  {t('parent.child')}: {item.meta.studentName}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
