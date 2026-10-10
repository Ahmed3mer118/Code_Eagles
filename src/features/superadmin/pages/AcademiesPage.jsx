import { useEffect, useState, useCallback } from 'react';
import {
  Search, Plus, RefreshCw, Eye, Trash2, CheckCircle2, XCircle,
  MoreHorizontal, GraduationCap, Users, BookOpen, X, ChevronLeft,
  ChevronRight, AlertCircle, Sparkles, Ban, PlayCircle, PauseCircle,
  CreditCard, Filter,
} from 'lucide-react';
import { tenantApi } from '../../../shared/api/tenantApi';
import { platformApi } from '../../../lib/platformApi';
import { useI18n } from '../../../shared/i18n';

export default function AcademiesPage() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [detailTenant, setDetailTenant] = useState(null);
  const [approvingTenant, setApprovingTenant] = useState(null);
  const [rejectingTenant, setRejectingTenant] = useState(null);
  const [deletingTenant, setDeletingTenant] = useState(null);
  const [changePlanTenant, setChangePlanTenant] = useState(null);
  const [changeStatusTenant, setChangeStatusTenant] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [plans, setPlans] = useState([]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await tenantApi.list({
        page, limit,
        ...(search.trim() && { search: search.trim() }),
        ...(approvalFilter && { approvalStatus: approvalFilter }),
        ...(statusFilter && { status: statusFilter }),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setData(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, search, approvalFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { platformApi.getPlans().then(setPlans).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [search, approvalFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* ============ Header ============ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t('admin.academies.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('admin.academies.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('admin.overview.refresh')}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:shadow-lg hover:shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            {t('admin.academies.addNew')}
          </button>
        </div>
      </div>

      {/* ============ Stats Row ============ */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={GraduationCap}
          label={isAr ? 'إجمالي الأكاديميات' : 'Total Academies'}
          value={total}
          tone="indigo"
        />
        <SummaryCard
          icon={CheckCircle2}
          label={isAr ? 'المعتمدة' : 'Approved'}
          value={data.filter((x) => x.approvalStatus === 'approved').length}
          tone="emerald"
        />
        <SummaryCard
          icon={XCircle}
          label={isAr ? 'قيد المراجعة' : 'Pending'}
          value={data.filter((x) => x.approvalStatus === 'pending').length}
          tone="amber"
        />
      </div>

      {/* ============ Filters ============ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {isAr ? 'الفلاتر' : 'Filters'}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.academies.search')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 ps-10 pe-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">{t('admin.academies.filters.allApprovals')}</option>
            <option value="pending">{t('admin.academies.filters.pending')}</option>
            <option value="approved">{t('admin.academies.filters.approved')}</option>
            <option value="rejected">{t('admin.academies.filters.rejected')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">{t('admin.academies.filters.allStatuses')}</option>
            <option value="active">{t('admin.academies.filters.active')}</option>
            <option value="inactive">{t('admin.academies.filters.inactive')}</option>
            <option value="suspended">{t('admin.academies.filters.suspended')}</option>
          </select>
        </div>
      </div>

      {/* ============ Table Card ============ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500">{t('admin.overview.loadingData')}</p>
          </div>
        ) : data.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <Th>{t('admin.academies.table.name')}</Th>
                    <Th>{t('admin.academies.table.owner')}</Th>
                    <Th>{t('admin.academies.table.plan')}</Th>
                    <Th>{t('admin.academies.table.approval')}</Th>
                    <Th>{t('admin.academies.table.status')}</Th>
                    <Th align="end">{t('admin.academies.table.actions')}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((tenant) => (
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      t={t}
                      isAr={isAr}
                      onView={() => setDetailTenant(tenant)}
                      onApprove={() => setApprovingTenant(tenant)}
                      onReject={() => setRejectingTenant(tenant)}
                      onChangeStatus={() => setChangeStatusTenant(tenant)}
                      onChangePlan={() => setChangePlanTenant(tenant)}
                      onDelete={() => setDeletingTenant(tenant)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
              <p className="text-xs font-semibold text-slate-500">
                {t('admin.academies.showingResults', { count: data.length, total })}
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <span className="px-3 text-sm font-bold text-slate-700">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============ Modals ============ */}
      {detailTenant && <TenantDetailModal tenant={detailTenant} t={t} onClose={() => setDetailTenant(null)} />}
      {approvingTenant && <ApproveModal tenant={approvingTenant} plans={plans} t={t} onClose={() => setApprovingTenant(null)} onSuccess={() => { setApprovingTenant(null); fetchData(true); }} />}
      {rejectingTenant && <RejectModal tenant={rejectingTenant} t={t} onClose={() => setRejectingTenant(null)} onSuccess={() => { setRejectingTenant(null); fetchData(true); }} />}
      {changePlanTenant && <ChangePlanModal tenant={changePlanTenant} plans={plans} t={t} onClose={() => setChangePlanTenant(null)} onSuccess={() => { setChangePlanTenant(null); fetchData(true); }} />}
      {changeStatusTenant && <ChangeStatusModal tenant={changeStatusTenant} t={t} onClose={() => setChangeStatusTenant(null)} onSuccess={() => { setChangeStatusTenant(null); fetchData(true); }} />}
      {deletingTenant && <DeleteModal tenant={deletingTenant} t={t} onClose={() => setDeletingTenant(null)} onSuccess={() => { setDeletingTenant(null); fetchData(true); }} />}
      {showCreate && <CreateTenantModal plans={plans} t={t} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchData(true); }} />}
    </div>
  );
}

// ============================================================
// UI Helpers
// ============================================================
function Th({ children, align = 'start' }) {
  return (
    <th
      className={`px-5 py-3.5 text-${align} text-[11px] font-extrabold tracking-wider text-slate-500`}
    >
      {children}
    </th>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-500/20' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500/20' },
  };
  const c = tones[tone] ?? tones.indigo;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-4 ${c.bg} ${c.text} ${c.ring}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-500">{label}</p>
        <p className="text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ t }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <GraduationCap className="h-8 w-8 text-slate-400" />
      </div>
      <p className="font-bold text-slate-900">{t('admin.academies.empty')}</p>
      <p className="text-sm text-slate-500">{t('admin.academies.emptyHint')}</p>
    </div>
  );
}

// ============================================================
// Tenant Row
// ============================================================
function TenantRow({ tenant, t, isAr, onView, onApprove, onReject, onChangeStatus, onChangePlan, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="transition hover:bg-slate-50/60">
      {/* Name */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-base font-extrabold text-white shadow-md">
              {tenant.name?.charAt(0) ?? '؟'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{tenant.name}</p>
            <p className="truncate text-xs text-slate-500" dir="ltr">@{tenant.slug}</p>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="px-5 py-4">
        <p className="truncate text-sm font-semibold text-slate-700">{tenant.owner?.name ?? '—'}</p>
        {tenant.owner?.email && (
          <p className="truncate text-xs text-slate-400" dir="ltr">{tenant.owner.email}</p>
        )}
      </td>

      {/* Plan */}
      <td className="px-5 py-4">
        {tenant.platformPlan?.name ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
            <Sparkles className="h-3 w-3" />
            {tenant.platformPlan.name}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-5 py-4"><ApprovalBadge status={tenant.approvalStatus} t={t} /></td>
      <td className="px-5 py-4"><StatusBadge status={tenant.status} t={t} /></td>

      {/* Actions */}
      <td className="px-5 py-4 text-end">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className={`absolute z-30 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ${isAr ? 'left-0' : 'right-0'}`}>
              <MenuItem icon={Eye} label={t('admin.academies.actions.view')} onClick={onView} />
              {tenant.approvalStatus === 'pending' && (
                <>
                  <MenuItem icon={CheckCircle2} label={t('admin.academies.actions.approve')} onClick={onApprove} tone="emerald" />
                  <MenuItem icon={XCircle} label={t('admin.academies.actions.reject')} onClick={onReject} tone="red" />
                </>
              )}
              <MenuItem icon={CreditCard} label={t('admin.academies.actions.changePlan')} onClick={onChangePlan} />
              <MenuItem icon={PauseCircle} label={t('admin.academies.actions.changeStatus')} onClick={onChangeStatus} />
              <div className="border-t border-slate-100" />
              <MenuItem icon={Trash2} label={t('admin.academies.actions.delete')} onClick={onDelete} tone="red" />
            </div>
          )}
        </div>
      </td>
    </tr>
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

function ApprovalBadge({ status, t }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${map[status] ?? map.pending}`}>
      {t(`admin.academies.filters.${status}`)}
    </span>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 ring-slate-200',
    suspended: 'bg-red-50 text-red-700 ring-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${map[status] ?? map.inactive}`}>
      {t(`admin.academies.filters.${status}`)}
    </span>
  );
}

// ============================================================
// Modal Base
// ============================================================
function Modal({ onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${maxWidth} overflow-hidden rounded-3xl bg-white shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon: Icon, title, subtitle, onClose, tone = 'indigo' }) {
  const toneClass = { indigo: 'bg-indigo-100 text-indigo-600', emerald: 'bg-emerald-100 text-emerald-600', red: 'bg-red-100 text-red-600' }[tone];
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass}`}><Icon className="h-5 w-5" /></span>
        <div>
          <h3 className="font-extrabold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function ModalFooter({ onCancel, onSubmit, loading, confirmLabel, confirmTone = 'indigo', cancelLabel }) {
  const toneClass = { indigo: 'bg-indigo-600 hover:bg-indigo-700', emerald: 'bg-emerald-600 hover:bg-emerald-700', red: 'bg-red-600 hover:bg-red-700' }[confirmTone];
  return (
    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
      <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        {cancelLabel ?? 'Cancel'}
      </button>
      <button type="button" onClick={onSubmit} disabled={loading} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${toneClass}`}>
        {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {confirmLabel}
      </button>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ============================================================
// Modals
// ============================================================
function ApproveModal({ tenant, plans, t, onClose, onSuccess }) {
  const [planId, setPlanId] = useState(tenant.requestedPlanId ?? '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await tenantApi.approve(tenant.id, { ...(planId && { platformPlanId: planId }), ...(notes && { notes }) });
      onSuccess();
    } catch (err) { setError(err?.response?.data?.message ?? 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={CheckCircle2} title={t('admin.academies.actions.approve')} subtitle={tenant.name} onClose={onClose} tone="emerald" />
      <div className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.table.plan')}</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white">
            <option value="">{t('admin.academies.useRequestedPlan')}</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price} {t('admin.academies.currency')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.notesLabel')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white" />
        </div>
        {error && <ErrorBox message={error} />}
      </div>
      <ModalFooter onCancel={onClose} onSubmit={submit} loading={loading} confirmLabel={t('admin.academies.actions.approve')} confirmTone="emerald" />
    </Modal>
  );
}

function RejectModal({ tenant, t, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (reason.trim().length < 3) { setError(t('admin.academies.reasonRequired')); return; }
    setLoading(true); setError('');
    try { await tenantApi.reject(tenant.id, { reason }); onSuccess(); }
    catch (err) { setError(err?.response?.data?.message ?? 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={XCircle} title={t('admin.academies.actions.reject')} subtitle={tenant.name} onClose={onClose} tone="red" />
      <div className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.reasonLabel')}</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} maxLength={500} placeholder={t('admin.academies.rejectReasonPlaceholder')} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-red-500 focus:bg-white" />
          <p className="mt-1 text-xs text-slate-400">{reason.length} / 500</p>
        </div>
        {error && <ErrorBox message={error} />}
      </div>
      <ModalFooter onCancel={onClose} onSubmit={submit} loading={loading} confirmLabel={t('admin.academies.actions.reject')} confirmTone="red" />
    </Modal>
  );
}

function ChangePlanModal({ tenant, plans, t, onClose, onSuccess }) {
  const [planId, setPlanId] = useState(tenant.platformPlanId ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!planId) { setError(t('admin.academies.planRequired')); return; }
    setLoading(true); setError('');
    try { await tenantApi.changePlan(tenant.id, planId); onSuccess(); }
    catch (err) { setError(err?.response?.data?.message ?? 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={CreditCard} title={t('admin.academies.actions.changePlan')} subtitle={tenant.name} onClose={onClose} />
      <div className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.table.plan')}</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white">
            <option value="">{t('admin.academies.selectPlan')}</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price} {t('admin.academies.currency')}</option>)}
          </select>
        </div>
        {error && <ErrorBox message={error} />}
      </div>
      <ModalFooter onCancel={onClose} onSubmit={submit} loading={loading} confirmLabel={t('admin.academies.actions.changePlan')} />
    </Modal>
  );
}

function ChangeStatusModal({ tenant, t, onClose, onSuccess }) {
  const [status, setStatus] = useState(tenant.status ?? 'inactive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try { await tenantApi.updateStatus(tenant.id, status); onSuccess(); }
    catch (err) { setError(err?.response?.data?.message ?? 'Failed'); }
    finally { setLoading(false); }
  };

  const options = [
    { value: 'active', icon: PlayCircle, tone: 'emerald', label: t('admin.academies.filters.active') },
    { value: 'inactive', icon: PauseCircle, tone: 'slate', label: t('admin.academies.filters.inactive') },
    { value: 'suspended', icon: Ban, tone: 'red', label: t('admin.academies.filters.suspended') },
  ];

  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={PauseCircle} title={t('admin.academies.actions.changeStatus')} subtitle={tenant.name} onClose={onClose} />
      <div className="space-y-2 p-6">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = status === opt.value;
          const toneActive = { emerald: 'border-emerald-500 bg-emerald-50', slate: 'border-slate-500 bg-slate-100', red: 'border-red-500 bg-red-50' }[opt.tone];
          return (
            <button key={opt.value} type="button" onClick={() => setStatus(opt.value)} className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-start transition ${active ? toneActive : 'border-slate-200 hover:bg-slate-50'}`}>
              <Icon className="h-5 w-5" />
              <span className="font-bold text-slate-900">{opt.label}</span>
            </button>
          );
        })}
        {error && <ErrorBox message={error} />}
      </div>
      <ModalFooter onCancel={onClose} onSubmit={submit} loading={loading} confirmLabel={t('admin.academies.actions.save')} />
    </Modal>
  );
}

function DeleteModal({ tenant, t, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try { await tenantApi.remove(tenant.id); onSuccess(); }
    catch (err) { setError(err?.response?.data?.message ?? 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <ModalHeader icon={Trash2} title={t('admin.academies.actions.delete')} subtitle={tenant.name} onClose={onClose} tone="red" />
      <div className="space-y-4 p-6">
        <p className="text-sm text-slate-600">{t('admin.academies.confirmDelete')}</p>
        {error && <ErrorBox message={error} />}
      </div>
      <ModalFooter onCancel={onClose} onSubmit={submit} loading={loading} confirmLabel={t('admin.academies.actions.delete')} confirmTone="red" />
    </Modal>
  );
}

function TenantDetailModal({ tenant, t, onClose }) {
  const [details, setDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, s] = await Promise.all([tenantApi.getOne(tenant.id), tenantApi.getStats(tenant.id).catch(() => null)]);
        setDetails(d); setStats(s);
      } finally { setLoading(false); }
    })();
  }, [tenant.id]);

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader icon={GraduationCap} title={tenant.name} subtitle={`@${tenant.slug}`} onClose={onClose} />
      <div className="max-h-[70vh] overflow-y-auto p-6">
        {loading ? <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div> : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <ApprovalBadge status={details?.approvalStatus} t={t} />
              <StatusBadge status={details?.status} t={t} />
              {details?.platformPlan?.name && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{details.platformPlan.name}</span>}
            </div>
            {details?.description && <p className="text-sm text-slate-700">{details.description}</p>}
            {stats && (
              <div className="grid grid-cols-3 gap-3">
                <StatMini icon={Users} label={t('admin.academies.statStudents')} value={stats.totalStudents ?? 0} />
                <StatMini icon={GraduationCap} label={t('admin.academies.statAssistants')} value={stats.totalAssistants ?? 0} />
                <StatMini icon={BookOpen} label={t('admin.academies.statGroups')} value={stats.totalGroups ?? 0} />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function StatMini({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-slate-500" />
      <p className="mt-1.5 text-xl font-extrabold text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-500">{label}</p>
    </div>
  );
}

function CreateTenantModal({ plans, t, onClose, onSuccess }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [form, setForm] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    ownerEmail: '', 
    requestedPlanId: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleName = (name) => {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s-]/g, '') 
      .replace(/\s+/g, '-') 
      .replace(/-+/g, '-'); 
    setForm((f) => ({ ...f, name, slug }));
  };

  const submit = async () => {
    if (form.name.trim().length < 2) return setError(t('admin.academies.nameRequired'));
    if (form.slug.trim().length < 3) return setError(t('admin.academies.slugRequired'));
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.ownerEmail.trim()) {
      return setError(isAr ? 'إيميل المدرس مطلوب' : 'Teacher email is required');
    }
    if (!emailRegex.test(form.ownerEmail.trim())) {
      return setError(isAr ? 'إيميل المدرس غير صالح' : 'Invalid teacher email format');
    }

    setLoading(true); setError('');
    try {
      await tenantApi.create({
        name: form.name.trim(), 
        slug: form.slug.trim(),
        ownerEmail: form.ownerEmail.trim(),
        ...(form.description && { description: form.description.trim() }),
        ...(form.requestedPlanId && { requestedPlanId: form.requestedPlanId }),
      });
      onSuccess();
    } catch (err) { 
      const errorCode = err?.response?.data?.message;
      
      // ✅ هنا نقوم بترجمة كود الخطأ القادم من الباك إند
      if (errorCode === 'TEACHER_EMAIL_NOT_FOUND') {
        setError(isAr
          ? 'عذراً، هذا البريد الإلكتروني غير مسجل في المنصة. يجب أن يقوم المدرس بإنشاء حساب أولاً.'
          : 'Sorry, this email is not registered on the platform. The teacher must create an account first.');
      } else {
        setError(errorCode ?? (isAr ? 'حدث خطأ أثناء إضافة الأكاديمية' : 'An error occurred while adding the academy'));
      }
    }
    finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader icon={Plus} title={t('admin.academies.addNew')} onClose={onClose} />
      <div className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.form.name')}</label>
          <input type="text" value={form.name} onChange={(e) => handleName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.form.slug')}</label>
          <input type="text" dir="ltr" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white" />
          <p className="mt-1 text-xs text-slate-400">{t('admin.academies.form.slugHint')}</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            {isAr ? 'إيميل المدرس (Owner Email)' : 'Teacher Email (Owner)'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="email" 
            dir="ltr" 
            value={form.ownerEmail} 
            onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))} 
            placeholder="teacher@example.com"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white" 
          />
          <p className="mt-1 text-xs text-slate-400">
            {isAr ? 'يجب أن يكون هذا الإيميل مسجلاً بالفعل في المنصة.' : 'This email must already be registered on the platform.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.form.description')}</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">{t('admin.academies.form.requestedPlan')}</label>
          <select value={form.requestedPlanId} onChange={(e) => setForm((f) => ({ ...f, requestedPlanId: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white">
            <option value="">{t('admin.academies.selectPlan')}</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price} {t('admin.academies.currency')}</option>)}
          </select>
        </div>
        {error && <ErrorBox message={error} />}
      </div>
      <ModalFooter onCancel={onClose} onSubmit={submit} loading={loading} confirmLabel={t('common.save')} />
    </Modal>
  );
}