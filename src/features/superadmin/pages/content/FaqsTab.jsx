// src/features/superadmin/pages/content/FaqsTab.jsx
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Globe } from 'lucide-react';
import contentService from '../../../../shared/api/contentService';
import { useI18n } from '../../../../shared/i18n';
import { broadcastUpdate } from '../../../../shared/utils/liveUpdates';

const EMPTY = {
  question: { ar: '', en: '' },
  answer: { ar: '', en: '' },
  sortOrder: 0,
  status: 'active',
};

export default function FaqsTab() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const res = await contentService.listFaqs({ page: 1, limit: 100 });
      setItems(res?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل تحميل الأسئلة' : 'Failed to load FAQs'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
    setError('');
  };

  const openEdit = (faq) => {
    setEditing(faq);
    setForm({
      question: { ar: faq.question?.ar || '', en: faq.question?.en || '' },
      answer: { ar: faq.answer?.ar || '', en: faq.answer?.en || '' },
      sortOrder: faq.sortOrder ?? 0,
      status: faq.status ?? 'active',
    });
    setModalOpen(true);
    setError('');
  };

  async function save() {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await contentService.updateFaq(editing.id, form);
      } else {
        await contentService.createFaq(form);
      }
      broadcastUpdate('faqs-updated');
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  async function remove(faq) {
    if (!window.confirm(isAr ? 'تأكيد حذف هذا السؤال؟' : 'Delete this FAQ?')) return;
    try {
      await contentService.deleteFaq(faq.id);
      broadcastUpdate('faqs-updated');
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || (isAr ? 'فشل الحذف' : 'Failed to delete'));
    }
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {isAr
              ? 'أضف، عدّل، أو احذف الأسئلة التي تظهر في اللاندنج بيدج.'
              : 'Add, edit, or remove FAQs shown on the public landing page.'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f2744] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#12325a]"
        >
          <Plus className="h-4 w-4" />
          {isAr ? 'سؤال جديد' : 'New FAQ'}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState
          isAr={isAr}
          onAdd={openCreate}
          message={isAr ? 'لا توجد أسئلة بعد' : 'No FAQs yet'}
          hint={isAr ? 'اضغط "سؤال جديد" لإضافة أول سؤال.' : 'Click "New FAQ" to add the first one.'}
        />
      ) : (
        <div className="space-y-3">
          {items.map((faq) => (
            <article
              key={faq.id}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    {faq.question?.ar || faq.question?.en || '—'}
                  </h3>
                  <StatusBadge status={faq.status} isAr={isAr} />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {faq.answer?.ar || faq.answer?.en || '—'}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <IconButton onClick={() => openEdit(faq)} icon={Pencil} tone="slate" isAr={isAr} label={isAr ? 'تعديل' : 'Edit'} />
                <IconButton onClick={() => remove(faq)} icon={Trash2} tone="red" isAr={isAr} label={isAr ? 'حذف' : 'Delete'} />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal
          onClose={() => setModalOpen(false)}
          title={editing ? (isAr ? 'تعديل السؤال' : 'Edit FAQ') : (isAr ? 'سؤال جديد' : 'New FAQ')}
          isAr={isAr}
        >
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={isAr ? 'السؤال (عربي)' : 'Question (AR)'}>
              <input
                className="input-field"
                value={form.question.ar}
                onChange={(e) => setForm({ ...form, question: { ...form.question, ar: e.target.value } })}
                dir="rtl"
              />
            </Field>
            <Field label={isAr ? 'السؤال (إنجليزي)' : 'Question (EN)'}>
              <input
                className="input-field"
                value={form.question.en}
                onChange={(e) => setForm({ ...form, question: { ...form.question, en: e.target.value } })}
                dir="ltr"
              />
            </Field>
          </div>

          <Field label={isAr ? 'الإجابة (عربي)' : 'Answer (AR)'}>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.answer.ar}
              onChange={(e) => setForm({ ...form, answer: { ...form.answer, ar: e.target.value } })}
              dir="rtl"
            />
          </Field>
          <Field label={isAr ? 'الإجابة (إنجليزي)' : 'Answer (EN)'}>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.answer.en}
              onChange={(e) => setForm({ ...form, answer: { ...form.answer, en: e.target.value } })}
              dir="ltr"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isAr ? 'الترتيب' : 'Sort order'}>
              <input
                type="number"
                className="input-field"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label={isAr ? 'الحالة' : 'Status'}>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">{isAr ? 'نشط' : 'Active'}</option>
                <option value="inactive">{isAr ? 'غير نشط' : 'Inactive'}</option>
              </select>
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0f2744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12325a] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   Shared UI
   ============================================================ */
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Modal({ children, title, onClose, isAr }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status, isAr }) {
  const isActive = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
    </span>
  );
}

function IconButton({ onClick, icon: Icon, tone = 'slate', isAr, label }) {
  const tones = {
    slate: 'border-slate-200 text-slate-600 hover:bg-slate-50',
    red: 'border-rose-200 text-rose-600 hover:bg-rose-50',
  };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function EmptyState({ isAr, onAdd, message, hint }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        <Globe className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{message}</h3>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0f2744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12325a]"
      >
        <Plus className="h-4 w-4" />
        {isAr ? 'إضافة' : 'Add'}
      </button>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-1/3 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export { Field, Modal, IconButton, StatusBadge, EmptyState, SkeletonList };
