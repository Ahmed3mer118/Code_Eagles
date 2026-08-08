import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { groupApi, promoApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import FormModal from '../../shared/ui/FormModal';
import StatusBadge from '../../shared/ui/StatusBadge';

const emptyForm = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  usageLimit: '',
  expiryDate: '',
  status: 'active',
  applicableGroupIds: [],
};

export default function PromoCodesPage() {
  const { t } = useTranslation();
  const [promos, setPromos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [p, g] = await Promise.all([promoApi.list(), groupApi.list()]);
    setPromos(p.promoCodes || []);
    setGroups(g.groups || []);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err?.message || t('common.error')));
  }, [t]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (promo) => {
    setEditingId(promo._id);
    setForm({
      code: promo.code || '',
      discountType: promo.discountType || 'percentage',
      discountValue: promo.discountValue ?? 0,
      usageLimit: promo.usageLimit ?? '',
      expiryDate: promo.expiryDate ? promo.expiryDate.slice(0, 10) : '',
      status: promo.status || 'active',
      applicableGroupIds: (promo.applicableGroupIds || []).map((id) => String(id._id || id)),
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiryDate: form.expiryDate || null,
      };
      if (editingId) {
        await promoApi.update(editingId, payload);
      } else {
        await promoApi.create(payload);
      }
      toast.success(t('common.success'));
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const deactivate = async (id) => {
    try {
      await promoApi.remove(id);
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('promo.title')}
        subtitle={t('promo.subtitle')}
        actions={<button type="button" className="ce-btn ce-btn-accent" onClick={openCreate}>{t('promo.add')}</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {promos.map((promo) => (
          <article key={promo._id} className="ce-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{promo.code}</h3>
                <p className="mt-1 text-sm text-[var(--ce-muted)]">
                  {promo.discountType === 'percentage'
                    ? `${promo.discountValue}%`
                    : `${promo.discountValue} ${t('academy.currency')}`}
                </p>
              </div>
              <StatusBadge status={promo.status === 'active' ? 'approved' : 'pending'} label={promo.status} />
            </div>
            <p className="mt-3 text-xs text-[var(--ce-muted)]">
              {t('promo.used')}: {promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
            </p>
            {promo.expiryDate && (
              <p className="mt-1 text-xs text-[var(--ce-muted)]">
                {t('promo.expiryDate')}: {new Date(promo.expiryDate).toLocaleDateString()}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => openEdit(promo)}>
                {t('content.edit')}
              </button>
              {promo.status === 'active' && (
                <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => deactivate(promo._id)}>
                  {t('promo.deactivate')}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {!promos.length && <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('promo.empty')}</div>}

      <FormModal open={open} title={editingId ? t('promo.edit') : t('promo.add')} onClose={() => setOpen(false)} onSubmit={save}>
        <label className="block">
          <span className="ce-label">{t('promo.code')}</span>
          <input className="ce-input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        </label>
        <label className="block">
          <span className="ce-label">{t('promo.discountType')}</span>
          <select className="ce-input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="percentage">{t('promo.percentage')}</option>
            <option value="fixed">{t('promo.fixed')}</option>
          </select>
        </label>
        <label className="block">
          <span className="ce-label">{t('promo.discountValue')}</span>
          <input type="number" min="0" className="ce-input" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
        </label>
        <label className="block">
          <span className="ce-label">{t('promo.usageLimit')}</span>
          <input type="number" min="1" className="ce-input" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
        </label>
        <label className="block">
          <span className="ce-label">{t('promo.expiryDate')}</span>
          <input type="date" className="ce-input" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        </label>
        {editingId && (
          <label className="block">
            <span className="ce-label">{t('common.status')}</span>
            <select className="ce-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">{t('promo.statusActive')}</option>
              <option value="inactive">{t('promo.statusInactive')}</option>
            </select>
          </label>
        )}
        <label className="block">
          <span className="ce-label">{t('promo.groups')}</span>
          <select
            multiple
            className="ce-input min-h-[120px]"
            value={form.applicableGroupIds}
            onChange={(e) => setForm({ ...form, applicableGroupIds: [...e.target.selectedOptions].map((o) => o.value) })}
          >
            {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </label>
      </FormModal>
    </div>
  );
}
