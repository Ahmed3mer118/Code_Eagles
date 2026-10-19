// src/features/superadmin/pages/settings/SecurityPage.jsx
import { useState } from 'react';
import userService from '../../../../shared/api/userService';
import { useAdminSessions } from '../../hooks/useAdminSessions';
import { useI18n } from '../../../../shared/i18n';

export default function SecurityPage() {
  const { t } = useI18n();

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const {
    sessions,
    loginHistory,
    loading: sessionsLoading,
    revokeSession,
    revokeAllSessions,
  } = useAdminSessions();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: t('admin.security.passwordMismatch') });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: t('admin.security.passwordTooShort') });
      return;
    }

    setPwLoading(true);
    try {
      await userService.changePassword(pwForm);
      setPwMsg({ type: 'success', text: t('admin.security.passwordChanged') });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err?.response?.data?.message || t('admin.security.passwordChangeError'),
      });
    } finally {
      setPwLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return '-';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-4">
          🔐 {t('admin.security.changePasswordTitle')}
        </h2>

        {pwMsg && (
          <div
            className={`mb-3 p-2 rounded-lg text-sm ${
              pwMsg.type === 'success'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <input
            type="password"
            required
            placeholder={t('admin.security.currentPassword')}
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="password"
            required
            placeholder={t('admin.security.newPassword')}
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="password"
            required
            placeholder={t('admin.security.confirmPassword')}
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={pwLoading}
            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {pwLoading ? t('admin.security.updating') : t('admin.security.updatePassword')}
          </button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            🖥️ {t('admin.security.sessionsTitle')}
          </h2>
          {sessions.length > 1 && (
            <button
              onClick={revokeAllSessions}
              className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              {t('admin.security.revokeAll')}
            </button>
          )}
        </div>

        {sessionsLoading ? (
          <p className="text-sm text-gray-400">{t('admin.security.loading')}</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400">{t('admin.security.noSessions')}</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {s.device || s.userAgent || t('admin.security.unknownDevice')}
                    {s.isCurrent && (
                      <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        {t('admin.security.currentSession')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.ipAddress || '-'} • {formatDate(s.lastActiveAt)}
                  </p>
                </div>
                {!s.isCurrent && (
                  <button
                    onClick={() => revokeSession(s.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    {t('admin.security.revoke')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Login History */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-4">
          📜 {t('admin.security.historyTitle')}
        </h2>
        {loginHistory.length === 0 ? (
          <p className="text-sm text-gray-400">{t('admin.security.noHistory')}</p>
        ) : (
          <div className="space-y-2">
            {loginHistory.map((h, i) => (
              <div
                key={h.id || i}
                className="flex justify-between text-sm py-2 border-b last:border-0"
              >
                <span>{h.device || h.userAgent || t('admin.security.unknownDevice')}</span>
                <span className="text-gray-500 text-xs">{formatDate(h.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
