import { useState } from 'react';
import { PauseCircle, PlayCircle, Ban, AlertCircle } from 'lucide-react';
import { adminUsersService } from '../../../../shared/api/adminUsersService';
import {
  Modal,
  ModalHeader,
  ModalFooter,
} from './UserEditModal';

const OPTIONS = [
  {
    value: 'active',
    icon: PlayCircle,
    tone: 'emerald',
    ar: 'نشط',
    en: 'Active',
  },
  {
    value: 'inactive',
    icon: PauseCircle,
    tone: 'slate',
    ar: 'غير نشط',
    en: 'Inactive',
  },
  {
    value: 'suspended',
    icon: Ban,
    tone: 'rose',
    ar: 'موقوف',
    en: 'Suspended',
  },
];

export default function UserStatusModal({ user, isAr, onClose, onSuccess }) {
  const [status, setStatus] = useState(user.status ?? 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (status === user.status) {
      onClose();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await adminUsersService.updateStatus(user.id, status);
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isAr ? 'فشل تغيير الحالة' : 'Status change failed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <ModalHeader
        icon={PauseCircle}
        title={isAr ? 'تغيير حالة الحساب' : 'Change Account Status'}
        subtitle={user.name}
        onClose={onClose}
        tone="amber"
      />

      <div className="space-y-2 p-6">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = status === opt.value;
          const toneActive = {
            emerald: 'border-emerald-500 bg-emerald-50',
            slate: 'border-slate-500 bg-slate-100',
            rose: 'border-rose-500 bg-rose-50',
          }[opt.tone];

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-start transition ${
                active ? toneActive : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-bold text-slate-900">
                {isAr ? opt.ar : opt.en}
              </span>
              {active && (
                <span className="ms-auto text-emerald-500">✓</span>
              )}
            </button>
          );
        })}

        {status === 'suspended' && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isAr
                ? 'عند الإيقاف، سيتم إنهاء جميع جلسات المستخدم فوراً.'
                : 'Suspending will immediately terminate all user sessions.'}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
        confirmLabel={isAr ? 'تأكيد' : 'Confirm'}
        confirmTone={status === 'suspended' ? 'rose' : 'indigo'}
      />
    </Modal>
  );
}
