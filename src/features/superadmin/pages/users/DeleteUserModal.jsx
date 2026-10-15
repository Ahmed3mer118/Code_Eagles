import { useState } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { adminUsersService } from '../../../../shared/api/adminUsersService';
import { Modal, ModalHeader, ModalFooter } from './UserEditModal';

export default function DeleteUserModal({
  user,
  isAr,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const canDelete = confirmText.trim().toLowerCase() === 'delete';

  const handleSubmit = async () => {
    if (!canDelete) return;
    setLoading(true);
    setError('');
    try {
      await adminUsersService.remove(user.id);
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isAr ? 'فشل الحذف' : 'Delete failed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <ModalHeader
        icon={Trash2}
        title={isAr ? 'حذف المستخدم' : 'Delete User'}
        subtitle={user.email}
        onClose={onClose}
        tone="rose"
      />

      <div className="space-y-4 p-6">
        <p className="text-sm text-slate-600">
          {isAr
            ? 'هل أنت متأكد من حذف هذا المستخدم؟ سيتم تعطيل حسابه وجميع جلساته.'
            : 'Are you sure you want to delete this user? Their account and sessions will be disabled.'}
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">
            {isAr
              ? 'للتأكيد، اكتب كلمة "delete" بالإنجليزية:'
              : 'To confirm, type "delete":'}
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="input-lite mt-2"
            placeholder="delete"
            dir="ltr"
            autoFocus
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <ModalFooter
        onCancel={onClose}
        onSubmit={handleSubmit}
        loading={loading}
        disabled={!canDelete} // ⭐ جديد
        cancelLabel={isAr ? 'إلغاء' : 'Cancel'}
        confirmLabel={isAr ? 'حذف نهائي' : 'Delete'}
        confirmTone="rose"
      />
    </Modal>
  );
}
