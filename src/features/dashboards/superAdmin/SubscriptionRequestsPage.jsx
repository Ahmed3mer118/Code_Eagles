import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Bell, CalendarClock, CreditCard, Mail } from 'lucide-react';
import { subscriptionApi } from '../../../shared/api/platformApi';
import { formatSubscriptionExpiry } from '../../../shared/utils/subscriptionDays';
import SearchInput from '../../../shared/ui/SearchInput';
import StatusBadge from '../../../shared/ui/StatusBadge';
import PageHeader from '../../../shared/ui/PageHeader';
import ReceiptViewer from '../../../shared/ui/ReceiptViewer';
import EmptyState from '../../../shared/ui/EmptyState';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

export default function SubscriptionRequestsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [reminding, setReminding] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const statusCounts = useMemo(
    () =>
      STATUS_FILTERS.reduce((acc, key) => {
        acc[key] = key === 'all' ? items.length : items.filter((item) => item.status === key).length;
        return acc;
      }, {}),
    [items]
  );

  const visibleRequests = useMemo(
    () => (statusFilter === 'all' ? items : items.filter((item) => item.status === statusFilter)),
    [items, statusFilter]
  );

  const pendingCount = statusCounts.pending || 0;

  const load = async () => {
    try {
      const subs = await subscriptionApi.list(search ? { q: search } : {});
      setItems(subs.subscriptions || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const review = async (id, status) => {
    try {
      await subscriptionApi.review(id, { status });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const sendReminder = async (id) => {
    setReminding(id);
    try {
      await subscriptionApi.sendReminder(id);
      toast.success(t('admin.reminderSent'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setReminding('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.subscriptionRequests')}
        subtitle={t('admin.subscriptionRequestsHint')}
        icon={CreditCard}
        actions={
          pendingCount > 0 ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">
              {t('admin.pendingRequestsCount', { count: pendingCount })}
            </span>
          ) : null
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder={t('admin.searchAcademy')} />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              statusFilter === key
                ? 'border-[var(--ce-primary)] bg-[var(--ce-primary)] text-white'
                : 'border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-muted)] hover:border-[var(--ce-primary)]/40'
            }`}
          >
            {key === 'all' ? t('payments.allStatuses') : t(`payments.status.${key}`)}
            <span
              className={`rounded-full px-2 text-xs font-bold ${
                statusFilter === key ? 'bg-white/20' : 'bg-[var(--ce-bg)]'
              }`}
            >
              {statusCounts[key] || 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
      ) : visibleRequests.length === 0 ? (
        <EmptyState icon={CreditCard} title={t('admin.noTeacherRequests')} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleRequests.map((item) => (
            <article key={item._id} className="ce-card overflow-hidden">
              <div className="border-b border-[var(--ce-border)] bg-[var(--ce-bg)] px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-[var(--ce-primary)]">
                      {item.academyName || item.tenantId?.name || t('admin.unknownAcademy')}
                    </h3>
                    {item.tenantId?.slug && (
                      <p className="mt-0.5 text-xs text-[var(--ce-muted)]">{item.tenantId.slug}</p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ce-muted)]">
                      <Mail className="h-3.5 w-3.5" />
                      {item.tenantId?.ownerId?.email || item.recordedBy?.email || '—'}
                    </p>
                  </div>
                  <StatusBadge status={item.status} label={t(`payments.status.${item.status}`)} />
                </div>
              </div>

              <div className="space-y-3 p-5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--ce-accent)]" />
                  <span className="font-semibold">{item.plan}</span>
                  <span className="text-[var(--ce-muted)]">
                    · {(item.amountDue ?? item.amount)} {t('payments.currency')}
                  </span>
                  {item.requestType && (
                    <StatusBadge
                      status={item.requestType === 'upgrade' ? 'pending' : 'approved'}
                      label={t(`admin.requestType.${item.requestType}`, item.requestType)}
                    />
                  )}
                </div>

                {item.previousPlan && item.previousPlan !== item.plan && (
                  <p className="rounded-xl bg-[var(--ce-bg)] px-3 py-2 text-xs text-[var(--ce-muted)]">
                    {t('admin.planChangeFrom', { from: item.previousPlan, to: item.plan })}
                    {(item.amountDue ?? item.amount) > 0 && item.requestType === 'upgrade' && (
                      <span className="ms-1 font-semibold text-[var(--ce-primary)]">
                        · {t('platformSub.upgradeDifference')}
                      </span>
                    )}
                  </p>
                )}

                {item.periodMode && item.status === 'pending' && (
                  <p className="text-xs text-[var(--ce-muted)]">
                    {t('admin.periodModeLabel')}: {t(`admin.periodMode.${item.periodMode}`)}
                  </p>
                )}

                {item.status === 'approved' && item.expiresAt && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900">
                    <CalendarClock className="h-4 w-4" />
                    {formatSubscriptionExpiry(item.expiresAt, t)}
                  </div>
                )}

                {item.status === 'pending' && item.tenantActiveDaysRemaining != null && (
                  <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-900">
                    {t('admin.currentSubDaysLeft', { days: item.tenantActiveDaysRemaining })}
                  </div>
                )}

                {item.receiptImageUrl ? (
                  <>
                    <ReceiptViewer url={item.receiptImageUrl} />
                    {item.receiptUploadedAt && (
                      <p className="text-xs text-[var(--ce-muted)]">
                        {t('admin.receiptUploadedAt')}:{' '}
                        {new Date(item.receiptUploadedAt).toLocaleString(lang === 'en' ? 'en-GB' : 'ar-EG')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">{t('admin.noReceiptYet')}</p>
                )}

                {item.lastReminderAt && (
                  <p className="text-xs text-[var(--ce-muted)]">
                    {t('admin.lastReminder')}: {new Date(item.lastReminderAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[var(--ce-border)] px-5 py-4">
                {(item.status === 'pending' || (item.status === 'approved' && item.daysRemaining != null && item.daysRemaining <= 14)) && (
                  <button
                    type="button"
                    className="ce-btn ce-btn-ghost inline-flex items-center gap-1 text-xs"
                    onClick={() => sendReminder(item._id)}
                    disabled={reminding === item._id}
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {reminding === item._id ? t('common.loading') : t('admin.sendReminder')}
                  </button>
                )}
                {item.status === 'pending' && (
                  <>
                    <button type="button" className="ce-btn ce-btn-accent text-xs" onClick={() => review(item._id, 'approved')}>
                      {t('payments.approve')}
                    </button>
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => review(item._id, 'rejected')}>
                      {t('payments.reject')}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
