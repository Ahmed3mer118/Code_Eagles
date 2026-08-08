import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { groupApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import StatusBadge from '../../shared/ui/StatusBadge';
import Modal from '../../shared/ui/Modal';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import { getFriendlyError } from '../../shared/ui/FormField';

export default function PendingJoinRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await groupApi.listPendingAll();
      setRequests(data.enrollments || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const review = async (item, status, reason = '') => {
    setActing(item._id);
    try {
      await groupApi.reviewEnrollment(item.group?._id || item.groupId?._id, item._id, {
        status,
        rejectionReason: reason,
      });
      toast.success(status === 'active' ? t('requests.approvedSuccess') : t('requests.rejectedSuccess'));
      setRejectModal(null);
      setRejectReason('');
      setDetail(null);
      load();
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setActing(null);
    }
  };

  const filtered = filterByQuery(
    requests.map((r) => ({ ...r, _searchName: r.student?.name || r.studentId?.name })),
    search,
    ['_searchName']
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('requests.title')}
        subtitle={t('requests.subtitle')}
        actions={<span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">{requests.length} {t('requests.pending')}</span>}
      />

      <SearchInput value={search} onChange={setSearch} placeholder={t('requests.searchStudent')} />

      {loading ? (
        <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon="✅" title={t('requests.empty')} description={t('requests.emptyDesc')} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <article key={item._id} className="ce-card p-5">
              <div className="flex gap-4">
                <img
                  src={item.student?.profilePicture}
                  alt=""
                  className="h-14 w-14 rounded-full border border-[var(--ce-border)] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-[var(--ce-primary)]">{item.student?.name}</h3>
                  <p className="text-sm text-[var(--ce-muted)]">{item.group?.name} · {item.group?.subject}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <StatusBadge status="pending" label={t('student.status.pending')} />
                    <span className="rounded-full bg-[var(--ce-bg)] px-2 py-1">{item.packageLabel}</span>
                  </div>
                </div>
              </div>

              <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                <div><dt className="text-[var(--ce-muted)]">{t('auth.phone')}</dt><dd className="font-semibold">{item.student?.phone_number || '—'}</dd></div>
                <div><dt className="text-[var(--ce-muted)]">{t('requests.parentPhone')}</dt><dd className="font-semibold">{item.student?.parentPhone || '—'}</dd></div>
                <div><dt className="text-[var(--ce-muted)]">{t('requests.requestDate')}</dt><dd className="font-semibold">{new Date(item.requestDate || item.createdAt).toLocaleDateString()}</dd></div>
                <div><dt className="text-[var(--ce-muted)]">{t('requests.paymentStatus')}</dt><dd className="font-semibold">{t(`requests.payment.${item.paymentStatus}`, item.paymentStatus)}</dd></div>
              </dl>

              {item.notes && <p className="mt-3 rounded-lg bg-[var(--ce-bg)] p-3 text-sm">{item.notes}</p>}

              {item.receiptImageUrl && (
                <a href={item.receiptImageUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-[var(--ce-primary)] underline">
                  {t('payments.viewReceipt')}
                </a>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => setDetail(item)}>{t('requests.viewDetails')}</button>
                <button type="button" className="ce-btn ce-btn-accent text-sm" disabled={acting === item._id} onClick={() => review(item, 'active')}>
                  {acting === item._id ? t('common.loading') : t('payments.approve')}
                </button>
                <button type="button" className="ce-btn ce-btn-ghost text-sm" disabled={acting === item._id} onClick={() => setRejectModal(item)}>
                  {t('payments.reject')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={t('requests.viewDetails')} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={detail.student?.profilePicture} alt="" className="h-16 w-16 rounded-full" />
              <div>
                <div className="text-xl font-extrabold">{detail.student?.name}</div>
                <div className="text-sm text-[var(--ce-muted)]">{detail.student?.email}</div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <p><strong>{t('groups.name')}:</strong> {detail.group?.name}</p>
              <p><strong>{t('content.subjectName')}:</strong> {detail.group?.subject}</p>
              <p><strong>{t('auth.phone')}:</strong> {detail.student?.phone_number}</p>
              <p><strong>{t('requests.parentPhone')}:</strong> {detail.student?.parentPhone || '—'}</p>
              <p><strong>{t('payments.package')}:</strong> {detail.packageLabel}</p>
              <p><strong>{t('requests.paymentStatus')}:</strong> {detail.paymentStatus}</p>
            </div>
            {detail.receiptImageUrl && (
              <img src={detail.receiptImageUrl} alt="" className="max-h-64 rounded-xl border border-[var(--ce-border)] object-contain" />
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectReason(''); }}
        title={t('requests.rejectTitle')}
        footer={(
          <>
            <button type="button" className="ce-btn ce-btn-ghost" onClick={() => setRejectModal(null)}>{t('common.cancel')}</button>
            <button type="button" className="ce-btn bg-[var(--ce-danger)] text-white" disabled={acting} onClick={() => review(rejectModal, 'cancelled', rejectReason)}>
              {t('payments.reject')}
            </button>
          </>
        )}
      >
        <p className="mb-3 text-sm text-[var(--ce-muted)]">{t('requests.rejectHint')}</p>
        <textarea className="ce-input min-h-[100px]" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={t('requests.rejectReason')} />
      </Modal>
    </div>
  );
}
