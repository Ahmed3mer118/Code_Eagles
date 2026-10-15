import { useEffect, useState, useMemo, useRef } from 'react';
import { platformPlansService } from '../../shared/api/platformPlansService';
import { subscriptionRequestsService } from '../../shared/api/subscriptionRequestsService';
import { useI18n } from '../../shared/i18n';

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */

const STATUS_META = {
  pending:      { ar: 'قيد المراجعة',       en: 'Pending',          color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: '⏳' },
  under_review: { ar: 'بانتظار الدفع',      en: 'Awaiting Payment', color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: '💳' },
  approved:     { ar: 'مفعّلة',             en: 'Active',           color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅' },
  rejected:     { ar: 'مرفوضة',            en: 'Rejected',         color: 'bg-rose-50 text-rose-700 border-rose-200',         icon: '❌' },
  expired:      { ar: 'منتهية',             en: 'Expired',          color: 'bg-slate-100 text-slate-600 border-slate-200',     icon: '⏰' },
  cancelled:    { ar: 'ملغاة',              en: 'Cancelled',        color: 'bg-slate-100 text-slate-600 border-slate-200',     icon: '🚫' },
};

const PLAN_FEATURES = [
  { key: 'groups',       ar: 'المجموعات',         en: 'Groups' },
  { key: 'lessons',      ar: 'الدروس',            en: 'Lessons' },
  { key: 'quizzes',      ar: 'الاختبارات',        en: 'Quizzes' },
  { key: 'assignments',  ar: 'الواجبات',          en: 'Assignments' },
  { key: 'certificates', ar: 'الشهادات',          en: 'Certificates' },
  { key: 'assistants',   ar: 'المساعدون',         en: 'Assistants' },
  { key: 'payments',     ar: 'المدفوعات',         en: 'Payments' },
  { key: 'leaderboard',  ar: 'المتصدرون',         en: 'Leaderboard' },
  { key: 'discussions',  ar: 'النقاشات',          en: 'Discussions' },
];

/* ─────────────────────────────────────────────
   useTenantId — يقرأ من ce_*
   ───────────────────────────────────────────── */

function useTenantId() {
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const direct = localStorage.getItem('ce_tenant_id');
    if (direct) return direct;
    const token = localStorage.getItem('ce_access_token');
    if (token) {
      try {
        const p = JSON.parse(atob(token.split('.')[1]));
        if (p?.tenantId) return p.tenantId;
      } catch {}
    }
    return '';
  });

  useEffect(() => {
    const h = () => setTenantId(localStorage.getItem('ce_tenant_id') || '');
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  return tenantId;
}

/* ─────────────────────────────────────────────
   Page Component
   ───────────────────────────────────────────── */

export default function MySubscriptionPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const tenantId = useTenantId();

  const [plans, setPlans]               = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [mySub, setMySub]               = useState(null);
  const [loadingSub, setLoadingSub]     = useState(true);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const [requestModal, setRequestModal] = useState(null);
  const [notes, setNotes]               = useState('');
  const [submitting, setSubmitting]     = useState(false);

  const [proofFile, setProofFile]       = useState(null);
  const [uploading, setUploading]       = useState(false);
  const fileInputRef                    = useRef(null);

  /* ── Fetch plans ── */
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await platformPlansService.list();
      const all = res?.data ?? res ?? [];
      setPlans(all.filter((p) => p.status === 'active'));
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل تحميل الباقات' : 'Failed to load plans'));
    } finally {
      setLoadingPlans(false);
    }
  };

  /* ── Fetch my sub ── */
  const fetchMySub = async () => {
    if (!tenantId) { setLoadingSub(false); return; }
    try {
      setLoadingSub(true);
      const res = await subscriptionRequestsService.getMySubscription(tenantId);
      setMySub(res);
    } catch {
      setMySub(null);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);
  useEffect(() => { fetchMySub(); }, [tenantId]);

  /* ── Handlers ── */
  const openRequestModal = (plan) => {
    if (!tenantId) {
      setError(isAr ? 'معرّف المدرسة غير متوفر. أعد تسجيل الدخول.' : 'School ID unavailable. Please re-login.');
      return;
    }
    setRequestModal(plan);
    setNotes('');
    setError('');
    setSuccess('');
  };

  const closeRequestModal = () => { if (!submitting) setRequestModal(null); };

  const submitRequest = async () => {
    if (!requestModal || !tenantId) return;
    try {
      setSubmitting(true);
      setError('');
      await subscriptionRequestsService.request({
        tenantId,
        plan: requestModal.slug,
        periodMonths: requestModal.periodMonths,
        ...(notes.trim() && { notes: notes.trim() }),
      });
      setSuccess(isAr ? 'تم إرسال طلب الاشتراك بنجاح!' : 'Request sent successfully!');
      setRequestModal(null);
      await fetchMySub();
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل إرسال الطلب' : 'Failed to send request'));
    } finally {
      setSubmitting(false);
    }
  };

  /* ═════════════════════════════════════════════
     ⭐ رفع إثبات الدفع على Cloudinary
     ═════════════════════════════════════════════ */
  const submitProof = async () => {
    if (!proofFile || !mySub?.pending?.id) {
      setError(isAr ? 'اختر صورة الإيصال أولاً' : 'Choose a receipt image first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      console.log('📤 Uploading to Cloudinary...', proofFile.name, proofFile.size);

      // ⭐ استخدم uploadImage (مش uploadFile) — بيروح على Cloudinary في مجلد payment-proofs
      const uploaded = await subscriptionRequestsService.uploadImage(
        proofFile,
        'payment-proofs',
      );

      console.log('✅ Upload response:', uploaded);

      // Cloudinary بيرجّع url مباشر
      const url = uploaded?.url || uploaded?.data?.url;
      if (!url) throw new Error('Upload failed: no URL returned');

      console.log('📤 Saving proof URL to backend...', url);

      await subscriptionRequestsService.submitPaymentProof(mySub.pending.id, url);

      setSuccess(
        isAr
          ? 'تم رفع الإيصال بنجاح! في انتظار المراجعة.'
          : 'Proof uploaded! Awaiting review.',
      );
      setProofFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchMySub();
    } catch (e) {
      console.error('❌ Upload failed:', e);
      const raw = e?.response?.data?.message || e?.message;
      const msg = Array.isArray(raw)
        ? raw.join(' • ')
        : raw || (isAr ? 'فشل رفع الإيصال' : 'Failed to upload proof');
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  /* ── Helpers ── */
  const currentPlan = useMemo(() => {
    if (!mySub?.current) return null;
    return plans.find((p) => p.slug === mySub.current.plan) || null;
  }, [mySub, plans]);

  const pending      = mySub?.pending;
  const hasPending   = !!pending;
  const isCurrent    = (plan) => currentPlan?.slug === plan.slug;

  /* ── Render ── */
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {isAr ? 'الاشتراك والباقات' : 'Subscription & Plans'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isAr ? 'اختر الباقة المناسبة لمدرستك وأرسل طلب الاشتراك' : 'Choose a plan and submit your request'}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm flex items-start gap-2">
          <span>⚠️</span><span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-rose-400">✕</button>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm flex items-start gap-2">
          <span>✅</span><span className="flex-1">{success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-400">✕</button>
        </div>
      )}

      {/* Current Plan Banner */}
      {!loadingSub && currentPlan && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg">✓</div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-700">
                {isAr ? 'الاشتراك الحالي' : 'Current Subscription'}
              </div>
              <div className="text-lg font-bold text-slate-800 mt-0.5">{currentPlan.name}</div>
              {mySub.current.expiresAt && (
                <div className="text-xs text-slate-500 mt-0.5">
                  {isAr ? 'ينتهي في: ' : 'Expires: '}
                  {new Date(mySub.current.expiresAt).toLocaleDateString('en-GB')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Request + Payment Flow */}
      {!loadingSub && pending && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500">
                {isAr ? 'طلب اشتراك جارٍ' : 'Ongoing Subscription Request'}
              </div>
              <div className="text-xl font-bold text-slate-800 mt-1">
                {isAr ? 'الباقة المطلوبة: ' : 'Requested plan: '}
                <span className="text-amber-600">{pending.plan}</span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_META[pending.status]?.color}`}>
              {STATUS_META[pending.status]?.icon} {isAr ? STATUS_META[pending.status]?.ar : STATUS_META[pending.status]?.en}
            </span>
          </div>

          {/* Status Flow Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 py-3">
            <Step active={true} done={true} label={isAr ? 'إرسال الطلب' : 'Request sent'} />
            <Step
              active={pending.status !== 'pending'}
              done={pending.status === 'under_review' || pending.status === 'approved'}
              label={isAr ? 'مراجعة الإدارة' : 'Admin review'}
            />
            <Step
              active={['under_review', 'approved'].includes(pending.status)}
              done={pending.paymentStatus === 'approved'}
              label={isAr ? 'دفع ومراجعة' : 'Payment & review'}
            />
            <Step
              active={pending.status === 'approved'}
              done={pending.status === 'approved'}
              label={isAr ? 'تفعيل الاشتراك' : 'Activated'}
            />
          </div>

          {/* Status pending */}
          {pending.status === 'pending' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              ⏳ {isAr ? 'طلبك قيد المراجعة من الإدارة. سيتم إعلامك بالمبلغ المطلوب قريباً.' : 'Your request is under admin review. Amount will be shared shortly.'}
            </div>
          )}

          {/* Status under_review — Payment needed */}
          {pending.status === 'under_review' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">
                    {isAr ? 'المبلغ المطلوب' : 'Amount to pay'}
                  </span>
                  <span className="text-xl font-bold text-blue-900">
                    {Number(pending.amount || 0).toLocaleString('en-EG')} ج.م
                  </span>
                </div>

                {pending.notes && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="text-xs font-semibold text-blue-700 mb-1">
                      {isAr ? 'تعليمات الدفع:' : 'Payment instructions:'}
                    </div>
                    <div className="text-sm text-blue-900 whitespace-pre-line">
                      {pending.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* ⭐ Upload section — awaiting payment */}
              {(!pending.paymentStatus || pending.paymentStatus === 'awaiting_payment') && (
                <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 space-y-3">
                  <div className="text-sm font-semibold text-amber-800">
                    💳 {isAr ? 'ارفع صورة إيصال التحويل' : 'Upload your payment receipt'}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      console.log('📎 Selected:', f?.name, f?.size);
                      setProofFile(f);
                    }}
                    className="block w-full text-sm text-slate-600 file:me-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                  />

                  {/* Preview */}
                  {proofFile && (
                    <div className="p-3 rounded-lg bg-white border border-amber-200">
                      <div className="text-xs text-amber-700 font-semibold mb-2">
                        ✅ {proofFile.name} ({(proofFile.size / 1024).toFixed(1)} KB)
                      </div>
                      <img
                        src={URL.createObjectURL(proofFile)}
                        alt="preview"
                        className="max-h-40 rounded border border-amber-100"
                      />
                    </div>
                  )}

                  <button
                    onClick={submitProof}
                    disabled={!proofFile || uploading}
                    className="w-full px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading
                      ? (isAr ? '⏳ جاري الرفع...' : '⏳ Uploading...')
                      : (isAr ? '📤 إرسال إثبات الدفع' : '📤 Submit payment proof')}
                  </button>

                  {!proofFile && (
                    <div className="text-xs text-amber-700 text-center">
                      {isAr ? 'اختر صورة أولاً' : 'Choose an image first'}
                    </div>
                  )}
                </div>
              )}

              {/* Proof under review */}
              {pending.paymentStatus === 'under_review' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="text-sm font-semibold text-blue-800 mb-2">
                    🔍 {isAr ? 'الإيصال قيد المراجعة' : 'Proof under review'}
                  </div>
                  {pending.paymentProofUrl && (
                    <a href={pending.paymentProofUrl} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={pending.paymentProofUrl}
                        alt="Proof"
                        className="max-h-48 rounded-lg border border-blue-200 bg-white"
                      />
                    </a>
                  )}
                  <div className="text-xs text-blue-600 mt-2">
                    {isAr ? 'سيتم التحقق من التحويل وإعلامك بالنتيجة.' : 'We will verify the transfer and notify you.'}
                  </div>
                </div>
              )}

              {/* Proof rejected — allow re-upload */}
              {pending.paymentStatus === 'rejected' && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 space-y-3">
                  <div className="text-sm font-semibold text-rose-800">
                    ❌ {isAr ? 'تم رفض إثبات الدفع' : 'Payment proof rejected'}
                  </div>
                  {pending.rejectionReason && (
                    <div className="text-xs text-rose-700 bg-white rounded border border-rose-100 p-2">
                      <span className="font-semibold">{isAr ? 'السبب: ' : 'Reason: '}</span>
                      {pending.rejectionReason}
                    </div>
                  )}
                  <div className="text-xs text-rose-600">
                    {isAr ? 'يمكنك رفع إيصال جديد.' : 'You can upload a new proof.'}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      console.log('📎 Selected (retry):', f?.name, f?.size);
                      setProofFile(f);
                    }}
                    className="block w-full text-sm text-slate-600 file:me-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer"
                  />

                  {proofFile && (
                    <div className="p-3 rounded-lg bg-white border border-rose-200">
                      <div className="text-xs text-rose-700 font-semibold mb-2">
                        ✅ {proofFile.name}
                      </div>
                      <img
                        src={URL.createObjectURL(proofFile)}
                        alt="preview"
                        className="max-h-40 rounded border border-rose-100"
                      />
                    </div>
                  )}

                  <button
                    onClick={submitProof}
                    disabled={!proofFile || uploading}
                    className="w-full px-4 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading
                      ? (isAr ? '⏳ جاري الرفع...' : '⏳ Uploading...')
                      : (isAr ? '📤 رفع إيصال جديد' : '📤 Upload new proof')}
                  </button>
                </div>
              )}

              {/* Payment approved */}
              {pending.paymentStatus === 'approved' && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  ✅ {isAr ? 'تم تأكيد الدفع! سيتم تفعيل الاشتراك قريباً.' : 'Payment confirmed! Subscription will be activated shortly.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plans Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">
          {isAr ? 'الباقات المتاحة' : 'Available Plans'}
        </h2>

        {loadingPlans ? (
          <div className="text-slate-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            {isAr ? 'لا توجد باقات متاحة حالياً' : 'No plans available'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const cur = isCurrent(plan);
              const disableRequest = hasPending || !tenantId;

              return (
                <div key={plan.id} className={`rounded-xl border bg-white p-5 flex flex-col shadow-sm transition ${cur ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200 hover:shadow-md'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{plan.slug}</p>
                    </div>
                    {cur && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        ✓ {isAr ? 'مُفعّلة' : 'Active'}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-2xl font-bold text-slate-800">
                      {Number(plan.price) === 0 ? (isAr ? 'مجاناً' : 'Free') : `${Number(plan.price).toLocaleString('en-EG')} ج.م`}
                      {Number(plan.price) > 0 && (
                        <span className="text-sm font-normal text-slate-400 ms-1">/ {plan.periodMonths} {isAr ? 'شهر' : 'mo'}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      👥 {isAr ? 'طلاب' : 'Students'}: {plan.maxStudents ?? '∞'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      🎓 {isAr ? 'مساعدين' : 'Assistants'}: {plan.maxAssistants ?? '∞'}
                    </span>
                  </div>

                  {plan.features && typeof plan.features === 'object' && (
                    <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                      {PLAN_FEATURES.filter((f) => plan.features[f.key]).slice(0, 5).map((f) => (
                        <li key={f.key} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">✓</span>
                          <span>{isAr ? f.ar : f.en}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-5">
                    {cur ? (
                      <button disabled className="w-full px-4 py-2.5 rounded-lg bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed">
                        {isAr ? 'الباقة الحالية' : 'Current Plan'}
                      </button>
                    ) : (
                      <button
                        onClick={() => openRequestModal(plan)}
                        disabled={disableRequest}
                        className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition ${
                          disableRequest
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-400 hover:bg-amber-500 text-white'
                        }`}
                      >
                        {hasPending
                          ? (isAr ? 'لديك طلب جارٍ' : 'You have an active request')
                          : !tenantId
                            ? (isAr ? 'لم يتم تحديد المدرسة' : 'No school selected')
                            : (isAr ? 'اطلب هذه الباقة' : 'Request this plan')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeRequestModal}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {isAr ? 'تأكيد طلب الاشتراك' : 'Confirm Subscription Request'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? 'سيتم مراجعة طلبك من الإدارة قريباً' : 'Your request will be reviewed by the admin soon'}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
                <Row label={isAr ? 'الباقة' : 'Plan'} value={requestModal.name || '-'} />
                <Row label={isAr ? 'المعرّف' : 'Slug'} value={requestModal.slug || '-'} mono />
                <Row label={isAr ? 'المبلغ المبدئي' : 'Price'} value={Number(requestModal.price) === 0 ? (isAr ? 'مجاناً' : 'Free') : `${Number(requestModal.price).toLocaleString('en-EG')} ج.م`} />
                <Row label={isAr ? 'المدة' : 'Duration'} value={`${requestModal.periodMonths} ${isAr ? 'شهر' : 'mo'}`} />
              </div>

              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                </span>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-lite resize-none" placeholder={isAr ? 'أي تفاصيل إضافية...' : 'Any additional details...'} />
              </label>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={closeRequestModal} disabled={submitting} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium">
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" onClick={submitRequest} disabled={submitting} className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-sm font-bold shadow-sm disabled:opacity-50">
                {submitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'تأكيد الإرسال' : 'Confirm & Send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub Components
   ───────────────────────────────────────────── */

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className={`font-bold text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}

function Step({ active, done, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'
      }`}>
        {done ? '✓' : '•'}
      </div>
      <span className={`text-xs font-medium ${active || done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}