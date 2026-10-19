// src/features/teacher/components/ConfirmModal.jsx
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'تأكيد',
  message = 'هل أنت متأكد؟',
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'danger',
  loading = false,
}) {
  if (!open) return null;

  const btnCls =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-primary-600 hover:bg-primary-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'danger' ? 'bg-red-50' : 'bg-primary-50'
            }`}
          >
            <AlertTriangle
              size={20}
              className={variant === 'danger' ? 'text-red-600' : 'text-primary-600'}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-2 p-4 pt-0">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 ${btnCls}`}
          >
            {loading ? 'جاري التنفيذ...' : confirmLabel}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
