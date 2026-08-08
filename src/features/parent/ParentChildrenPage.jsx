import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { parentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function ParentChildrenPage() {
  const { t } = useTranslation();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await parentApi.listChildren();
        setChildren(data.children || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const openChild = async (child) => {
    setSelected(child);
    setOverview(null);
    try {
      const data = await parentApi.childOverview(child.student._id);
      setOverview(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.childrenTitle')} subtitle={t('parent.childrenSubtitle')} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children.map((item) => (
          <button
            key={item.linkId}
            type="button"
            onClick={() => openChild(item)}
            className={`ce-card ce-card-hover p-5 text-start ${selected?.linkId === item.linkId ? 'ring-2 ring-[var(--ce-accent)]' : ''}`}
          >
            <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{item.student?.name}</h3>
            <p className="mt-1 text-sm text-[var(--ce-muted)]">{item.academy?.name}</p>
            <p className="mt-2 text-xs text-[var(--ce-muted)]">{item.student?.gradeLevel || '—'}</p>
          </button>
        ))}
      </div>

      {!children.length && (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('parent.noChildren')}</div>
      )}

      {selected && overview && (
        <div className="ce-card space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{overview.student?.name}</h2>
              <p className="text-sm text-[var(--ce-muted)]">{t('parent.childProfile')}</p>
            </div>
            <Link to="/dashboard/parent/payments" className="ce-btn ce-btn-ghost text-sm">
              {t('dashboard.payments')}
            </Link>
          </div>

          <section>
            <h3 className="font-bold text-[var(--ce-primary)]">{t('parent.enrollments')}</h3>
            <div className="mt-3 space-y-2">
              {(overview.enrollments || []).map((en) => (
                <div key={en._id} className="flex items-center justify-between rounded-xl bg-[var(--ce-bg)] p-3 text-sm">
                  <span>{en.groupId?.name} — {en.groupId?.subjectId?.name}</span>
                  <StatusBadge status={en.status === 'active' ? 'approved' : 'pending'} label={en.status} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-[var(--ce-primary)]">{t('parent.examResults')}</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-[var(--ce-bg)]">
                  <tr>
                    <th className="px-3 py-2 text-start">{t('quizzes.title')}</th>
                    <th className="px-3 py-2 text-start">{t('quizzes.score')}</th>
                    <th className="px-3 py-2 text-start">{t('requests.requestDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ce-border)]">
                  {(overview.examResults || []).map((row) => (
                    <tr key={row._id}>
                      <td className="px-3 py-2">{row.quiz?.title || '—'}</td>
                      <td className="px-3 py-2 font-bold">
                        {row.score}/{row.maxScore} ({row.percentage}%)
                      </td>
                      <td className="px-3 py-2 text-[var(--ce-muted)]">
                        {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-[var(--ce-primary)]">{t('parent.payments')}</h3>
            <div className="mt-3 space-y-4">
              {(overview.paymentByEnrollment || []).map((row) => (
                <div key={row.enrollment._id} className="rounded-xl border border-[var(--ce-border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{row.group?.name}</p>
                      <p className="text-xs text-[var(--ce-muted)]">{row.subject?.name}</p>
                    </div>
                    {row.payment ? (
                      <StatusBadge
                        status={row.payment.status === 'approved' ? 'approved' : row.payment.status === 'rejected' ? 'rejected' : 'pending'}
                        label={t(`payments.status.${row.payment.status}`, row.payment.status)}
                      />
                    ) : (
                      <span className="text-xs text-[var(--ce-muted)]">{t('parent.noPayment')}</span>
                    )}
                  </div>
                  {row.payment && (
                    <p className="mt-2 text-sm">{row.payment.amount} {t('academy.currency')}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
