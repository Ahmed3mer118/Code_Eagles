import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { paymentApi } from '../../shared/api/platformApi';
import ReceiptViewer from '../../shared/ui/ReceiptViewer';

export default function PaymentReviewPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await paymentApi.listPending();
      setItems(data.paymentRequests || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id, status) => {
    try {
      await paymentApi.review(id, { status });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="ce-card p-6">
        <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('dashboard.payments')}</h2>
        <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('payments.reviewHint')}</p>
      </div>

      {loading ? (
        <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <div className="ce-card p-6 text-[var(--ce-muted)]">{t('payments.noPending')}</div>
      ) : (
        items.map((item) => (
          <div key={item._id} className="ce-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-bold text-[var(--ce-primary)]">
                  {item.studentId?.name || item.studentId}
                </div>
                <div className="text-sm text-[var(--ce-muted)]">
                  {item.packageType} · {item.amount} EGP · {item.status}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="ce-btn ce-btn-accent text-sm" onClick={() => review(item._id, 'approved')}>
                  {t('payments.approve')}
                </button>
                <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => review(item._id, 'rejected')}>
                  {t('payments.reject')}
                </button>
              </div>
            </div>
            <ReceiptViewer url={item.receiptImageUrl} variant="link" className="mt-3" />
          </div>
        ))
      )}
    </div>
  );
}
