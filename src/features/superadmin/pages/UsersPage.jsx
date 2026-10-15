import { useCallback, useEffect, useState } from 'react';
import {
  Search, RefreshCw, UserCircle2, Shield, Users as UsersIcon,
  CheckCircle2, XCircle, Filter, AlertCircle, ChevronLeft, ChevronRight,
  Ban, Clock, Mail,
} from 'lucide-react';
import { adminUsersService } from '../../../shared/api/adminUsersService';
import { useI18n } from '../../../shared/i18n';
import UserActionsMenu from './users/UserActionsMenu';
import UserDetailDrawer from './users/UserDetailDrawer';
import UserEditModal from './users/UserEditModal';
import UserStatusModal from './users/UserStatusModal';
import ResetPasswordModal from './users/ResetPasswordModal';
import DeleteUserModal from './users/DeleteUserModal';

/* ============================================================
   Constants
   ============================================================ */
const ROLE_TABS = [
  { key: '',             ar: 'الكل',          en: 'All' },
  { key: 'super_admin',  ar: 'سوبر أدمن',     en: 'Super Admin' },
  { key: 'user',         ar: 'مستخدمين',      en: 'Users' },
];

const STATUS_TABS = [
  { key: '',           ar: 'كل الحالات',    en: 'All Statuses' },
  { key: 'active',     ar: 'نشط',           en: 'Active' },
  { key: 'inactive',   ar: 'غير نشط',       en: 'Inactive' },
  { key: 'suspended',  ar: 'موقوف',         en: 'Suspended' },
];

const ROLE_META = {
  super_admin: {
    ar: 'سوبر أدمن',
    en: 'Super Admin',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  user: {
    ar: 'مستخدم',
    en: 'User',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
};

const STATUS_META = {
  active: {
    ar: 'نشط',
    en: 'Active',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  inactive: {
    ar: 'غير نشط',
    en: 'Inactive',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  suspended: {
    ar: 'موقوف',
    en: 'Suspended',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

/* ============================================================
   Page
   ============================================================ */
export default function UsersPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [statusItem, setStatusItem] = useState(null);
  const [resetItem, setResetItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const res = await adminUsersService.list({
          page,
          limit,
          ...(search.trim() && { search: search.trim() }),
          ...(roleFilter && { platformRole: roleFilter }),
          ...(statusFilter && { status: statusFilter }),
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        setItems(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      } catch (err) {
        console.error('Failed to load users:', err);
        setError(
          err?.response?.data?.message ||
            (isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users'),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, search, roleFilter, statusFilter, isAr],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  /* ---------- Stats (من الصفحة الحالية) ---------- */
  const activeCount = items.filter((u) => u.status === 'active').length;
  const verifiedCount = items.filter((u) => u.isVerified).length;
  const adminsCount = items.filter(
    (u) => u.platformRole === 'super_admin',
  ).length;

  /* ---------- Actions ---------- */
  const handleUnlock = async (user) => {
    try {
      await adminUsersService.unlock(user.id);
      await fetchData(true);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to unlock');
    }
  };

  const handleVerify = async (user) => {
    try {
      await adminUsersService.verifyEmail(user.id);
      await fetchData(true);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to verify');
    }
  };

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ============ Header ============ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {isAr ? 'إدارة المستخدمين' : 'Users Management'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAr
              ? 'كل حسابات المنصة والأدوار'
              : 'All platform accounts and roles'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* ============ Stats Row ============ */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label={isAr ? 'إجمالي المستخدمين' : 'Total Users'}
          value={total}
          tone="indigo"
        />
        <StatCard
          icon={CheckCircle2}
          label={isAr ? 'نشط (الصفحة)' : 'Active (page)'}
          value={activeCount}
          tone="emerald"
        />
        <StatCard
          icon={Mail}
          label={isAr ? 'موثّق (الصفحة)' : 'Verified (page)'}
          value={verifiedCount}
          tone="blue"
        />
        <StatCard
          icon={Shield}
          label={isAr ? 'سوبر أدمن (الصفحة)' : 'Super Admins (page)'}
          value={adminsCount}
          tone="purple"
        />
      </div>

      {/* ============ Filters ============ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {isAr ? 'الفلاتر' : 'Filters'}
          </span>
        </div>

        {/* Search */}
        <label className="relative block mb-3">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث بالاسم أو الإيميل أو الهاتف...'
                : 'Search by name, email or phone...'
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 ps-10 pe-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>

        {/* Role tabs */}
        <div className="mb-3 inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.key || 'all-role'}
              type="button"
              onClick={() => setRoleFilter(tab.key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                roleFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>

        {/* Status tabs */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key || 'all-status'}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              {isAr ? tab.ar : tab.en}
            </button>
          ))}
        </div>
      </div>

      {/* ============ Error ============ */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============ Table ============ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState isAr={isAr} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <Th>{isAr ? 'المستخدم' : 'User'}</Th>
                    <Th>{isAr ? 'الدور' : 'Role'}</Th>
                    <Th>{isAr ? 'الحالة' : 'Status'}</Th>
                    <Th>{isAr ? 'التحقق' : 'Verified'}</Th>
                    <Th>{isAr ? 'آخر دخول' : 'Last Login'}</Th>
                    <Th align="end">
                      {isAr ? 'إجراءات' : 'Actions'}
                    </Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isAr={isAr}
                      onView={() => setDetailItem(user)}
                      onEdit={() => setEditItem(user)}
                      onChangeStatus={() => setStatusItem(user)}
                      onResetPassword={() => setResetItem(user)}
                      onDelete={() => setDeleteItem(user)}
                      onUnlock={() => handleUnlock(user)}
                      onVerify={() => handleVerify(user)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <p className="text-xs font-semibold text-slate-500">
                {isAr
                  ? `عرض ${items.length} من ${total}`
                  : `Showing ${items.length} of ${total}`}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  {isAr ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>

                <span className="px-3 text-sm font-bold text-slate-700">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  {isAr ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============ Modals ============ */}
      {detailItem && (
        <UserDetailDrawer
          user={detailItem}
          isAr={isAr}
          onClose={() => setDetailItem(null)}
          onEdit={() => {
            setEditItem(detailItem);
            setDetailItem(null);
          }}
          onChangeStatus={() => {
            setStatusItem(detailItem);
            setDetailItem(null);
          }}
          onResetPassword={() => {
            setResetItem(detailItem);
            setDetailItem(null);
          }}
          onDelete={() => {
            setDeleteItem(detailItem);
            setDetailItem(null);
          }}
          onRefresh={() => fetchData(true)}
        />
      )}

      {editItem && (
        <UserEditModal
          user={editItem}
          isAr={isAr}
          onClose={() => setEditItem(null)}
          onSuccess={() => {
            setEditItem(null);
            fetchData(true);
          }}
        />
      )}

      {statusItem && (
        <UserStatusModal
          user={statusItem}
          isAr={isAr}
          onClose={() => setStatusItem(null)}
          onSuccess={() => {
            setStatusItem(null);
            fetchData(true);
          }}
        />
      )}

      {resetItem && (
        <ResetPasswordModal
          user={resetItem}
          isAr={isAr}
          onClose={() => setResetItem(null)}
          onSuccess={() => setResetItem(null)}
        />
      )}

      {deleteItem && (
        <DeleteUserModal
          user={deleteItem}
          isAr={isAr}
          onClose={() => setDeleteItem(null)}
          onSuccess={() => {
            setDeleteItem(null);
            fetchData(true);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   Sub Components
   ============================================================ */
function Th({ children, align = 'start' }) {
  return (
    <th
      className={`px-5 py-3.5 text-${align} text-[11px] font-extrabold tracking-wider text-slate-500`}
    >
      {children}
    </th>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      ring: 'ring-indigo-500/20',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      ring: 'ring-emerald-500/20',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      ring: 'ring-blue-500/20',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      ring: 'ring-purple-500/20',
    },
  };
  const c = tones[tone] ?? tones.indigo;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-4 ${c.bg} ${c.text} ${c.ring}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-500">{label}</p>
        <p className="text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ isAr }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <UserCircle2 className="h-8 w-8 text-slate-400" />
      </div>
      <p className="font-bold text-slate-900">
        {isAr ? 'لا يوجد مستخدمون' : 'No users found'}
      </p>
      <p className="text-sm text-slate-500">
        {isAr
          ? 'لم يتم العثور على مستخدمين مطابقين'
          : 'No users match your filters'}
      </p>
    </div>
  );
}

function UserRow({
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
  const roleMeta = ROLE_META[user.platformRole] ?? ROLE_META.user;
  const statusMeta = STATUS_META[user.status] ?? STATUS_META.inactive;

  const initials = (user.name || 'U').trim()[0].toUpperCase();

  const isLocked =
    user.lockedUntil && new Date(user.lockedUntil) > new Date();

  return (
    <tr className="transition hover:bg-slate-50/60">
      {/* User */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-extrabold text-white shadow-md">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500" dir="ltr">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${roleMeta.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${roleMeta.dot}`} />
          {isAr ? roleMeta.ar : roleMeta.en}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusMeta.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
          {isAr ? statusMeta.ar : statusMeta.en}
        </span>
        {isLocked && (
          <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            <Ban className="h-2.5 w-2.5" />
            {isAr ? 'مقفل' : 'Locked'}
          </span>
        )}
      </td>

      {/* Verified */}
      <td className="px-5 py-4">
        {user.isVerified ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {isAr ? 'موثّق' : 'Verified'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
            <XCircle className="h-4 w-4" />
            {isAr ? 'غير موثّق' : 'Not verified'}
          </span>
        )}
      </td>

      {/* Last Login */}
      <td className="px-5 py-4">
        {user.lastLoginAt ? (
          <>
            <p className="text-xs font-semibold text-slate-700">
              {new Date(user.lastLoginAt).toLocaleDateString(
                isAr ? 'ar-EG' : 'en-GB',
                { day: '2-digit', month: 'short', year: 'numeric' },
              )}
            </p>
            <p className="text-[11px] text-slate-400">
              {new Date(user.lastLoginAt).toLocaleTimeString(
                isAr ? 'ar-EG' : 'en-GB',
                { hour: '2-digit', minute: '2-digit' },
              )}
            </p>
          </>
        ) : (
          <span className="text-xs text-slate-400">
            {isAr ? 'لم يسجل بعد' : 'Never'}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-end">
        <UserActionsMenu
          user={user}
          isAr={isAr}
          onView={onView}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onResetPassword={onResetPassword}
          onDelete={onDelete}
          onUnlock={onUnlock}
          onVerify={onVerify}
        />
      </td>
    </tr>
  );
}
