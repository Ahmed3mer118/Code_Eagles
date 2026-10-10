import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../shared/api/authService';
import { extractApiError } from '../../shared/utils/apiError';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import { useI18n } from '../../shared/i18n';
import { useRoleLabel } from '../../shared/i18n/useRoleLabel';
import AuthLayout, { AuthAlert } from './AuthLayout';

export default function SelectTenantPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const roleLabel = useRoleLabel();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(null);
  const [error, setError] = useState('');

  const doSwitch = useCallback(
    async (tenantId) => {
      setSwitching(tenantId);
      setError('');
      try {
        await authService.switchTenant(tenantId);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(extractApiError(err).message);
        setSwitching(null);
      }
    },
    [navigate],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await authService.me();

        if (me.needsOnboarding) {
          navigate('/onboarding', { replace: true });
          return;
        }

        const list =
          me.memberships?.length > 0
            ? me.memberships
            : me.currentTenant
              ? [me.currentTenant]
              : [];

        if (list.length === 0) {
          navigate('/onboarding', { replace: true });
          return;
        }

        if (list.length === 1) {
          await doSwitch(list[0].tenantId);
          return;
        }

        if (mounted) setMemberships(list);
      } catch (err) {
        if (mounted) setError(extractApiError(err).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [doSwitch, navigate]);

  if (loading) return <LoadingScreen label={t('tenant.loading')} />;

  return (
    <AuthLayout
      title={t('tenant.selectTitle')}
      subtitle={t('tenant.selectSubtitle')}
    >
      <AuthAlert>{error}</AuthAlert>

      <div className="space-y-3">
        {memberships.map((m, idx) => {
          const initials = (m.tenantName || m.tenantId || '?')
            .charAt(0)
            .toUpperCase();
          const isSwitching = switching === m.tenantId;

          return (
            <button
              key={m.tenantId}
              onClick={() => doSwitch(m.tenantId)}
              disabled={isSwitching}
              className="group w-full flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-[#e8eefb] hover:to-[#dde7fa] border border-slate-200/70 rounded-2xl transition-all duration-200 disabled:opacity-60 text-start hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={`w-12 h-12 rounded-xl text-white font-bold flex items-center justify-center shrink-0 shadow-md transition-all ${
                  idx % 2 === 0
                    ? 'bg-gradient-to-br from-[#1a3a5c] to-[#0f2744] shadow-[#1a3a5c]/20'
                    : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20'
                }`}
              >
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 mb-0.5 truncate">
                  {m.tenantName || m.tenantId}
                </div>
                <div className="text-xs text-slate-500">
                  {t('tenant.role')}:{' '}
                  <span className="font-medium text-slate-600">
                    {roleLabel(m.role)}
                  </span>
                </div>
              </div>

              <span className="text-[#1a3a5c] font-semibold text-sm shrink-0 flex items-center gap-1 group-hover:gap-2 transition-all">
                {isSwitching ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <>
                    {t('tenant.enter')}
                    <svg
                      className="w-4 h-4 rtl:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </AuthLayout>
  );
}