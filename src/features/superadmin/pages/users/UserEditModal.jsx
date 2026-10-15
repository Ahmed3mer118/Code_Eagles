import { useState } from 'react';
import { Edit3, X, AlertCircle } from 'lucide-react';
import { adminUsersService } from '../../../../shared/api/adminUsersService';

const LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

const ROLES = [
  { value: 'user', ar: 'مستخدم', en: 'User' },
  { value: 'super_admin', ar: 'سوبر أدمن', en: 'Super Admin' },
];

export default function UserEditModal({ user, isAr, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    phoneNumber: user.phoneNumber ?? '',
    platformRole: user.platformRole ?? 'user',
    preferredLanguage: user.preferredLanguage ?? 'ar',
    profileImageUrl: user.profileImageUrl ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (form.name.trim().length < 2) {
      setError(isAr ? 'الاسم قصير جداً' : 'Name is too short');
      return;
    }
    if (!form.email.trim()) {
      setError(isAr ? 'الإيميل مطلوب' : 'Email is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        platformRole: form.platformRole,
        preferredLanguage: form.preferredLanguage,
        ...(form.phoneNumber.trim() && {
          phoneNumber: form.phoneNumber.trim(),
        }),
        ...(form.profileImageUrl.trim() && {
          profileImageUrl: form.profileImageUrl.trim(),
        }),
      };
      await adminUsersService.update(user.id, payload);
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isAr ? 'فشل التعديل' : 'Update failed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <ModalHeader
        icon={Edit3}
        title={isAr ? 'تعديل بيانات المستخدم' : 'Edit User'}
        subtitle={user.email}
        onClose={onClose}
      />

      <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
        <Field label={isAr ? 'الاسم' : 'Name'}>
          <input
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            className="input-lite"
          />
        </Field>

        <Field label={isAr ? 'الإيميل' : 'Email'}>
          <input
            type="email"
            dir="ltr"
            value={form.email}
            onChange={handleChange('email')}
            className="input-lite"
          />
        </Field>

        <Field label={isAr ? 'رقم الهاتف' : 'Phone number'}>
          <input
            type="tel"
            dir="ltr"
            value={form.phoneNumber}
            onChange={handleChange('phoneNumber')}
            className="input-lite"
          />
        </Field>

        <Field label={isAr ? 'صورة البروفايل (URL)' : 'Profile Image URL'}>
          <input
            type="url"
            dir="ltr"
            value={form.profileImageUrl}
            onChange={handleChange('profileImageUrl')}
            className="input-lite"
            placeholder="https://..."
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={isAr ? 'الدور' : 'Role'}>
            <select
              value={form.platformRole}
              onChange={handleChange('platformRole')}
              className="input-lite"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {isAr ? r.ar : r.en}
                </option>
              ))}
            </select>
          </Field>

          <Field label={isAr ? 'اللغة' : 'Language'}>
            <select
              value={form.preferredLanguage}
              onChange={handleChange('preferredLanguage')}
              className="input-lite"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
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
        confirmLabel={isAr ? 'حفظ' : 'Save'}
      />
    </Modal>
  );
}

/* ---------- Shared UI ---------- */
export function Modal({ onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-3xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  icon: Icon,
  title,
  subtitle,
  onClose,
  tone = 'indigo',
}) {
  const toneClass = {
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    rose: 'bg-rose-100 text-rose-600',
    amber: 'bg-amber-100 text-amber-600',
  }[tone];

  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-extrabold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500" dir="ltr">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function ModalFooter({
  onCancel,
  onSubmit,
  loading,
  confirmLabel,
  cancelLabel,
  confirmTone = 'indigo',
  disabled = false, // ⭐ جديد
}) {
  const toneClass = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    rose: 'bg-rose-600 hover:bg-rose-700',
  }[confirmTone];

  return (
    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || disabled} // ⭐ جديد
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed ${toneClass}`}
      >
        {loading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {confirmLabel}
      </button>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </label>
  );
}
