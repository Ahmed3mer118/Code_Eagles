import { useEffect, useRef, useState } from 'react';
import {
  MoreHorizontal, Eye, Edit3, PauseCircle, KeyRound, Trash2,
  Unlock, MailCheck,
} from 'lucide-react';

export default function UserActionsMenu({
  user,
  isAr,
  onView,
  onEdit,
  onChangeStatus,
  onResetPassword,
  onDelete,
  onUnlock,
  onVerify,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isLocked =
    user.lockedUntil && new Date(user.lockedUntil) > new Date();

  const handle = (fn) => {
    setOpen(false);
    fn?.();
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div
          className={`absolute z-30 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ${
            isAr ? 'left-0' : 'right-0'
          }`}
        >
          <MenuItem
            icon={Eye}
            label={isAr ? 'عرض التفاصيل' : 'View details'}
            onClick={() => handle(onView)}
          />
          <MenuItem
            icon={Edit3}
            label={isAr ? 'تعديل البيانات' : 'Edit'}
            onClick={() => handle(onEdit)}
          />
          <MenuItem
            icon={PauseCircle}
            label={isAr ? 'تغيير الحالة' : 'Change status'}
            onClick={() => handle(onChangeStatus)}
          />
          <MenuItem
            icon={KeyRound}
            label={isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password'}
            onClick={() => handle(onResetPassword)}
          />

          {!user.isVerified && (
            <MenuItem
              icon={MailCheck}
              label={isAr ? 'توثيق الإيميل' : 'Verify email'}
              onClick={() => handle(onVerify)}
              tone="emerald"
            />
          )}

          {isLocked && (
            <MenuItem
              icon={Unlock}
              label={isAr ? 'فك القفل' : 'Unlock account'}
              onClick={() => handle(onUnlock)}
              tone="emerald"
            />
          )}

          <div className="border-t border-slate-100" />
          <MenuItem
            icon={Trash2}
            label={isAr ? 'حذف' : 'Delete'}
            onClick={() => handle(onDelete)}
            tone="red"
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, tone = 'slate' }) {
  const toneClass = {
    slate: 'text-slate-700 hover:bg-slate-50',
    emerald: 'text-emerald-700 hover:bg-emerald-50',
    red: 'text-red-700 hover:bg-red-50',
  }[tone];

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-semibold transition ${toneClass}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
