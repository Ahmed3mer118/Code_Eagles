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

  const load = async () => {
    try {
      const auth = new AuthServices();
      const data = await auth.me();
      setProfile(data);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [t]);

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;
  if (!profile) return null;

  const { user, tenant } = profile;
  const canEditAcademy = tenant && ['teacher', 'instructor'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="ce-card p-6">
        <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.account')}</h2>
        <dl className="mt-4 grid gap-3 md:grid-cols-2">
          <div><dt className="text-sm text-[var(--ce-muted)]">{t('auth.name')}</dt><dd className="font-bold">{user.name}</dd></div>
          <div><dt className="text-sm text-[var(--ce-muted)]">{t('auth.email')}</dt><dd className="font-bold">{user.email}</dd></div>
          <div><dt className="text-sm text-[var(--ce-muted)]">{t('auth.phone')}</dt><dd className="font-bold">{user.phone_number || '—'}</dd></div>
          <div><dt className="text-sm text-[var(--ce-muted)]">{t('auth.role')}</dt><dd className="font-bold">{user.role}</dd></div>
          {user.gradeLevel && (
            <div><dt className="text-sm text-[var(--ce-muted)]">{t('auth.gradeLevel')}</dt><dd className="font-bold">{user.gradeLevel}</dd></div>
          )}
          <div><dt className="text-sm text-[var(--ce-muted)]">XP / Level</dt><dd className="font-bold">{user.xp ?? 0} / {user.level ?? 1}</dd></div>
        </dl>
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
    </div>
  );
}
