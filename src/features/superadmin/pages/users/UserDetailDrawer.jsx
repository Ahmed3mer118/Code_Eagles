import { useEffect, useState } from 'react';
import {
  X, UserCircle2, Mail, Phone, Shield, CheckCircle2, XCircle,
  Clock, KeyRound, PauseCircle, Trash2, Edit3, Ban, Unlock,
  MailCheck, Loader2, Activity, Monitor, Globe, Calendar,
} from 'lucide-react';
import { adminUsersService } from '../../../../shared/api/adminUsersService';

const ROLE_META = {
  super_admin: {
    ar: 'سوبر أدمن',
    en: 'Super Admin',
    color: 'bg-purple-50 text-purple-700',
  },
  user: {
    ar: 'مستخدم',
    en: 'User',
    color: 'bg-slate-50 text-slate-700',
  },
};

const STATUS_META = {
  active: {
    ar: 'نشط',
    en: 'Active',
    color: 'bg-emerald-50 text-emerald-700',
  },
  inactive: {
    ar: 'غير نشط',
    en: 'Inactive',
    color: 'bg-slate-50 text-slate-600',
  },
  suspended: {
    ar: 'موقوف',
    en: 'Suspended',
    color: 'bg-rose-50 text-rose-700',
  },
};

const ACTIVITY_META = {
  login_success: {
    ar: 'تسجيل دخول ناجح',
    en: 'Login success',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  login_failed: {
    ar: 'محاولة دخول فاشلة',
    en: 'Login failed',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  logout: {
    ar: 'تسجيل خروج',
    en: 'Logout',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  signup: {
    ar: 'إنشاء حساب',
    en: 'Signup',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  password_changed: {
    ar: 'تغيير كلمة المرور',
    en: 'Password changed',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  password_reset_requested: {
    ar: 'طلب إعادة تعيين كلمة المرور',
    en: 'Password reset requested',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  password_reset_completed: {
    ar: 'تم إعادة تعيين كلمة المرور',
    en: 'Password reset completed',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  email_verified: {
    ar: 'تم توثيق الإيميل',
    en: 'Email verified',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  account_locked: {
    ar: 'تم قفل الحساب',
    en: 'Account locked',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  token_refreshed: {
    ar: 'تحديث التوكن',
    en: 'Token refreshed',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  token_reuse_detected: {
    ar: 'كشف إعادة استخدام التوكن',
    en: 'Token reuse detected',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
};

export default function UserDetailDrawer({
  user: initialUser,
  isAr,
  onClose,
  onEdit,
  onChangeStatus,
  onResetPassword,
  onDelete,
  onRefresh,
}) {
  const [user, setUser] = useState(initialUser);
  const [sessions, setSessions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [fresh, sess, act] = await Promise.all([
          adminUsersService.getOne(initialUser.id).catch(() => initialUser),
          adminUsersService.getSessions(initialUser.id).catch(() => []),
          adminUsersService
            .getActivity(initialUser.id, 1, 20)
            .catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setUser(fresh);
        setSessions(Array.isArray(sess) ? sess : []);
        setActivity(act?.data ?? []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialUser.id]);

  const roleMeta = ROLE_META[user.platformRole] ?? ROLE_META.user;
  const statusMeta = STATUS_META[user.status] ?? STATUS_META.inactive;
  const initials = (user.name || 'U').trim()[0].toUpperCase();
  const isLocked =
    user.lockedUntil && new Date(user.lockedUntil) > new Date();

  /* ----- Actions ----- */
  const handleUnlock = async () => {
    try {
      setActionLoading(true);
      await adminUsersService.unlock(user.id);
      const fresh = await adminUsersService.getOne(user.id).catch(() => user);
      setUser(fresh);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setActionLoading(true);
      await adminUsersService.verifyEmail(user.id);
      const fresh = await adminUsersService.getOne(user.id).catch(() => user);
      setUser(fresh);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSessions = async () => {
    const ok = window.confirm(
      isAr
        ? 'هل تريد إنهاء جميع جلسات هذا المستخدم؟'
        : 'Revoke all sessions for this user?',
    );
    if (!ok) return;
    try {
      setActionLoading(true);
      await adminUsersService.revokeSessions(user.id);
      setSessions([]);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-2xl overflow-hidden bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============ Header ============ */}
        <div className="relative border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-purple-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 end-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/60"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="h-16 w-16 rounded-2xl object-cover shadow-md ring-4 ring-white"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-black text-white shadow-md ring-4 ring-white">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-extrabold text-slate-900">
                {user.name}
              </h2>
              <p className="truncate text-sm text-slate-500" dir="ltr">
                {user.email}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleMeta.color}`}
                >
                  {isAr ? roleMeta.ar : roleMeta.en}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusMeta.color}`}
                >
                  {isAr ? statusMeta.ar : statusMeta.en}
                </span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    {isAr ? 'موثّق' : 'Verified'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                    <XCircle className="h-3 w-3" />
                    {isAr ? 'غير موثّق' : 'Not verified'}
                  </span>
                )}
                {isLocked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    <Ban className="h-3 w-3" />
                    {isAr ? 'مقفل' : 'Locked'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isAr ? 'تعديل' : 'Edit'}
            </button>

            <button
              type="button"
              onClick={onChangeStatus}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <PauseCircle className="h-3.5 w-3.5" />
              {isAr ? 'تغيير الحالة' : 'Status'}
            </button>

            <button
              type="button"
              onClick={onResetPassword}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {isAr ? 'كلمة المرور' : 'Password'}
            </button>

            {isLocked && (
              <button
                type="button"
                onClick={handleUnlock}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Unlock className="h-3.5 w-3.5" />
                )}
                {isAr ? 'فك القفل' : 'Unlock'}
              </button>
            )}

            {!user.isVerified && (
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MailCheck className="h-3.5 w-3.5" />
                )}
                {isAr ? 'توثيق' : 'Verify'}
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              disabled={actionLoading}
              className="ms-auto inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isAr ? 'حذف' : 'Delete'}
            </button>
          </div>
        </div>

        {/* ============ Tabs ============ */}
        <div className="flex border-b border-slate-100 bg-white">
          {[
            { key: 'info', ar: 'المعلومات', en: 'Info' },
            { key: 'sessions', ar: 'الجلسات', en: 'Sessions' },
            { key: 'activity', ar: 'النشاط', en: 'Activity' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 border-b-2 px-4 py-3 text-sm font-bold transition ${
                tab === t.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {isAr ? t.ar : t.en}
              {t.key === 'sessions' && sessions.length > 0 && (
                <span className="ms-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  {sessions.length}
                </span>
              )}
              {t.key === 'activity' && activity.length > 0 && (
                <span className="ms-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  {activity.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ============ Body ============ */}
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">
                {isAr ? 'جاري التحميل...' : 'Loading...'}
              </p>
            </div>
          ) : (
            <>
              {tab === 'info' && <InfoTab user={user} isAr={isAr} />}
              {tab === 'sessions' && (
                <SessionsTab
                  sessions={sessions}
                  isAr={isAr}
                  onRevokeAll={handleRevokeSessions}
                  actionLoading={actionLoading}
                />
              )}
              {tab === 'activity' && (
                <ActivityTab activity={activity} isAr={isAr} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Info Tab
   ============================================================ */
function InfoTab({ user, isAr }) {
  return (
    <div className="space-y-5">
      <Section title={isAr ? 'المعلومات الأساسية' : 'Basic Info'}>
        <InfoRow
          icon={UserCircle2}
          label={isAr ? 'الاسم' : 'Name'}
          value={user.name}
        />
        <InfoRow
          icon={Mail}
          label={isAr ? 'الإيميل' : 'Email'}
          value={user.email}
          dir="ltr"
        />
        <InfoRow
          icon={Phone}
          label={isAr ? 'الهاتف' : 'Phone'}
          value={user.phoneNumber || '—'}
          dir="ltr"
        />
        <InfoRow
          icon={Shield}
          label={isAr ? 'الدور' : 'Role'}
          value={user.platformRole}
        />
        <InfoRow
          icon={Globe}
          label={isAr ? 'اللغة' : 'Language'}
          value={user.preferredLanguage === 'ar' ? 'العربية' : 'English'}
        />
        <InfoRow
          icon={Clock}
          label={isAr ? 'آخر دخول' : 'Last Login'}
          value={
            user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleString(
                  isAr ? 'ar-EG' : 'en-GB',
                )
              : isAr
                ? 'لم يسجل بعد'
                : 'Never'
          }
        />
        <InfoRow
          icon={Calendar}
          label={isAr ? 'تاريخ الإنشاء' : 'Created'}
          value={new Date(user.createdAt).toLocaleString(
            isAr ? 'ar-EG' : 'en-GB',
          )}
        />
      </Section>

      {/* Security Section */}
      {(user.failedLoginCount > 0 ||
        user.lockedUntil ||
        user.emailVerifiedAt) && (
        <Section title={isAr ? 'الأمان' : 'Security'}>
          {(user.failedLoginCount ?? 0) > 0 && (
            <InfoRow
              icon={Ban}
              label={isAr ? 'محاولات دخول فاشلة' : 'Failed logins'}
              value={user.failedLoginCount}
            />
          )}
          {user.lockedUntil && (
            <InfoRow
              icon={Ban}
              label={isAr ? 'مقفل حتى' : 'Locked until'}
              value={new Date(user.lockedUntil).toLocaleString(
                isAr ? 'ar-EG' : 'en-GB',
              )}
            />
          )}
          {user.emailVerifiedAt && (
            <InfoRow
              icon={CheckCircle2}
              label={isAr ? 'تم توثيق الإيميل في' : 'Email verified at'}
              value={new Date(user.emailVerifiedAt).toLocaleString(
                isAr ? 'ar-EG' : 'en-GB',
              )}
            />
          )}
        </Section>
      )}

      {/* Student-specific */}
      {(user.gradeLevel || user.parentPhone || user.childContact) && (
        <Section title={isAr ? 'معلومات إضافية' : 'Additional Info'}>
          {user.gradeLevel && (
            <InfoRow
              icon={Shield}
              label={isAr ? 'الصف الدراسي' : 'Grade level'}
              value={user.gradeLevel}
            />
          )}
          {user.parentPhone && (
            <InfoRow
              icon={Phone}
              label={isAr ? 'هاتف ولي الأمر' : 'Parent phone'}
              value={user.parentPhone}
              dir="ltr"
            />
          )}
          {user.childContact && (
            <InfoRow
              icon={Phone}
              label={isAr ? 'بيانات التواصل مع الابن' : 'Child contact'}
              value={user.childContact}
              dir="ltr"
            />
          )}
        </Section>
      )}
    </div>
  );
}

/* ============================================================
   Sessions Tab
   ============================================================ */
function SessionsTab({ sessions, isAr, onRevokeAll, actionLoading }) {
  if (!sessions.length) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        <Monitor className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        {isAr ? 'لا توجد جلسات نشطة' : 'No active sessions'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          {isAr
            ? `${sessions.length} جلسة نشطة`
            : `${sessions.length} active session(s)`}
        </p>
        <button
          type="button"
          onClick={onRevokeAll}
          disabled={actionLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
        >
          {actionLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          {isAr ? 'إنهاء الكل' : 'Revoke all'}
        </button>
      </div>

      {sessions.map((s) => (
        <div
          key={s.id}
          className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="truncate text-sm font-bold text-slate-800">
                  {s.deviceName || s.deviceId || 'Unknown device'}
                </span>
              </div>

              {s.userAgent && (
                <p className="mt-1 truncate text-xs text-slate-500" dir="ltr">
                  {s.userAgent}
                </p>
              )}
            </div>

            {s.ipAddress && (
              <span
                className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-mono text-slate-600"
                dir="ltr"
              >
                {s.ipAddress}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {s.createdAt && (
              <div>
                <p className="text-slate-400">
                  {isAr ? 'بدأت في' : 'Started'}
                </p>
                <p className="font-semibold text-slate-700">
                  {new Date(s.createdAt).toLocaleString(
                    isAr ? 'ar-EG' : 'en-GB',
                  )}
                </p>
              </div>
            )}
            {s.lastUsedAt && (
              <div>
                <p className="text-slate-400">
                  {isAr ? 'آخر نشاط' : 'Last used'}
                </p>
                <p className="font-semibold text-slate-700">
                  {new Date(s.lastUsedAt).toLocaleString(
                    isAr ? 'ar-EG' : 'en-GB',
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Activity Tab
   ============================================================ */
function ActivityTab({ activity, isAr }) {
  if (!activity.length) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        <Activity className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        {isAr ? 'لا يوجد نشاط مسجّل' : 'No activity recorded'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activity.map((a) => {
        const meta = ACTIVITY_META[a.type] ?? {
          ar: a.type,
          en: a.type,
          color: 'text-slate-600',
          bg: 'bg-slate-100',
        };

        return (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-indigo-200 hover:shadow-sm"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}
            >
              <Activity className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold ${meta.color}`}>
                {isAr ? meta.ar : meta.en}
                {a.success === false && (
                  <span className="ms-2 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    {isAr ? 'فشل' : 'Failed'}
                  </span>
                )}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(a.createdAt).toLocaleString(
                    isAr ? 'ar-EG' : 'en-GB',
                  )}
                </span>

                {a.ipAddress && (
                  <span className="font-mono" dir="ltr">
                    {a.ipAddress}
                  </span>
                )}
              </div>

              {a.userAgent && (
                <p
                  className="mt-1 truncate text-[11px] text-slate-400"
                  dir="ltr"
                >
                  {a.userAgent}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Shared UI
   ============================================================ */
function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, dir }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p
          className="mt-0.5 truncate text-sm font-semibold text-slate-800"
          dir={dir}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  );
}
