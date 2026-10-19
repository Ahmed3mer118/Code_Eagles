// src/features/teacher/pages/points/AddPointsModal.jsx
import { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import StudentPicker from './StudentPicker';

const SOURCE_OPTIONS = [
  { value: '', label: 'بدون مصدر' },
  { value: 'manual', label: 'يدوي' },
  { value: 'attendance', label: 'حضور' },
  { value: 'assignment', label: 'واجب' },
  { value: 'quiz', label: 'اختبار' },
  { value: 'participation', label: 'مشاركة' },
];

export default function AddPointsModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    studentIds: [],
    points: 10,
    reason: '',
    source: 'manual',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        studentIds: [],
        points: 10,
        reason: '',
        source: 'manual',
      });
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const isDeduct = Number(form.points) < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.studentIds || form.studentIds.length === 0) {
      setError('اختر طالب واحد على الأقل');
      return;
    }
    const pts = Number(form.points);
    if (!Number.isFinite(pts) || pts === 0) {
      setError('عدد النقاط لا يمكن أن يكون صفر');
      return;
    }
    if (!form.reason.trim()) {
      setError('السبب مطلوب');
      return;
    }
    if (form.reason.length > 200) {
      setError('السبب يجب أن يكون أقل من 200 حرف');
      return;
    }

    await onSubmit({
      studentIds: form.studentIds,
      points: pts,
      reason: form.reason.trim(),
      source: form.source || undefined,
    });
  };

  const toggleSign = () => {
    setForm((f) => ({ ...f, points: -Number(f.points) || -10 }));
  };

  const setPreset = (n) => {
    setForm((f) => ({
      ...f,
      points: isDeduct ? -Math.abs(n) : Math.abs(n),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDeduct
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-emerald-50 dark:bg-emerald-900/20'
            }`}
          >
            {isDeduct ? (
              <Minus className="text-red-600" size={20} />
            ) : (
              <Plus className="text-emerald-600" size={20} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isDeduct ? 'خصم نقاط' : 'إضافة نقاط'}
            </h3>
            <p className="text-xs text-gray-500">
              {isDeduct
                ? 'سيتم خصم النقاط من الطلاب المختارين'
                : 'سيتم إضافة النقاط للطلاب المختارين'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, points: Math.abs(Number(f.points)) || 10 }))}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition ${
                !isDeduct
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Plus size={16} /> إضافة
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, points: -Math.abs(Number(f.points)) || -10 }))}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition ${
                isDeduct
                  ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Minus size={16} /> خصم
            </button>
          </div>

          {/* Students picker */}
          <StudentPicker
            selectedIds={form.studentIds}
            onChange={(ids) => setForm((f) => ({ ...f, studentIds: ids }))}
          />

          {/* Points */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              عدد النقاط <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={Math.abs(Number(form.points)) || ''}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setForm((f) => ({
                    ...f,
                    points: isDeduct ? -Math.abs(val) : Math.abs(val),
                  }));
                }}
                min="1"
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
              <span className="text-xl">⭐</span>
            </div>
            <div className="flex gap-1 mt-2">
              {[5, 10, 20, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPreset(n)}
                  className={`px-2.5 py-1 rounded-md text-xs border transition ${
                    Math.abs(Number(form.points)) === n
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              السبب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="مثال: مشاركة ممتازة في الحصة"
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              {form.reason.length} / 200
            </p>
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              المصدر (اختياري)
            </label>
            <select
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                isDeduct
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading
                ? 'جاري الحفظ...'
                : isDeduct
                  ? `خصم من ${form.studentIds.length} طالب`
                  : `إضافة لـ ${form.studentIds.length} طالب`}
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
