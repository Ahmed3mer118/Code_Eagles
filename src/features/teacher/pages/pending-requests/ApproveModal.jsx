// src/features/teacher/pages/pending-requests/ApproveModal.jsx
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ApproveModal({
  open,
  onClose,
  onSubmit,
  loading,
  enrollment,
}) {
  const [form, setForm] = useState({ startDate: '', endDate: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ startDate: '', endDate: '', notes: '' });
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const student = enrollment?.student || enrollment?.user || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      setError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }

    const payload = {};
    if (form.startDate)
      payload.startDate = new Date(form.startDate).toISOString();
    if (form.endDate)
      payload.endDate = new Date(form.endDate).toISOString();
    if (form.notes.trim()) payload.notes = form.notes.trim();

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              الموافقة على الطلب
            </h3>
            <p className="text-xs text-gray-500">
              {student.name || 'طالب'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                تاريخ البداية (اختياري)
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                تاريخ النهاية (اختياري)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="ملاحظات إضافية للطالب..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'جاري الموافقة...' : 'موافقة على الطلب'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
