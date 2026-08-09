import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';
import AuthServices from '../../shared/api/authService';
import { getStoredTenant } from '../../shared/api/tenantContext';
import AcademySettingsEditor from './AcademySettingsEditor';
import AcademyUrlCard from '../../shared/ui/AcademyUrlCard';
import TenantFeaturesPanel from '../../shared/ui/TenantFeaturesPanel';
import FormField from '../../shared/ui/FormField';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', phone_number: '', gradeLevel: '' });

  const load = async () => {
    try {
      const auth = new AuthServices();
      const data = await auth.me();
      setProfile(data);
      setAccountForm({
        name: data.user?.name || '',
        phone_number: data.user?.phone_number || '',
        gradeLevel: data.user?.gradeLevel || '',
      });
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [t]);

  const cancelEdit = () => {
    setEditing(false);
    setAccountForm({
      name: profile?.user?.name || '',
      phone_number: profile?.user?.phone_number || '',
      gradeLevel: profile?.user?.gradeLevel || '',
    });
  };

  const saveProfile = async () => {
    if (profile?.user?.role === 'student' && profile?.tenant?.studentPolicy?.allowProfileEdit === false) {
      toast.error(t('settings.restrictionsList.noProfileEdit'));
      return;
    }
    setSaving(true);
    try {
      const auth = new AuthServices();
      const payload = {
        name: accountForm.name,
        phone_number: accountForm.phone_number,
      };
      if (profile?.user?.role === 'student') payload.gradeLevel = accountForm.gradeLevel;
      const data = await auth.updateProfile(payload);
      localStorage.setItem('ce_user_name', data.user?.name || accountForm.name);
      setProfile((prev) => ({ ...prev, user: { ...prev.user, ...data.user } }));
      setEditing(false);
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;
  if (!profile) return null;

  const { user, tenant } = profile;
  const canEditAcademy = tenant && ['teacher', 'instructor'].includes(user.role);
  const isStudent = user.role === 'student';
  const profileLocked = isStudent && tenant?.studentPolicy?.allowProfileEdit === false;
  const canEditProfile = !profileLocked;
  const studentAcademy = isStudent ? getStoredTenant() || tenant : null;

  return (
    <div className="space-y-6">
      <div className="ce-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.account')}</h2>
            <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('settings.accountHint')}</p>
          </div>
          {canEditProfile && !editing && (
            <button type="button" className="ce-btn ce-btn-ghost inline-flex items-center gap-2 text-sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
              {t('common.edit')}
            </button>
          )}
        </div>

        {!editing ? (
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('auth.name')}</dt>
              <dd className="mt-1 text-lg font-bold text-[var(--ce-primary)]">{user.name}</dd>
            </div>
            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('auth.phone')}</dt>
              <dd className="mt-1 text-lg font-bold text-[var(--ce-primary)]">{user.phone_number}</dd>
            </div>
            {isStudent && (
              <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('auth.gradeLevel')}</dt>
                <dd className="mt-1 text-lg font-bold text-[var(--ce-primary)]">{user.gradeLevel || '—'}</dd>
              </div>
            )}
            {isStudent && studentAcademy && (
              <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4 md:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('settings.academyName')}</dt>
                <dd className="mt-1 text-lg font-bold text-[var(--ce-primary)]">{studentAcademy.name}</dd>
              </div>
            )}
            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4 md:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('auth.email')}</dt>
              <dd className="mt-1 font-semibold text-[var(--ce-primary)]">{user.email}</dd>
            </div>
            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">{t('auth.role')}</dt>
              <dd className="mt-1 font-semibold capitalize">{user.role}</dd>
            </div>
            {!isStudent && (
              <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">XP / Level</dt>
                <dd className="mt-1 font-bold">{user.xp ?? 0} / {user.level ?? 1}</dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="mt-6 grid gap-1 md:grid-cols-2">
            <FormField label={t('auth.name')} helper={t('settings.fieldNameHint')}>
              <input className="ce-input" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} />
            </FormField>
            <FormField label={t('auth.phone')} helper={t('settings.fieldPhoneHint')}>
              <input className="ce-input" value={accountForm.phone_number} onChange={(e) => setAccountForm({ ...accountForm, phone_number: e.target.value })} />
            </FormField>
            {isStudent && (
              <FormField label={t('auth.gradeLevel')} helper={t('settings.fieldGradeHint')}>
                <input className="ce-input" value={accountForm.gradeLevel} onChange={(e) => setAccountForm({ ...accountForm, gradeLevel: e.target.value })} />
              </FormField>
            )}
            <FormField label={t('auth.email')} helper={t('settings.fieldEmailHint')}>
              <input className="ce-input" value={user.email} disabled readOnly />
            </FormField>
            <FormField label={t('auth.role')} helper={t('settings.fieldRoleHint')}>
              <input className="ce-input" value={user.role} disabled readOnly />
            </FormField>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button type="button" className="ce-btn ce-btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? t('common.loading') : t('common.save')}
              </button>
              <button type="button" className="ce-btn ce-btn-ghost" onClick={cancelEdit} disabled={saving}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {tenant && !isStudent && (
        <div className="ce-card p-6">
          <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.academy')}</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-[var(--ce-bg)] p-4"><dt className="text-sm text-[var(--ce-muted)]">{t('settings.academyName')}</dt><dd className="font-bold">{tenant.name}</dd></div>
            <div className="rounded-xl bg-[var(--ce-bg)] p-4"><dt className="text-sm text-[var(--ce-muted)]">{t('settings.slug')}</dt><dd className="font-bold">/{tenant.slug || '—'}</dd></div>
            <div className="rounded-xl bg-[var(--ce-bg)] p-4"><dt className="text-sm text-[var(--ce-muted)]">{t('settings.plan')}</dt><dd className="font-bold">{tenant.plan}</dd></div>
            <div className="rounded-xl bg-[var(--ce-bg)] p-4"><dt className="text-sm text-[var(--ce-muted)]">{t('settings.status')}</dt><dd className="font-bold">{tenant.status}</dd></div>
          </dl>
        </div>
      )}

      {isStudent && studentAcademy?.slug && (
        <AcademyUrlCard slug={studentAcademy.slug} />
      )}

      {tenant && !isStudent && (
        <TenantFeaturesPanel features={tenant.features} />
      )}

      {tenant && canEditAcademy && (
        <div className="space-y-4">
          <AcademyUrlCard slug={tenant.slug} />
          <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.academyEditor')}</h2>
          <AcademySettingsEditor tenant={tenant} onSaved={(updated) => setProfile((prev) => ({ ...prev, tenant: updated }))} />
        </div>
      )}

      {isStudent && tenant?.studentPolicy && (
        <div className="ce-card p-6">
          <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.restrictions')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{tenant.studentPolicy.allowSelfJoin === false ? t('settings.restrictionsList.noSelfJoin') : t('settings.restrictionsList.selfJoinAllowed')}</li>
            <li>{tenant.studentPolicy.allowProfileEdit === false ? t('settings.restrictionsList.noProfileEdit') : t('settings.restrictionsList.profileEditAllowed')}</li>
            <li>{tenant.studentPolicy.allowPasswordReset === false ? t('settings.restrictionsList.noPasswordReset') : t('settings.restrictionsList.passwordResetAllowed')}</li>
            <li>{t('settings.restrictionsList.maxDevices', { count: tenant.studentPolicy.maxDevices || 3 })}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
