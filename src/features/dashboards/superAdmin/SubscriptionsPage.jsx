import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { subscriptionApi, tenantApi } from '../../../shared/api/platformApi';
import SearchInput from '../../../shared/ui/SearchInput';

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ tenantId: '', plan: 'starter', amount: 500, periodMonths: 1, method: 'bank_transfer' });

  const load = async () => {
    try {
      const [subs, tenantRes] = await Promise.all([
        subscriptionApi.list(search ? { q: search } : {}),
        tenantApi.listAll(),
      ]);
      setItems(subs.subscriptions || []);
      setTenants(tenantRes.tenants || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await subscriptionApi.create(form);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const review = async (id, status) => {
    try {
      await subscriptionApi.review(id, { status });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <SearchInput value={search} onChange={setSearch} placeholder={t('admin.searchAcademy')} />

      <form onSubmit={onCreate} className="ce-card grid gap-4 p-6 md:grid-cols-3">
        <select className="ce-input" value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} required>
          <option value="">{t('admin.selectAcademy')}</option>
          {tenants.map((tn) => <option key={tn._id} value={tn._id}>{tn.name}</option>)}
        </select>
        <input className="ce-input" type="number" placeholder={t('payments.amount')} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        <select className="ce-input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
          {['starter', 'pro', 'enterprise'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="submit" className="ce-btn ce-btn-accent md:col-span-3">{t('admin.recordPayment')}</button>
      </form>

      <div className="ce-card overflow-hidden">
        <ul className="divide-y divide-[var(--ce-border)]">
          {items.map((item) => (
            <li key={item._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <div className="font-bold">{item.tenantId?.name}</div>
                <div className="text-sm text-[var(--ce-muted)]">{item.plan} · {item.amount} ج.م · {item.status}</div>
              </div>
              {item.status === 'pending' && (
                <div className="flex gap-2">
                  <button type="button" className="ce-btn ce-btn-accent text-xs" onClick={() => review(item._id, 'approved')}>{t('payments.approve')}</button>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => review(item._id, 'rejected')}>{t('payments.reject')}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
