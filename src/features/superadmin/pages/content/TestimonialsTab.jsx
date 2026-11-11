// src/features/superadmin/pages/content/TestimonialsTab.jsx
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Trash2, Star, Filter } from 'lucide-react';
import contentService from '../../../../shared/api/contentService';
import { useI18n } from '../../../../shared/i18n';
import { broadcastUpdate } from '../../../../shared/utils/liveUpdates';

const FILTERS = [
  { value: '',        ar: 'الكل',       en: 'All' },
  { value: 'pending', ar: 'قيد المراجعة', en: 'Pending' },
  { value: 'approved', ar: 'معتمد',      en: 'Approved' },
  { value: 'rejected', ar: 'مرفوض',     en: 'Rejected' },
];

export default function TestimonialsTab() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await contentService.listTestimonials({
        page: 1,
        limit: 100,
        status: filter || undefined,
      });
      setItems(res?.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    await contentService.approveTestimonial(id);
    broadcastUpdate('testimonials-updated');
    await load();
  };

  const reject = async (id) => {
    const reason = window.prompt(isAr ? 'سبب الرفض؟' : 'Reason for rejection?') || undefined;
    await contentService.rejectTestimonial(id, reason);
    broadcastUpdate('testimonials-updated');
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm(isAr ? 'تأكيد حذف هذا الرأي؟' : 'Delete this testimonial?')) return;
    await contentService.deleteTestimonial(id);
    broadcastUpdate('testimonials-updated');
    await load();
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isAr ? 'آراء العملاء' : 'Testimonials'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {isAr
              ? 'راجع آراء المستخدمين واعتمدها لعرضها في اللاندنج بيدج.'
              : 'Review user testimonials and approve them to display on the landing page.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <Filter className="ms-2 h-3.5 w-3.5 text-slate-400" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            {isAr ? f.ar : f.en}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
          <p className="text-sm text-slate-500">
            {isAr ? 'لا توجد آراء مطابقة' : 'No testimonials found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((t) => (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              isAr={isAr}
              onApprove={() => approve(t.id)}
              onReject={() => reject(t.id)}
              onDelete={() => remove(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ testimonial: t, isAr, onApprove, onReject, onDelete }) {
  const statusColor =
    t.status === 'approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : t.status === 'rejected'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const statusLabel =
    t.status === 'approved'
      ? isAr ? 'معتمد' : 'Approved'
      : t.status === 'rejected'
      ? isAr ? 'مرفوض' : 'Rejected'
      : isAr ? 'قيد المراجعة' : 'Pending';

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {t.avatarUrl ? (
            <img src={t.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0f2744] to-[#12325a] text-xs font-bold text-white">
              {(t.name?.[0] || '?').toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-800">
              {t.name || (isAr ? 'مجهول' : 'Anonymous')}
            </div>
            <div className="truncate text-[11px] text-slate-500">
              {t.role || '—'}
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mb-3 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-600">
        {t.content?.ar || t.content?.en || '—'}
      </p>

      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-3.5 w-3.5 ${
              n <= (t.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>

      <div className="mt-auto flex gap-1.5 border-t border-slate-100 pt-3">
        {t.status !== 'approved' && (
          <button
            onClick={onApprove}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isAr ? 'اعتماد' : 'Approve'}
          </button>
        )}
        {t.status !== 'rejected' && (
          <button
            onClick={onReject}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
          >
            <XCircle className="h-3.5 w-3.5" />
            {isAr ? 'رفض' : 'Reject'}
          </button>
        )}
        <button
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-slate-100" />
            <div className="flex-1">
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="mt-1 h-2 w-1/3 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-3 h-3 w-full rounded bg-slate-100" />
          <div className="mt-1 h-3 w-2/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
