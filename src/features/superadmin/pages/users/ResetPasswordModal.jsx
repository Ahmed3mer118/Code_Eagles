import { useState } from 'react';
import { KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { adminUsersService } from '../../../../shared/api/adminUsersService';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  Field,
} from './UserEditModal';

export default function ResetPasswordModal({
  user,
  isAr,
  onClose,
  onSuccess,
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (newPassword.length < 8) {
      setError(
        isAr ? 'كلمة المرور قصيرة (8 أحرف على الأقل)' : 'Password too short (min 8)',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await adminUsersService.resetPassword(user.id, {
        newPassword,
        confirmPassword,
      });
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isAr ? 'فشل تغيير كلمة المرور' : 'Reset failed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <ModalHeader
        icon={KeyRound}
        title={isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
        subtitle={user.email}
        onClose={onClose}
        tone="amber"
      />

      <div className="space-y-4 p-6">
        <Field label={isAr ? 'كلمة المرور الجديدة' : 'New password'}>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-lite pe-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute top-1/2 end-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPwd ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </Field>

        <Field label={isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}>
          <input
            type={showPwd ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-lite"
          />
        </Field>

        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {isAr
              ? 'سيتم إنهاء جميع جلسات المستخدم بعد التغيير.'
              : 'All user sessions will be terminated after reset.'}
          </span>
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
        cancelLabel={isAr ? 'إلغاء' : 'Cancel'}
        confirmLabel={isAr ? 'إعادة التعيين' : 'Reset'}
        confirmTone="rose"
      />
    </Modal>
  );
}
