// src/features/assistant/pages/AssistantSecurityTab.jsx
import { useState } from 'react';
import userService from '../../../shared/api/userService';
import { Shield, Key } from 'lucide-react';

export default function AssistantSecurityTab() {
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
      return;
    }

    setPwLoading(true);
    try {
      await userService.changePassword(pwForm);
      setPwMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح ✅' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى',
      });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-3">
          <Shield className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          تغيير كلمة المرور
        </h2>
        <p className="text-sm text-gray-500 mt-1">حافظ على أمان حسابك</p>
      </div>

      {pwMsg && (
        <div
          className={`p-3 rounded-lg text-sm text-center ${
            pwMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {pwMsg.text}
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            كلمة المرور الحالية
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, currentPassword: e.target.value })
              }
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <Key
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            كلمة المرور الجديدة
          </label>
          <input
            type="password"
            required
            value={pwForm.newPassword}
            onChange={(e) =>
              setPwForm({ ...pwForm, newPassword: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            تأكيد كلمة المرور
          </label>
          <input
            type="password"
            required
            value={pwForm.confirmPassword}
            onChange={(e) =>
              setPwForm({ ...pwForm, confirmPassword: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={pwLoading}
          className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {pwLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
        </button>
      </form>
    </div>
  );
}
