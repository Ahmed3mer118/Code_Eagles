import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Building2,
  CalendarClock,
  GraduationCap,
  Mail,
  Phone,
  User,
  Users,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { tenantApi, FEATURE_KEYS } from '../../../shared/api/platformApi';
import { formatSubscriptionExpiry } from '../../../shared/utils/subscriptionDays';
import SearchInput from '../../../shared/ui/SearchInput';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import FormModal from '../../../shared/ui/FormModal';
import FormField from '../../../shared/ui/FormField';
import { StatCards } from '../../../shared/ui/Charts';
import StatusBadge from '../../../shared/ui/StatusBadge';

const PLANS = ['free', 'starter', 'pro', 'enterprise'];

function OwnerDetails({ owner, compact = false }) {
  const { t } = useTranslation();
  if (!owner || typeof owner !== 'object') {
    return <p className="text-sm text-[var(--ce-muted)]">—</p>;
  }

  if (compact) {
    return (
      <div className="space-y-1 text-sm text-[var(--ce-muted)]">
        <p className="flex items-center gap-2 font-medium text-[var(--ce-primary)]">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{owner.name || '—'}</span>
        </p>
        {owner.email && (
          <p className="flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{owner.email}</span>
          </p>
        )}
        {owner.phone_number && (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span dir="ltr">{owner.phone_number}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <dl className="space-y-3 text-sm">
      <div>
        <dt className="text-[var(--ce-muted)]">{t('admin.ownerName')}</dt>
        <dd className="font-semibold">{owner.name || '—'}</dd>
      </div>
      <div>
        <dt className="text-[var(--ce-muted)]">{t('admin.ownerEmail')}</dt>
        <dd className="break-all font-semibold">{owner.email || '—'}</dd>
      </div>
      <div>
        <dt className="text-[var(--ce-muted)]">{t('admin.ownerPhone')}</dt>
        <dd className="font-semibold" dir="ltr">{owner.phone_number || '—'}</dd>
      </div>
    </dl>
  );
}

const emptyCreateForm = {
  name: '',
  ownerEmail: '',
  ownerName: '',
  plan: 'starter',
};

export default function TenantsPage() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [editingDetail, setEditingDetail] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

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
    setEditingDetail(false);
    try {
      const data = await tenantApi.getById(tenant._id);
      setDetail(data);
      setEditForm({
        name: data.tenant?.name || '',
        description: data.tenant?.description || '',
      });
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const saveEdit = async () => {
    if (!detail?.tenant) return;
    setSavingEdit(true);
    try {
      const res = await tenantApi.update(detail.tenant._id, editForm);
      setDetail({ ...detail, tenant: res.tenant });
      setEditingDetail(false);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSavingEdit(false);
    }
  };

  const onCreate = async (values) => {
    await tenantApi.create(values);
    toast.success(t('common.success'));
    load();
  };

  const toggleStatus = async (tenant, status, e) => {
    e?.stopPropagation?.();
    try {
      await tenantApi.updateStatus(tenant._id, status);
      toast.success(t('common.success'));
      load();
      if (selected?._id === tenant._id) openDetail(tenant);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const approve = async (tenant, approvalStatus, e) => {
    e?.stopPropagation?.();
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
        <SearchInput value={search} onChange={setSearch} placeholder={t('admin.searchAcademy')} />
        <button type="button" className="ce-btn ce-btn-accent" onClick={() => setShowCreate(true)}>
          {t('admin.createAcademy')}
        </button>
      </div>

      <FormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('admin.createAcademy')}
        initialValues={emptyCreateForm}
        onSubmit={onCreate}
        size="lg"
      >
        {({ values, setValues }) => (
          <div className="grid gap-1 md:grid-cols-2">
            <FormField label={t('auth.academyName')} helper={t('admin.fieldAcademyNameHint')} required>
              <input className="ce-input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
            </FormField>
            <FormField label={t('admin.ownerEmail')} helper={t('admin.fieldOwnerEmailHint')} required>
              <input type="email" className="ce-input" value={values.ownerEmail} onChange={(e) => setValues({ ...values, ownerEmail: e.target.value })} required />
            </FormField>
            <FormField label={t('admin.ownerName')} helper={t('admin.fieldOwnerNameHint')}>
              <input className="ce-input" value={values.ownerName} onChange={(e) => setValues({ ...values, ownerName: e.target.value })} />
            </FormField>
            <FormField label={t('settings.plan')} helper={t('admin.fieldPlanHint')}>
              <select className="ce-input" value={values.plan} onChange={(e) => setValues({ ...values, plan: e.target.value })}>
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>
          </div>
        )}
      </FormModal>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div>
          {loading ? (
            <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tenants.map((tenant) => (
                <button
                  key={tenant._id}
                  type="button"
                  onClick={() => openDetail(tenant)}
                  className={`ce-card p-5 text-start transition hover:shadow-md ${selected?._id === tenant._id ? 'ring-2 ring-[var(--ce-accent)]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ce-primary)]/10 text-[var(--ce-primary)]">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[var(--ce-primary)]">{tenant.name}</h3>
                        <p className="text-xs text-[var(--ce-muted)]">/{tenant.slug || t('admin.slugPending')}</p>
                      </div>
                    </div>
                    <StatusBadge status={tenant.approvalStatus === 'approved' ? 'approved' : 'pending'} label={tenant.approvalStatus || 'pending'} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--ce-muted)]">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>{tenant.studentCount ?? 0} {t('dashboard.students')}</span>
                      <span>·</span>
                      <span>{tenant.plan}</span>
                    </div>
                    <div className="rounded-xl bg-[var(--ce-bg)] p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('admin.academyOwner')}</p>
                      <OwnerDetails owner={tenant.ownerId} compact />
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
                      <span className={`font-semibold ${tenant.daysRemaining != null && tenant.daysRemaining <= 7 ? 'text-amber-700' : 'text-[var(--ce-primary)]'}`}>
                        {formatSubscriptionExpiry(tenant.activeSubscription?.expiresAt, t)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tenant.approvalStatus === 'pending' && (
                      <span
                        role="button"
                        tabIndex={0}
                        className="ce-btn ce-btn-accent text-xs"
                        onClick={(e) => approve(tenant, 'approved', e)}
                        onKeyDown={(e) => e.key === 'Enter' && approve(tenant, 'approved', e)}
                      >
                        {t('admin.approve')}
                      </span>
                    )}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ce-btn ce-btn-ghost text-xs"
                      onClick={(e) => toggleStatus(tenant, tenant.status === 'active' ? 'suspended' : 'active', e)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleStatus(tenant, tenant.status === 'active' ? 'suspended' : 'active', e)}
                    >
                      {tenant.status === 'active' ? t('admin.suspend') : t('admin.activate')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {detail && (
          <aside className="ce-card space-y-4 p-6 xl:sticky xl:top-4 xl:self-start">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{detail.tenant?.name}</h3>
                <p className="text-sm text-[var(--ce-muted)]">{detail.websiteUrl || t('admin.slugPending')}</p>
              </div>
              <StatusBadge status={detail.tenant?.approvalStatus === 'approved' ? 'approved' : 'pending'} label={detail.tenant?.approvalStatus} />
            </div>

            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('admin.academyOwner')}</p>
              <div className="mt-3">
                <OwnerDetails owner={detail.tenant?.ownerId} />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('admin.subscriptionStatus')}</p>
              <p className="mt-1 font-bold text-[var(--ce-primary)]">
                {formatSubscriptionExpiry(detail.activeSubscription?.expiresAt, t)}
              </p>
              {detail.activeSubscription?.plan && (
                <p className="mt-1 text-sm text-[var(--ce-muted)]">{detail.activeSubscription.plan} · {detail.activeSubscription.amount} {t('payments.currency')}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--ce-border)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-bold">{t('admin.editAcademy')}</h4>
                {!editingDetail ? (
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setEditingDetail(true)}>{t('common.edit')}</button>
                ) : (
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setEditingDetail(false)}>{t('common.cancel')}</button>
                )}
              </div>
              {!editingDetail ? (
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-[var(--ce-muted)]">{t('auth.academyName')}</dt><dd className="font-semibold">{editForm.name}</dd></div>
                  <div><dt className="text-[var(--ce-muted)]">{t('admin.description')}</dt><dd>{editForm.description || '—'}</dd></div>
                </dl>
              ) : (
                <>
                  <FormField label={t('auth.academyName')} helper={t('admin.fieldAcademyNameHint')}>
                    <input className="ce-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </FormField>
                  <FormField label={t('admin.description')} helper={t('admin.fieldDescriptionHint')}>
                    <textarea className="ce-input min-h-[70px]" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  </FormField>
                  <button type="button" className="ce-btn ce-btn-primary mt-2 w-full" onClick={saveEdit} disabled={savingEdit}>
                    {savingEdit ? t('common.loading') : t('common.save')}
                  </button>
                </>
              )}
            </div>

            <StatCards
              columns={2}
              items={[
                { label: t('dashboard.students'), value: detail.stats?.students, icon: GraduationCap, tone: 'accent' },
                { label: t('dashboard.groups'), value: detail.stats?.groups, icon: UsersRound },
                { label: t('dashboard.subjects'), value: detail.stats?.subjects, icon: BookOpen },
                { label: t('dashboard.payments'), value: detail.stats?.pendingPayments, icon: WalletCards, tone: 'info' },
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
          </aside>
        )}
      </div>
    </div>
  );
}
