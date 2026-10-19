// src/features/teacher/pages/payments/PaymentPlanFormModal.jsx
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

const PACKAGE_TYPES = [
  { value: 'monthly', label: 'شهري' },
  { value: 'term', label: 'ترم' },
  { value: 'yearly', label: 'سنوي' },
  { value: 'session', label: 'بالجلسة' },
];

const PLAN_STATUSES = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'archived', label: 'مؤرشف' },
];

export default function PaymentPlanFormModal({ open, onClose, onSubmit, loading, plan }) {
  const isEdit = !!plan;
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    packageType: 'monthly',
    planType: '',
    durationDays: 30,
    trialDays: 0,
    sortOrder: 0,
    status: 'active',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        name: plan?.name || '',
        description: plan?.description || '',
        price: Number(plan?.price) || 0,
        packageType: plan?.packageType || 'monthly',
        planType: plan?.planType || '',
        durationDays: plan?.durationDays || 30,
        trialDays: plan?.trialDays || 0,
        sortOrder: plan?.sortOrder || 0,
        status: plan?.status || 'active',
      });
      setError('');
    }
  }, [open, plan]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('اسم الخطة مطلوب');
      return;
    }
    if (Number(form.price) < 0) {
      setError('السعر لا يمكن أن يكون سالباً');
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      packageType: form.packageType,
      planType: form.planType || undefined,
      durationDays: Number(form.durationDays) || undefined,
      trialDays: Number(form.trialDays) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      ...(isEdit && { status: form.status }),
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
              {isEdit ? 'تعديل خطة' : 'خطة دفع جديدة'}
            </h3>
            <p className="text-xs text-gray-500">
              {isEdit ? 'تحديث بيانات الخطة' : 'إنشاء خطة دفع جديدة'}
            </p>
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
              اسم الخطة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: الخطة الشهرية"
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              الوصف
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              maxLength={2000}
              placeholder="وصف مختصر..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                السعر (ج.م) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                نوع الباقة <span className="text-red-500">*</span>
              </label>
              <select
                value={form.packageType}
                onChange={(e) => setForm({ ...form, packageType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                required
              >
                {PACKAGE_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                المدة (أيام)
              </label>
              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                فترة تجريبية (أيام)
              </label>
              <input
                type="number"
                min="0"
                value={form.trialDays}
                onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                ترتيب العرض
              </label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            {isEdit && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  الحالة
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {PLAN_STATUSES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
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
