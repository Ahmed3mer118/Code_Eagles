import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  BadgeCheck,
  Building2,
  CircleCheck,
  CircleX,
  CreditCard,
  GraduationCap,
  Link2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Trophy,
  User,
} from 'lucide-react';
import AuthServices from '../../shared/api/authService';
import { getStoredTenant } from '../../shared/api/tenantContext';
import AcademySettingsEditor from './AcademySettingsEditor';
import AcademyUrlCard from '../../shared/ui/AcademyUrlCard';
import TenantFeaturesPanel from '../../shared/ui/TenantFeaturesPanel';
import FormField from '../../shared/ui/FormField';
import InfoGrid from '../../shared/ui/InfoGrid';
import StatusBadge from '../../shared/ui/StatusBadge';
import ContentLoader from '../../shared/ui/ContentLoader';


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

  if (loading) return <ContentLoader cards={0} rows={4} />;
  if (!profile) return null;

  const { user, tenant } = profile;
  const canEditAcademy = tenant && ['teacher', 'instructor'].includes(user.role);
  const isStudent = user.role === 'student';
  const profileLocked = isStudent && tenant?.studentPolicy?.allowProfileEdit === false;
  const canEditProfile = !profileLocked;
  const studentAcademy = isStudent ? getStoredTenant() || tenant : null;
  const roleLabel = t(`roles.${user.role}`, user.role);
  const initial = (user.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="ce-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 border-b border-[var(--ce-border)] bg-gradient-to-r from-[var(--ce-primary)] to-[var(--ce-primary-soft)] px-6 py-5 text-white">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-extrabold">{user.name}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                {roleLabel}
              </span>
            </p>
          </div>
          {canEditProfile && !editing && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/25"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              {t('common.edit')}
            </button>
          )}
        </div>

        <div className="p-6">
          <p className="text-sm text-[var(--ce-muted)]">{t('settings.accountHint')}</p>

          {!editing ? (
            <InfoGrid
              className="mt-5"
              items={[
                { icon: User, label: t('auth.name'), value: user.name },
                { icon: Phone, label: t('auth.phone'), value: user.phone_number },
                isStudent && { icon: GraduationCap, label: t('auth.gradeLevel'), value: user.gradeLevel },
                isStudent && studentAcademy && {
                  icon: Building2,
                  label: t('settings.academyName'),
                  value: studentAcademy.name,
                },
                { icon: Mail, label: t('auth.email'), value: user.email, wide: true },
                { icon: BadgeCheck, label: t('auth.role'), value: roleLabel },
                !isStudent && {
                  icon: Trophy,
                  label: t('dashboard.xpLevel'),
                  value: `${user.xp ?? 0} / ${user.level ?? 1}`,
                },
              ]}
            />
          ) : (
            <div className="mt-5 grid gap-1 md:grid-cols-2">
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
                <input className="ce-input" value={roleLabel} disabled readOnly />
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
      </div>

      {tenant && !isStudent && (
        <div className="ce-card p-6">
          <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.academy')}</h2>
          <InfoGrid
            className="mt-4"
            items={[
              { icon: Building2, label: t('settings.academyName'), value: tenant.name },
              { icon: Link2, label: t('settings.slug'), value: `/${tenant.slug || '—'}` },
              { icon: CreditCard, label: t('settings.plan'), value: tenant.plan },
              {
                icon: ShieldCheck,
                label: t('settings.status'),
                value: <StatusBadge status={tenant.status} label={t(`payments.planStatus.${tenant.status}`, tenant.status)} />,
              },
            ]}
          />
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
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              {
                allowed: tenant.studentPolicy.allowSelfJoin !== false,
                text: tenant.studentPolicy.allowSelfJoin === false
                  ? t('settings.restrictionsList.noSelfJoin')
                  : t('settings.restrictionsList.selfJoinAllowed'),
              },
              {
                allowed: tenant.studentPolicy.allowProfileEdit !== false,
                text: tenant.studentPolicy.allowProfileEdit === false
                  ? t('settings.restrictionsList.noProfileEdit')
                  : t('settings.restrictionsList.profileEditAllowed'),
              },
              {
                allowed: tenant.studentPolicy.allowPasswordReset !== false,
                text: tenant.studentPolicy.allowPasswordReset === false
                  ? t('settings.restrictionsList.noPasswordReset')
                  : t('settings.restrictionsList.passwordResetAllowed'),
              },
              {
                allowed: true,
                text: t('settings.restrictionsList.maxDevices', { count: tenant.studentPolicy.maxDevices || 3 }),
              },
            ].map(({ allowed, text }) => (
              <li
                key={text}
                className="flex items-start gap-2 rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-3 text-sm"
              >
                {allowed ? (
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                )}
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
