import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { activityApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import ContentLoader from '../../shared/ui/ContentLoader';
import EmptyState from '../../shared/ui/EmptyState';
import SearchInput from '../../shared/ui/SearchInput';
import StatusBadge from '../../shared/ui/StatusBadge';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../shared/utils/apiError';

const ACTION_LABELS = {
  login: { ar: 'تسجيل دخول', en: 'Login' },
  join_request_created: { ar: 'طلب انضمام', en: 'Join request' },
  join_approved: { ar: 'موافقة انضمام', en: 'Join approved' },
  join_rejected: { ar: 'رفض انضمام', en: 'Join rejected' },
  payment_created: { ar: 'طلب دفع', en: 'Payment submitted' },
  payment_approved: { ar: 'موافقة دفع', en: 'Payment approved' },
  payment_rejected: { ar: 'رفض دفع', en: 'Payment rejected' },
  homework_graded: { ar: 'تقييم واجب', en: 'Homework graded' },
  link_request_created: { ar: 'طلب ربط', en: 'Link request' },
  link_request_approved: { ar: 'موافقة ربط', en: 'Link approved' },
  link_request_rejected: { ar: 'رفض ربط', en: 'Link rejected' },
  link_request_cancelled: { ar: 'إلغاء ربط', en: 'Link cancelled' },
};

function describeActivity(item, lang) {
  if (item.description?.[lang]) return item.description[lang];
  if (typeof item.description === 'string' && item.description) return item.description;
  const label = ACTION_LABELS[item.action]?.[lang];
  return label || item.action;
}

export default function ActivityCenterPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ q: '', action: '', page: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 20 };
      if (filters.q) params.q = filters.q;
      if (filters.action) params.action = filters.action;
      const data = await activityApi.listMine(params);
      setActivities(data.activities || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('activity.title')}
        subtitle={t('activity.subtitle')}
        icon={Activity}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={filters.q}
          onChange={(q) => setFilters((f) => ({ ...f, q, page: 1 }))}
          placeholder={t('activity.searchPlaceholder')}
          className="sm:max-w-xs"
        />
        <select
          value={filters.action}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">{t('activity.allTypes')}</option>
          {Object.entries(ACTION_LABELS).map(([key, labels]) => (
            <option key={key} value={key}>{labels[lang]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <ContentLoader />
      ) : activities.length === 0 ? (
        <EmptyState title={t('activity.empty')} hint={t('activity.emptyHint')} />
      ) : (
        <div className="space-y-3">
          {activities.map((item) => (
            <article
              key={item._id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{describeActivity(item, lang)}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.entityType && (
                <p className="mt-2 text-xs text-gray-400">
                  {item.entityType}
                  {item.metadata?.groupId ? ` · ${t('activity.group')}` : ''}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {t('common.prev')}
          </button>
          <span className="text-sm text-gray-500">
            {filters.page} / {pagination.pages}
          </span>
          <button
            type="button"
            disabled={filters.page >= pagination.pages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
}
