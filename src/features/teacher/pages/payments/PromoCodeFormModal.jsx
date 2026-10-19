// src/features/teacher/pages/payments/PromoCodeFormModal.jsx
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'نسبة مئوية (%)' },
  { value: 'fixed', label: 'مبلغ ثابت' },
];

export default function PromoCodeFormModal({ open, onClose, onSubmit, loading, promo }) {
  const isEdit = !!promo;
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    maxUses: '',
    maxUsesPerStudent: '',
    validFrom: '',
    validUntil: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        code: promo?.code || '',
        discountType: promo?.discountType || 'percentage',
        discountValue: Number(promo?.discountValue) || 10,
        maxUses: promo?.maxUses ?? '',
        maxUsesPerStudent: promo?.maxUsesPerStudent ?? '',
        validFrom: promo?.validFrom
          ? new Date(promo.validFrom).toISOString().slice(0, 10)
          : '',
        validUntil: promo?.validUntil
          ? new Date(promo.validUntil).toISOString().slice(0, 10)
          : '',
      });
      setError('');
    }
  }, [open, promo]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.code.trim()) {
      setError('كود الخصم مطلوب');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(form.code.toUpperCase())) {
      setError('الكود لازم يحتوي على أحرف كبيرة وأرقام و _ و - فقط');
      return;
    }
    if (Number(form.discountValue) < 0) {
      setError('قيمة الخصم لا يمكن أن تكون سالبة');
      return;
    }

    await onSubmit({
      ...(isEdit ? {} : { code: form.code.toUpperCase().trim() }),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      maxUsesPerStudent: form.maxUsesPerStudent
        ? Number(form.maxUsesPerStudent)
        : undefined,
      validFrom: form.validFrom || undefined,
      validUntil: form.validUntil || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Save className="text-primary-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {isEdit ? 'تعديل كود' : 'كود خصم جديد'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              كود الخصم {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="SAVE10"
              maxLength={50}
              disabled={isEdit}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60"
              required={!isEdit}
            />
            {!isEdit && (
              <p className="text-[11px] text-gray-400 mt-1">
                أحرف كبيرة، أرقام، _ و - فقط
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                نوع الخصم <span className="text-red-500">*</span>
              </label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                required
              >
                {DISCOUNT_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                قيمة الخصم <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={(e) =>
                  setForm({ ...form, discountValue: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                حد الاستخدام الكلي
              </label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="بدون حد"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                حد لكل طالب
              </label>
              <input
                type="number"
                min="1"
                value={form.maxUsesPerStudent}
                onChange={(e) =>
                  setForm({ ...form, maxUsesPerStudent: e.target.value })
                }
                placeholder="بدون حد"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                صالح من
              </label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm({ ...form, validFrom: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                صالح حتى
              </label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm({ ...form, validUntil: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : isEdit ? 'تحديث' : 'إنشاء'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
