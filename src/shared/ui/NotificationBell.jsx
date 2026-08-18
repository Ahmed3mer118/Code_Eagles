import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { notificationApi, parentApi } from '../api/platformApi';
import AuthServices from '../api/authService';

function pickLocalized(value, lang) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.ar || value.en || '';
}

export default function NotificationBell({ notificationsPath = '/dashboard/student/notifications' }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const auth = new AuthServices();
  const role = auth.getRole();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = role === 'parent'
        ? await parentApi.notifications()
        : await notificationApi.listMine();
      setItems((data.notifications || []).slice(0, 8));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    try {
      if (role === 'parent') {
        await parentApi.markNotificationRead(id);
      } else {
        await notificationApi.markRead(id);
      }
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        className="relative rounded-xl border border-[var(--ce-border)] p-2 text-[var(--ce-primary)] transition hover:bg-[var(--ce-bg)]"
        aria-label={t('notifications.title')}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ce-accent)] px-1 text-[10px] font-bold text-[var(--ce-primary)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--ce-border)] bg-white shadow-xl">
          <div className="border-b px-4 py-3">
            <p className="font-bold text-[var(--ce-primary)]">{t('notifications.title')}</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[var(--ce-muted)]">{t('notifications.empty')}</p>
            ) : (
              items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => markRead(item._id)}
                  className={`block w-full border-b px-4 py-3 text-start transition hover:bg-[var(--ce-bg)] ${!item.read ? 'bg-amber-50/50' : ''}`}
                >
                  <p className="text-sm font-semibold text-[var(--ce-primary)]">{pickLocalized(item.title, lang)}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ce-muted)]">{pickLocalized(item.body, lang)}</p>
                </button>
              ))
            )}
          </div>
          <div className="border-t px-4 py-2 text-center">
            <Link
              to={notificationsPath}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-[var(--ce-accent)] hover:underline"
            >
              {t('notifications.viewAll')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
