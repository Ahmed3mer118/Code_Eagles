// src/features/teacher/pages/settings/SecurityPage.jsx
import { useState } from 'react';
import userService from '../../../../shared/api/userService';
import { useTeacherSessions } from '../../hooks/useTeacherSessions';

export default function SecurityPage() {
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
  } = useTeacherSessions();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    if (pwForm.newPassword.length < 8) {
      setPwMsg({
        type: 'error',
        text: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      });
      return;
    }

    setPwLoading(true);
    try {
      await userService.changePassword(pwForm);
      setPwMsg({
        type: 'success',
        text: 'تم تغيير كلمة المرور بنجاح ✅',
      });
      setPwForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى',
      });
    } finally {
      setPwLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleString('ar-EG');
    } catch {
      return '-';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ===== Change Password ===== */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-4">تغيير كلمة المرور</h2>

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

        <form
          onSubmit={handleChangePassword}
          className="space-y-3 max-w-md"
        >
          <input
            type="password"
            required
            placeholder="كلمة المرور الحالية"
            value={pwForm.currentPassword}
            onChange={(e) =>
              setPwForm({
                ...pwForm,
                currentPassword: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            required
            placeholder="كلمة المرور الجديدة"
            value={pwForm.newPassword}
            onChange={(e) =>
              setPwForm({ ...pwForm, newPassword: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            required
            placeholder="تأكيد كلمة المرور"
            value={pwForm.confirmPassword}
            onChange={(e) =>
              setPwForm({
                ...pwForm,
                confirmPassword: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={pwLoading}
            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {pwLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
          </button>
        </form>
      </div>

      {/* ===== Active Sessions ===== */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">الجلسات النشطة</h2>
          {sessions.length > 1 && (
            <button
              onClick={revokeAllSessions}
              className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              إنهاء كل الجلسات
            </button>
          )}
        </div>

        {sessionsLoading ? (
          <p className="text-sm text-gray-400">جاري التحميل...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-400">لا توجد جلسات نشطة</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {s.device || s.userAgent || 'جهاز غير معروف'}
                    {s.isCurrent && (
                      <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        الحالية
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
                    إنهاء
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Login History ===== */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-4">سجل تسجيل الدخول</h2>
        {loginHistory.length === 0 ? (
          <p className="text-sm text-gray-400">لا يوجد سجل</p>
        ) : (
          <div className="space-y-2">
            {loginHistory.map((h, i) => (
              <div
                key={h.id || i}
                className="flex justify-between text-sm py-2 border-b last:border-0"
              >
                <span>{h.device || h.userAgent || 'جهاز غير معروف'}</span>
                <span className="text-gray-500 text-xs">
                  {formatDate(h.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Danger Zone ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
        <h2 className="text-lg font-bold text-red-600 mb-2">
          منطقة الخطر
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          حذف الحساب سيؤدي إلى إزالة كل بياناتك نهائياً ولا يمكن التراجع
        </p>
        <button
          onClick={async () => {
            if (
              window.confirm(
                'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.',
              )
            ) {
              try {
                await userService.deleteMyAccount();
                localStorage.clear();
                window.location.href = '/';
              } catch (err) {
                alert(
                  err?.response?.data?.message || 'فشل حذف الحساب',
                );
              }
            }
          }}
          className="px-6 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
        >
          حذف الحساب
        </button>
      </div>
    </div>
  );
}
