import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { paymentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import ReceiptViewer from '../../shared/ui/ReceiptViewer';
import EmptyState from '../../shared/ui/EmptyState';
import ContentLoader from '../../shared/ui/ContentLoader';
import { CreditCard } from 'lucide-react';

export default function ParentPaymentsPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await paymentApi.listMine();
        setPayments(data.paymentRequests || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) return <ContentLoader cards={2} rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.payments')} subtitle={t('parent.paymentsSubtitle')} />

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title={t('payments.noHistory')} description={t('parent.noChildrenHint')} />
      ) : (
        <div className="space-y-4">
          {payments.map((item) => (
            <article key={item._id} className="ce-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[var(--ce-primary)]">{item.studentId?.name || '—'}</p>
                  <p className="mt-1 text-sm text-[var(--ce-muted)]">
                    {item.enrollmentId?.groupId?.name || item.planName || '—'}
                  </p>
                </div>
                <StatusBadge
                  status={item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending'}
                  label={t(`payments.status.${item.status}`, item.status)}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="font-bold">{item.amount} {t('payments.currency')}</span>
                <span className="text-[var(--ce-muted)]">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              {item.receiptImageUrl && (
                <div className="mt-4">
                  <ReceiptViewer url={item.receiptImageUrl} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
