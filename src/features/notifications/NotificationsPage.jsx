import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { notificationApi, parentApi } from '../../shared/api/platformApi';
import AuthServices from '../../shared/api/authService';
import PageHeader from '../../shared/ui/PageHeader';
import ContentLoader from '../../shared/ui/ContentLoader';
import EmptyState from '../../shared/ui/EmptyState';
import { getApiErrorMessage } from '../../shared/utils/apiError';

function pickLocalized(value, lang) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.ar || value.en || '';
}

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const role = new AuthServices().getRole();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = role === 'parent'
        ? await parentApi.notifications()
        : await notificationApi.listMine();
      setNotifications(data.notifications || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [role, t]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    try {
      if (role === 'parent') {
        await parentApi.markNotificationRead(id);
      } else {
        await notificationApi.markRead(id);
      }
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const markAllRead = async () => {
    try {
      if (role !== 'parent') await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        icon={Bell}
        actions={notifications.some((n) => !n.read) ? (
          <button type="button" onClick={markAllRead} className="ce-btn ce-btn-ghost text-sm">
            {t('notifications.markAllRead')}
          </button>
        ) : null}
      />

      {loading ? (
        <ContentLoader />
      ) : notifications.length === 0 ? (
        <EmptyState title={t('notifications.empty')} hint={t('notifications.emptyHint')} />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <article
              key={item._id}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${!item.read ? 'ring-1 ring-[var(--ce-accent)]' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--ce-primary)]">{pickLocalized(item.title, lang)}</p>
                  <p className="mt-1 text-sm text-[var(--ce-muted)]">{pickLocalized(item.body, lang)}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markRead(item._id)}
                    className="shrink-0 text-xs font-semibold text-[var(--ce-accent)]"
                  >
                    {t('notifications.markRead')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
