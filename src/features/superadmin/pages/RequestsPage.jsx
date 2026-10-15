import { useEffect, useMemo, useState } from 'react';
import { subscriptionRequestsService } from '../../../shared/api/subscriptionRequestsService';
import { useI18n } from '../../../shared/i18n';

const TABS = [
  { key: 'all',           ar: 'الكل',              en: 'All' },
  { key: 'pending',       ar: 'طلبات جديدة',        en: 'New Requests' },
  { key: 'under_review',  ar: 'بانتظار الدفع',      en: 'Awaiting Payment' },
  { key: 'approved',      ar: 'مفعّلة',             en: 'Active' },
  { key: 'rejected',      ar: 'مرفوضة',            en: 'Rejected' },
];

const STATUS_META = {
  pending:      { ar: 'قيد المراجعة', en: 'Pending',          color: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500' },
  under_review: { ar: 'بانتظار الدفع', en: 'Awaiting Payment', color: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  approved:     { ar: 'مفعّلة',       en: 'Active',           color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected:     { ar: 'مرفوضة',       en: 'Rejected',         color: 'bg-rose-50 text-rose-700 border-rose-200',         dot: 'bg-rose-500' },
};

const PAYMENT_META = {
  awaiting_payment: { ar: 'لم يُرفع الإيصال',     en: 'Awaiting proof',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  under_review:     { ar: 'الإيصال قيد المراجعة', en: 'Proof under review',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved:         { ar: 'الدفع مؤكّد',          en: 'Payment confirmed',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected:         { ar: 'الإيصال مرفوض',        en: 'Proof rejected',      color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function RequestsPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [tab, setTab]         = useState('all');
  const [search, setSearch]   = useState('');
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [actionId, setActionId] = useState(null);

  const [approveModal, setApproveModal]   = useState(null);
  const [approveAmount, setApproveAmount] = useState('');
  const [approveNotes, setApproveNotes]   = useState('');
  const [approveSaving, setApproveSaving] = useState(false);

  const [rejectModal, setRejectModal]         = useState(null);
  const [rejectReason, setRejectReason]       = useState('');
  const [rejectSaving, setRejectSaving]       = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await subscriptionRequestsService.list();
      setItems(res?.data ?? res ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل تحميل الطلبات' : 'Failed to load requests'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openApproveModal = (sub) => {
    setApproveModal(sub);
    setApproveAmount(String(Number(sub.amount) || 0));
    setApproveNotes(sub.notes || '');
  };

  const submitApprovePlan = async () => {
    if (!approveModal) return;
    try {
      setApproveSaving(true);
      await subscriptionRequestsService.approvePlan(approveModal.id, {
        amount: Number(approveAmount),
        notes: approveNotes.trim() || undefined,
      });
      setApproveModal(null);
      await fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل الموافقة' : 'Approve failed'));
    } finally {
      setApproveSaving(false);
    }
  };

  const handleApprovePayment = async (sub) => {
    const ok = window.confirm(
      isAr
        ? `تأكيد استلام الدفع لطلب "${sub.tenant?.name}" وتفعيل الباقة؟`
        : `Confirm payment received for "${sub.tenant?.name}" and activate the plan?`,
    );
    if (!ok) return;
    try {
      setActionId(sub.id);
      await subscriptionRequestsService.approvePayment(sub.id);
      await fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل تأكيد الدفع' : 'Approve payment failed'));
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (sub, mode) => {
    setRejectModal({ sub, mode });
    setRejectReason('');
  };

  const submitReject = async () => {
    if (!rejectModal) return;
    try {
      setRejectSaving(true);
      const { sub, mode } = rejectModal;
      if (mode === 'plan') {
        await subscriptionRequestsService.rejectPlan(sub.id, rejectReason.trim());
      } else {
        await subscriptionRequestsService.rejectPayment(sub.id, rejectReason.trim());
      }
      setRejectModal(null);
      await fetchData();
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل الرفض' : 'Reject failed'));
    } finally {
      setRejectSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (tab !== 'all' && it.status !== tab) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        it.tenant?.name?.toLowerCase().includes(q) ||
        it.plan?.toLowerCase().includes(q) ||
        it.tenant?.owner?.email?.toLowerCase().includes(q)
      );
    });
  }, [items, tab, search]);

  const counts = useMemo(() => {
    const c = { all: items.length, pending: 0, under_review: 0, approved: 0, rejected: 0 };
    items.forEach((it) => { if (c[it.status] !== undefined) c[it.status]++; });
    return c;
  }, [items]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isAr ? 'طلبات الاشتراك' : 'Subscription Requests'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAr ? 'مراجعة الطلبات وإثباتات الدفع' : 'Review requests and payment proofs'}
          </p>
        </div>
        <button onClick={fetchData} disabled={loading} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium">
          {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث' : 'Refresh')}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={isAr ? 'طلبات جديدة' : 'New'} value={counts.pending} color="amber" />
        <StatCard label={isAr ? 'بانتظار الدفع' : 'Awaiting'} value={counts.under_review} color="blue" />
        <StatCard label={isAr ? 'مفعّلة' : 'Active'} value={counts.approved} color="emerald" />
        <StatCard label={isAr ? 'مرفوضة' : 'Rejected'} value={counts.rejected} color="rose" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                tab === t.key ? 'bg-amber-400 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isAr ? t.ar : t.en}
              <span className={`ms-2 text-xs ${tab === t.key ? 'text-white/80' : 'text-slate-400'}`}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث باسم المدرسة...' : 'Search by school...'}
            className="input-lite !ps-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          {isAr ? 'لا توجد طلبات مطابقة' : 'No matching requests'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((it) => (
            <RequestCard
              key={it.id}
              item={it}
              isAr={isAr}
              loading={actionId === it.id}
              onApprovePlan={() => openApproveModal(it)}
              onRejectPlan={() => openRejectModal(it, 'plan')}
              onApprovePayment={() => handleApprovePayment(it)}
              onRejectPayment={() => openRejectModal(it, 'payment')}
            />
          ))}
        </div>
      )}

      {/* Approve Plan Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !approveSaving && setApproveModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {isAr ? 'الموافقة على الطلب' : 'Approve Request'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {approveModal.tenant?.name} → <span className="font-mono">{approveModal.plan}</span>
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isAr ? 'المبلغ المطلوب (ج.م) *' : 'Amount (EGP) *'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  className="input-lite"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isAr ? 'تعليمات الدفع' : 'Payment instructions'}
                </span>
                <textarea
                  rows={4}
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  className="input-lite resize-none"
                  placeholder={isAr ? 'مثال: تحويل على حساب بنك مصر 123456789' : 'E.g. Transfer to Bank Misr account 123456789'}
                />
              </label>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setApproveModal(null)} disabled={approveSaving} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={submitApprovePlan} disabled={approveSaving} className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-sm disabled:opacity-50">
                {approveSaving ? '...' : (isAr ? 'تأكيد الموافقة' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !rejectSaving && setRejectModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {rejectModal.mode === 'plan'
                  ? (isAr ? 'رفض الطلب' : 'Reject Request')
                  : (isAr ? 'رفض إثبات الدفع' : 'Reject Payment Proof')}
              </h3>
            </div>

            <div className="px-6 py-5">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isAr ? 'السبب' : 'Reason'}
                </span>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input-lite resize-none"
                  placeholder={isAr ? 'اكتب سبباً واضحاً...' : 'Write a clear reason...'}
                />
              </label>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setRejectModal(null)} disabled={rejectSaving} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={submitReject} disabled={rejectSaving} className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-sm disabled:opacity-50">
                {rejectSaving ? '...' : (isAr ? 'تأكيد الرفض' : 'Confirm Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Sub Components */

function StatCard({ label, value, color }) {
  const colors = {
    amber:   'bg-amber-50 text-amber-700 border-amber-100',
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose:    'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs font-semibold opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function RequestCard({ item, isAr, loading, onApprovePlan, onRejectPlan, onApprovePayment, onRejectPayment }) {
  const meta = STATUS_META[item.status] || STATUS_META.pending;
  const paymentMeta = item.paymentStatus ? PAYMENT_META[item.paymentStatus] : null;

  const canApprovePlan   = item.status === 'pending';
  const canReviewPayment = item.status === 'under_review' && item.paymentStatus === 'under_review';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {item.tenant?.logoUrl ? (
            <img src={item.tenant.logoUrl} alt="" className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
              {item.tenant?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 truncate">{item.tenant?.name || '-'}</h3>
            <p className="text-xs text-slate-400 font-mono truncate">{item.tenant?.slug}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {isAr ? meta.ar : meta.en}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info label={isAr ? 'الباقة' : 'Plan'} value={item.plan || '-'} />
        <Info label={isAr ? 'المبلغ' : 'Amount'} value={item.amount ? `${Number(item.amount).toLocaleString('en-EG')} ج.م` : '-'} />
        <Info label={isAr ? 'المدة' : 'Period'} value={`${item.periodMonths} ${isAr ? 'شهر' : 'mo'}`} />
        <Info label={isAr ? 'تاريخ الطلب' : 'Requested'} value={new Date(item.createdAt).toLocaleDateString('en-GB')} />
        {item.tenant?.owner?.name && <Info label={isAr ? 'المالك' : 'Owner'} value={item.tenant.owner.name} />}
        {item.tenant?.owner?.email && <Info label={isAr ? 'البريد' : 'Email'} value={item.tenant.owner.email} />}
      </div>

      {item.notes && item.status === 'under_review' && (
        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
          <div className="font-semibold mb-1">{isAr ? 'تعليمات الدفع:' : 'Payment instructions:'}</div>
          <div className="whitespace-pre-line">{item.notes}</div>
        </div>
      )}

      {paymentMeta && (
        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${paymentMeta.color}`}>
          💳 {isAr ? paymentMeta.ar : paymentMeta.en}
        </div>
      )}

      {item.paymentProofUrl && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-500 mb-1.5">
            {isAr ? 'إيصال الدفع:' : 'Payment receipt:'}
          </div>
          <a href={item.paymentProofUrl} target="_blank" rel="noreferrer" className="block">
            <img
              src={item.paymentProofUrl}
              alt="Proof"
              className="w-full max-h-56 object-contain rounded-lg border border-slate-200 bg-slate-50 hover:border-amber-300 transition"
            />
          </a>
        </div>
      )}

      {item.rejectionReason && (
        <div className="mt-4 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-700">
          <span className="font-semibold">{isAr ? 'سبب الرفض: ' : 'Reason: '}</span>
          {item.rejectionReason}
        </div>
      )}

      <div className="mt-auto pt-5 flex items-center gap-2">
        {canApprovePlan && (
          <>
            <button onClick={onApprovePlan} disabled={loading} className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-sm disabled:opacity-50">
              {isAr ? '✓ موافقة' : '✓ Approve'}
            </button>
            <button onClick={onRejectPlan} disabled={loading} className="flex-1 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold disabled:opacity-50">
              {isAr ? '✕ رفض' : '✕ Reject'}
            </button>
          </>
        )}

        {canReviewPayment && (
          <>
            <button onClick={onApprovePayment} disabled={loading} className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-sm disabled:opacity-50">
              {loading ? '...' : (isAr ? '✓ تأكيد الدفع' : '✓ Confirm Payment')}
            </button>
            <button onClick={onRejectPayment} disabled={loading} className="flex-1 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold disabled:opacity-50">
              {isAr ? '✕ رفض الإيصال' : '✕ Reject Proof'}
            </button>
          </>
        )}

        {item.status === 'under_review' && item.paymentStatus !== 'under_review' && (
          <div className="w-full text-center text-xs text-blue-500 py-2">
            ⏳ {isAr ? 'بانتظار رفع إثبات الدفع من المدرس' : 'Waiting for teacher to upload proof'}
          </div>
        )}

        {item.status === 'approved' && (
          <div className="w-full text-center text-xs text-emerald-500 py-2 font-semibold">
            ✅ {isAr ? 'تم التفعيل بنجاح' : 'Activated successfully'}
          </div>
        )}

        {item.status === 'rejected' && (
          <div className="w-full text-center text-xs text-rose-500 py-2 font-semibold">
            ❌ {isAr ? 'مرفوض' : 'Rejected'}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-slate-400 font-medium">{label}</div>
      <div className="text-slate-800 text-sm font-semibold truncate">{value}</div>
    </div>
  );
}