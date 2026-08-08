import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  tenantApi,
  statsApi,
  subscriptionApi,
  FEATURE_KEYS,
} from '../../../shared/api/platformApi';
import SearchInput from '../../../shared/ui/SearchInput';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import { StatCards } from '../../../shared/ui/Charts';

const PLANS = ['free', 'starter', 'pro', 'enterprise'];

export default function TenantsPage() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    ownerEmail: '',
    ownerName: '',
    slug: '',
    plan: 'free',
  });

  const load = async (q = search) => {
    setLoading(true);
    try {
      const data = await tenantApi.listAll(q ? { q } : {});
      setTenants(data.tenants || []);
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
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openDetail = async (tenant) => {
    setSelected(tenant);
    try {
      const data = await tenantApi.getById(tenant._id);
      setDetail(data);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await tenantApi.create(form);
      toast.success(t('common.success'));
      setShowCreate(false);
      setForm({ name: '', ownerEmail: '', ownerName: '', slug: '', plan: 'free' });
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const toggleStatus = async (tenant, status) => {
    try {
      await tenantApi.updateStatus(tenant._id, status);
      toast.success(t('common.success'));
      load();
      if (selected?._id === tenant._id) openDetail(tenant);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const approve = async (tenant, approvalStatus) => {
    try {
      await tenantApi.approve(tenant._id, approvalStatus);
      toast.success(t('common.success'));
      load();
      if (selected?._id === tenant._id) openDetail(tenant);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const toggleFeature = async (key, value) => {
    if (!detail?.tenant) return;
    const features = { ...(detail.tenant.features || {}), [key]: value };
    try {
      const res = await tenantApi.updateFeatures(detail.tenant._id, features);
      setDetail({ ...detail, tenant: res.tenant });
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} />
        <button type="button" className="ce-btn ce-btn-accent" onClick={() => setShowCreate(!showCreate)}>
          {t('admin.createAcademy')}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={onCreate} className="ce-card grid gap-4 p-6 md:grid-cols-2">
          <input className="ce-input" placeholder={t('auth.academyName')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="ce-input" placeholder={t('auth.academySlug')} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <input className="ce-input" placeholder={t('admin.ownerEmail')} value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} required />
          <input className="ce-input" placeholder={t('admin.ownerName')} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          <select className="ce-input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button type="submit" className="ce-btn ce-btn-accent">{t('common.save')}</button>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="ce-card overflow-hidden">
          {loading ? (
            <p className="p-6 text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : (
            <ul className="divide-y divide-[var(--ce-border)]">
              {tenants.map((tenant) => (
                <li key={tenant._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <button type="button" className="text-start" onClick={() => openDetail(tenant)}>
                    <div className="font-bold text-[var(--ce-primary)]">{tenant.name}</div>
                    <div className="text-sm text-[var(--ce-muted)]">/{tenant.slug} · {tenant.plan} · {tenant.approvalStatus || 'pending'}</div>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {tenant.approvalStatus === 'pending' && (
                      <button type="button" className="ce-btn ce-btn-accent text-xs" onClick={() => approve(tenant, 'approved')}>{t('admin.approve')}</button>
                    )}
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => toggleStatus(tenant, tenant.status === 'active' ? 'suspended' : 'active')}>
                      {tenant.status === 'active' ? t('admin.suspend') : t('admin.activate')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detail && (
          <div className="ce-card space-y-4 p-6">
            <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{detail.tenant?.name}</h3>
            <p className="text-sm text-[var(--ce-muted)]">{detail.websiteUrl}</p>
            <StatCards
              items={[
                { label: t('dashboard.students'), value: detail.stats?.students },
                { label: t('dashboard.groups'), value: detail.stats?.groups },
                { label: t('dashboard.subjects'), value: detail.stats?.subjects },
                { label: t('dashboard.payments'), value: detail.stats?.pendingPayments },
              ]}
            />
            <div>
              <h4 className="mb-2 font-bold">{t('admin.features')}</h4>
              <div className="space-y-2">
                {FEATURE_KEYS.map((key) => (
                  <ToggleSwitch
                    key={key}
                    label={t(`features.${key}`)}
                    checked={detail.tenant?.features?.[key] !== false}
                    onChange={(v) => toggleFeature(key, v)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
