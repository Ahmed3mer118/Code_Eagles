import { useEffect, useState } from 'react';
import contentService from '../../../../shared/api/contentService';
import { Modal } from './FaqsTab';

export default function TestimonialsTab() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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

  async function approve(id) {
    await contentService.approveTestimonial(id);
    await load();
  }

  async function reject(id) {
    const reason = window.prompt('Reason for rejection?') || undefined;
    await contentService.rejectTestimonial(id, reason);
    await load();
  }

  async function remove(id) {
    if (!window.confirm('Delete this testimonial?')) return;
    await contentService.deleteTestimonial(id);
    await load();
  }

  const statusColor = (s) =>
    s === 'approved'
      ? 'bg-emerald-50 text-emerald-700'
      : s === 'rejected'
      ? 'bg-red-50 text-red-700'
      : 'bg-amber-50 text-amber-700';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">Testimonials</h2>
          <p className="text-xs text-slate-500">Review and approve user testimonials</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === s
                  ? 'bg-[#0f2744] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No testimonials found.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {(t.name?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {t.name || 'Anonymous'}
                    </div>
                    <div className="text-[11px] text-slate-500">{t.role || '—'}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(
                    t.status,
                  )}`}
                >
                  {t.status}
                </span>
              </div>

              <p className="mb-2 line-clamp-3 text-xs text-slate-600">
                {t.content?.ar || t.content?.en || '—'}
              </p>

              <div className="flex items-center gap-2">
                {t.rating && (
                  <span className="text-xs text-amber-500">
                    {'★'.repeat(t.rating)}
                    {'☆'.repeat(5 - t.rating)}
                  </span>
                )}
                <div className="ms-auto flex gap-1.5">
                  {t.status !== 'approved' && (
                    <button
                      onClick={() => approve(t.id)}
                      className="rounded-lg bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                  )}
                  {t.status !== 'rejected' && (
                    <button
                      onClick={() => reject(t.id)}
                      className="rounded-lg bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.id)}
                    className="rounded-lg bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}