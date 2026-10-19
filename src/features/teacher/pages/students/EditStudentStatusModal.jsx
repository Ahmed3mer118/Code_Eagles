// src/features/teacher/pages/students/EditStudentStatusModal.jsx
import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'suspended', label: 'موقوف' },
];

export default function EditStudentStatusModal({
  open,
  onClose,
  onSubmit,
  loading,
  student,
}) {
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (open) setStatus(student?.status || 'active');
  }, [open, student]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <UserCog className="text-primary-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              تغيير حالة الطالب
            </h3>
            <p className="text-xs text-gray-500">
              {student?.name || 'طالب'}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              الحالة الجديدة
            </label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    status === o.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={o.value}
                    checked={status === o.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="accent-primary-500"
                  />
                  <span className="text-sm font-medium">{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onSubmit({ status })}
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
