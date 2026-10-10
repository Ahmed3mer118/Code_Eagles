import { useEffect, useRef, useState } from 'react';
import userService from '../../../shared/api/userService';
import { clearAuth, getStoredUser } from '../../../shared/api/client';
import { useI18n } from '../../../shared/i18n';

/* ==================== Icons ==================== */
const I = {
  user: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  ),
  phone: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  ),
  mail: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7 10-7" />
    </svg>
  ),
  shield: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  edit: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  camera: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  logout: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  check: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  x: (c = 'w-4 h-4') => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

/* ==================== Info Row ==================== */
function InfoRow({ icon, label, value, editing, name, onChange, placeholder, dir }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-[#0f2744]/5 group-hover:text-[#0f2744]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </div>
        {editing && name ? (
          <input
            type="text"
            name={name}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder || ''}
            dir={dir}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0f2744]/40 focus:bg-white focus:ring-4 focus:ring-[#0f2744]/5"
          />
        ) : (
          <div className="mt-0.5 truncate text-sm font-semibold text-slate-800" dir={dir}>
            {value || '—'}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== Main ==================== */
export default function ProfilePage() {
  const i18n = useI18n();
  const t = i18n?.t || ((k) => k);
  const lang =
    i18n?.lang || i18n?.language || localStorage.getItem('lang') || 'ar';
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const [profile, setProfile] = useState(() => getStoredUser() || null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef(null);

  /* ----- Load ----- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await userService.getMyProfile();
        if (!mounted) return;
        setProfile(data);
        setError('');
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.message || e?.message || t('admin.profile.loadError'),
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- Edit ----- */
  function startEdit() {
    setDraft({
      name: profile?.name ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
    });
    setEditing(true);
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
    setError('');
  }

  function onDraftChange(e) {
    const { name, value } = e.target;
    setDraft((d) => ({ ...d, [name]: value }));
  }

  async function saveEdit() {
    if (!draft) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await userService.updateMyProfile({
        name: draft.name?.trim(),
        phoneNumber: draft.phoneNumber?.trim(),
      });
      setProfile((p) => ({ ...p, ...updated }));
      setEditing(false);
      setDraft(null);
      setSuccess(t('admin.profile.updateSuccess'));
      const stored = getStoredUser() || {};
      localStorage.setItem('user', JSON.stringify({ ...stored, ...updated }));
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || t('admin.profile.updateError'),
      );
    } finally {
      setSaving(false);
    }
  }

  /* ----- Avatar ----- */
  async function onAvatarPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      setError('');
      const res = await userService.uploadAvatar(file);
      const url = res?.profileImageUrl || res?.url || res?.data?.url;
      if (url) setProfile((p) => ({ ...p, profileImageUrl: url }));
      setSuccess(t('admin.profile.photoSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || t('admin.profile.photoError'));
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  /* ----- Logout ----- */
  function handleLogout() {
    clearAuth();
    window.location.href = '/login';
  }

  /* ----- Derived ----- */
  const name = profile?.name || '—';
  const email = profile?.email || '—';
  const phone = profile?.phoneNumber || '—';
  const roleKey = profile?.platformRole;

  const ROLE_KEYS = ['super_admin', 'teacher', 'student', 'parent', 'assistant'];
  const role = ROLE_KEYS.includes(roleKey)
    ? t(`roles.${roleKey}`)
    : roleKey || '—';

  const initial = (name.trim()[0] || 'A').toUpperCase();

  return (
    <div dir={dir} className="mx-auto w-full max-w-4xl space-y-5">
      {/* ============ Header Card ============ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2744] via-[#12325a] to-[#0a1c33] p-6 text-white shadow-lg shadow-[#0f2744]/20">
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile?.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/10"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-3xl font-black text-[#0f2744] ring-4 ring-white/10">
                {initial}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0f2744] shadow-md transition hover:scale-105"
              title={t('admin.profile.changePhoto')}
            >
              {I.camera('w-3.5 h-3.5')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarPick}
            />
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight">{name}</h1>
            <p className="mt-0.5 truncate text-sm text-slate-300/90">{email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {I.shield('w-3.5 h-3.5')}
                {role}
              </span>
              {profile?.emailVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  {I.check('w-3.5 h-3.5')}
                  {t('admin.profile.verified')}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:self-start">
            {!editing ? (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                {I.edit()}
                {t('admin.profile.edit')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {I.check()}
                  {saving ? t('admin.profile.saving') : t('admin.profile.save')}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {I.x()}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============ Alerts ============ */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {I.check('w-4 h-4')}
          {success}
        </div>
      )}

      {/* ============ Info Section ============ */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/60 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">
            {t('admin.profile.personalInfo')}
          </h2>
          {editing && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
              {t('admin.profile.editMode')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow
            icon={I.user()}
            label={t('admin.profile.fullName')}
            value={editing ? draft?.name : name}
            editing={editing}
            name="name"
            onChange={onDraftChange}
            placeholder={t('admin.profile.namePlaceholder')}
          />
          <InfoRow
            icon={I.phone()}
            label={t('admin.profile.phone')}
            value={editing ? draft?.phoneNumber : phone}
            editing={editing}
            name="phoneNumber"
            onChange={onDraftChange}
            placeholder={t('admin.profile.phonePlaceholder')}
            dir="ltr"
          />
          <InfoRow
            icon={I.mail()}
            label={t('admin.profile.email')}
            value={email}
            editing={false}
            dir="ltr"
          />
          <InfoRow
            icon={I.shield()}
            label={t('admin.profile.accountType')}
            value={role}
            editing={false}
          />
        </div>
      </div>

      {/* ============ Danger Zone ============ */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-slate-700">
            {t('admin.profile.logout')}
          </div>
          <div className="text-xs text-slate-500">
            {t('admin.profile.logoutDesc')}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          {I.logout()}
          {t('admin.profile.logoutBtn')}
        </button>
      </div>

      {loading && (
        <div className="text-center text-xs text-slate-400">
          {t('admin.profile.loadingProfile')}
        </div>
      )}
    </div>
  );
}