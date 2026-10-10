import { useEffect, useState } from 'react';
import contentService from '../../../../shared/api/contentService';
import { useI18n } from '../../../../shared/i18n';

const EMPTY = {
  question: { ar: '', en: '' },
  answer: { ar: '', en: '' },
  sortOrder: 0,
  status: 'active',
};

export default function FaqsTab() {
  const { t } = useI18n();
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
      setError(e?.response?.data?.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
    setError('');
  }

  function openEdit(faq) {
    setEditing(faq);
    setForm({
      question: { ar: faq.question?.ar || '', en: faq.question?.en || '' },
      answer: { ar: faq.answer?.ar || '', en: faq.answer?.en || '' },
      sortOrder: faq.sortOrder ?? 0,
      status: faq.status ?? 'active',
    });
    setModalOpen(true);
    setError('');
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await contentService.updateFaq(editing.id, form);
      } else {
        await contentService.createFaq(form);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function remove(faq) {
    if (!window.confirm(`Delete FAQ?`)) return;
    try {
      await contentService.deleteFaq(faq.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">FAQs</h2>
          <p className="text-xs text-slate-500">Manage frequently asked questions</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-[#0f2744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12325a]"
        >
          + New FAQ
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No FAQs yet. Click "New FAQ" to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((faq) => (
            <div
              key={faq.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">
                    {faq.question?.ar || faq.question?.en || '—'}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      faq.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {faq.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {faq.answer?.ar || faq.answer?.en || '—'}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => openEdit(faq)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(faq)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title={editing ? 'Edit FAQ' : 'New FAQ'}>
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <Field label="Question (AR)">
            <input
              className="input"
              value={form.question.ar}
              onChange={(e) =>
                setForm({ ...form, question: { ...form.question, ar: e.target.value } })
              }
            />
          </Field>
          <Field label="Question (EN)">
            <input
              className="input"
              value={form.question.en}
              onChange={(e) =>
                setForm({ ...form, question: { ...form.question, en: e.target.value } })
              }
            />
          </Field>
          <Field label="Answer (AR)">
            <textarea
              rows={3}
              className="input"
              value={form.answer.ar}
              onChange={(e) =>
                setForm({ ...form, answer: { ...form.answer, ar: e.target.value } })
              }
            />
          </Field>
          <Field label="Answer (EN)">
            <textarea
              rows={3}
              className="input"
              value={form.answer.en}
              onChange={(e) =>
                setForm({ ...form, answer: { ...form.answer, en: e.target.value } })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sort order">
              <input
                type="number"
                className="input"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-[#0f2744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12325a] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Small shared UI ---------- */
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export { Field, Modal };