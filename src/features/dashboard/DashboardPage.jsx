import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../shared/api/authService';
import { clearAuth } from '../../shared/api/client';
import { extractApiError } from '../../shared/utils/apiError';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import { useI18n } from '../../shared/i18n';
import { useRoleLabel } from '../../shared/i18n/useRoleLabel';
import LanguageSwitcher from '../../shared/ui/LanguageSwitcher';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const roleLabel = useRoleLabel();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await authService.me();
        if (mounted) setMe(data);
      } catch (err) {
        if (mounted) setError(extractApiError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onLogout = async () => {
    await authService.logout();
    navigate('/login', { replace: true });
  };

  const onSwitchTenant = () => {
    clearAuth();
    navigate('/select-tenant', { replace: true });
  };

  if (loading) return <LoadingScreen label={t('dashboard.loading')} />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {t('dashboard.errorTitle')}
          </h2>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={onLogout}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {t('dashboard.logout')}
          </button>
        </div>
      </div>
    );
  }

  const role = me?.currentTenant?.role || me?.user?.platformRole || 'user';
  const tenantName = me?.currentTenant?.tenantName || '—';
  const userName = me?.user?.name || '';
  const membershipsCount = me?.memberships?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/LOGO.png" alt="Logo" className="w-9 h-9" />
            <div>
              <div className="font-bold text-slate-800">{tenantName}</div>
              <div className="text-xs text-slate-500">
                {roleLabel(role)} — Code Eagles
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {membershipsCount > 1 && (
              <button
                onClick={onSwitchTenant}
                className="text-sm px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                {t('dashboard.switchTenant')}
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-sm px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              {t('dashboard.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-l from-indigo-600 to-indigo-500 text-white rounded-2xl p-8 shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcomeRole', { role: roleLabel(role) })}
          </h1>
          <p className="text-indigo-100 text-lg">
            {t('dashboard.youAreIn', { name: userName, tenant: tenantName })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InfoCard
            label={t('dashboard.currentRole')}
            value={roleLabel(role)}
            icon="🎭"
          />
          <InfoCard
            label={t('dashboard.academy')}
            value={tenantName}
            icon="🏫"
          />
          <InfoCard
            label={t('dashboard.membershipsCount')}
            value={String(membershipsCount || 1)}
            icon="👥"
          />
        </div>

        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            {t('dashboard.comingSoonTitle')}
          </h2>
          <p className="text-slate-500 text-sm">
            {t('dashboard.comingSoonText')}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            {t('dashboard.role')}: <span className="font-mono">{role}</span>{' '}
            | {t('dashboard.tenant')}:{' '}
            <span className="font-mono">{me?.currentTenant?.tenantId || '—'}</span>
          </p>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 mb-1">{label}</div>
        <div className="font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}