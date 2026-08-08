import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import AcademySettingsEditor from './AcademySettingsEditor';
import AcademyUrlCard from '../../shared/ui/AcademyUrlCard';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="ce-card p-6">
        <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.account')}</h2>
        <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('settings.accountHint')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="ce-label">{t('auth.name')}</span>
            <input className="ce-input" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} disabled={profileLocked} />
          </label>
          <label className="block">
            <span className="ce-label">{t('auth.phone')}</span>
            <input className="ce-input" value={accountForm.phone_number} onChange={(e) => setAccountForm({ ...accountForm, phone_number: e.target.value })} disabled={profileLocked} />
          </label>
          {isStudent && (
            <label className="block">
              <span className="ce-label">{t('auth.gradeLevel')}</span>
              <input className="ce-input" value={accountForm.gradeLevel} onChange={(e) => setAccountForm({ ...accountForm, gradeLevel: e.target.value })} disabled={profileLocked} />
            </label>
          )}
          {isStudent && tenant && (
            <label className="block md:col-span-2">
              <span className="ce-label">{t('settings.academyName')}</span>
              <input className="ce-input" value={tenant.name || '—'} disabled readOnly />
            </label>
          )}
          <label className="block md:col-span-2">
            <span className="ce-label">{t('auth.email')}</span>
            <input className="ce-input" value={user.email} disabled readOnly />
          </label>
          <label className="block">
            <span className="ce-label">{t('auth.role')}</span>
            <input className="ce-input" value={user.role} disabled readOnly />
          </label>
          {!isStudent && (
            <div>
              <span className="ce-label">XP / Level</span>
              <p className="mt-2 font-bold">{user.xp ?? 0} / {user.level ?? 1}</p>
            </div>
          )}
          {!profileLocked && (
            <button type="button" className="ce-btn ce-btn-primary md:col-span-2" onClick={saveProfile} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </button>
          )}
        </div>
      </div>

      {tenant && (
        <div className="ce-card p-6">
          <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.academy')}</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            <div><dt className="text-sm text-[var(--ce-muted)]">{t('settings.academyName')}</dt><dd className="font-bold">{tenant.name}</dd></div>
            <div><dt className="text-sm text-[var(--ce-muted)]">{t('settings.slug')}</dt><dd className="font-bold">/{tenant.slug}</dd></div>
            <div><dt className="text-sm text-[var(--ce-muted)]">{t('settings.plan')}</dt><dd className="font-bold">{tenant.plan}</dd></div>
            <div><dt className="text-sm text-[var(--ce-muted)]">{t('settings.status')}</dt><dd className="font-bold">{tenant.status}</dd></div>
          </dl>
        </div>
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
