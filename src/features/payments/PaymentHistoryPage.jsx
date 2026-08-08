import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { paymentPlanApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import StatusBadge from '../../shared/ui/StatusBadge';

export default function PaymentHistoryPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await paymentPlanApi.history(status ? { status } : {});
      setPayments(data.payments || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const filtered = useMemo(
    () => filterByQuery(payments, search, ['planName', 'notes']).filter((p) => {
      const studentName = p.studentId?.name || '';
      return !search || studentName.toLowerCase().includes(search.toLowerCase()) || filterByQuery([p], search, ['planName']).length;
    }),
    [payments, search]
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t('payments.historyTitle')} subtitle={t('payments.historyHint')} />

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} className="min-w-[220px] flex-1" />
        <select className="ce-input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('payments.allStatuses')}</option>
          <option value="pending">{t('payments.status.pending')}</option>
          <option value="approved">{t('payments.status.approved')}</option>
          <option value="rejected">{t('payments.status.rejected')}</option>
          <option value="under_review">{t('payments.status.under_review')}</option>
        </select>
      </div>

      {loading ? (
        <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('payments.noHistory')}</div>
      ) : (
        <div className="ce-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-[var(--ce-bg)] text-start">
                <tr>
                  <th className="px-4 py-3 font-bold">{t('dashboard.students')}</th>
                  <th className="px-4 py-3 font-bold">{t('payments.planName')}</th>
                  <th className="px-4 py-3 font-bold">{t('payments.amount')}</th>
                  <th className="px-4 py-3 font-bold">{t('payments.method')}</th>
                  <th className="px-4 py-3 font-bold">{t('settings.status')}</th>
                  <th className="px-4 py-3 font-bold">{t('payments.paymentDate')}</th>
                  <th className="px-4 py-3 font-bold">{t('payments.receipt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ce-border)]">
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 font-semibold">{item.studentId?.name || '—'}</td>
                    <td className="px-4 py-3">{item.planName || item.packageType}</td>
                    <td className="px-4 py-3 font-bold">{item.amount} {t('academy.currency')}</td>
                    <td className="px-4 py-3">{t(`payments.methods.${item.method}`, item.method)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'cancelled' : 'pending'}
                        label={t(`payments.status.${item.status}`, item.status)}
                      />
                    </td>
                    <td className="px-4 py-3 text-[var(--ce-muted)]">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {item.receiptImageUrl ? (
                        <a href={item.receiptImageUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--ce-primary)]">
                          {t('payments.viewReceipt')}
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
