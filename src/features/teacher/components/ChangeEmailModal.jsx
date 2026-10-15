// src/features/teacher/components/ChangeEmailModal.jsx
import { useState } from 'react';
import userService from '../../../shared/api/userService';

export default function ChangeEmailModal({
  open,
  onClose,
  currentEmail,
  onSuccess,
}) {
  const [step, setStep] = useState('request'); // request | verify
  const [form, setForm] = useState({ newEmail: '', password: '' });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => {
    setStep('request');
    setForm({ newEmail: '', password: '' });
    setToken('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await userService.requestEmailChange(form);
      setStep('verify');
      setSuccess('تم إرسال رمز التحقق إلى بريدك الجديد');
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await userService.verifyEmailChange({ token });
      setSuccess('تم تغيير البريد الإلكتروني بنجاح ✅');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'رمز غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold mb-1">
          تغيير البريد الإلكتروني
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          الحالي: {currentEmail}
        </p>

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 p-2 bg-green-50 text-green-600 text-sm rounded-lg">
            {success}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-3">
            <input
              type="email"
              required
              placeholder="البريد الإلكتروني الجديد"
              value={form.newEmail}
              onChange={(e) =>
                setForm({ ...form, newEmail: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              required
              placeholder="كلمة المرور الحالية"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الرمز'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              type="text"
              required
              placeholder="أدخل رمز التحقق"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm text-center tracking-widest focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'تأكيد'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
