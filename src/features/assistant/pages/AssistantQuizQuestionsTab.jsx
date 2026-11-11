// src/features/assistant/pages/AssistantQuizQuestionsTab.jsx
import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import assistantApi from '../api/assistantApi';

const TYPE_LABELS = {
  multiple_choice: 'اختيار من متعدد',
  multiple_select: 'اختيار متعدد',
  true_false: 'صح / خطأ',
  short_answer: 'إجابة قصيرة',
  long_answer: 'إجابة طويلة',
};

const getText = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.ar || v.en || '';
  return String(v);
};

export default function AssistantQuizQuestionsTab({ quizId, quiz, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const questions = quiz?.questions ?? [];

  const handleDelete = async (q) => {
    if (!confirm('حذف هذا السؤال؟')) return;
    try {
      await assistantApi.deleteQuestion(quizId, q.id);
      onRefresh?.();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">الأسئلة ({questions.length})</h2>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
          <Plus size={16} /> إضافة سؤال
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-500 bg-white dark:bg-gray-900 rounded-xl border">
          لا توجد أسئلة بعد.
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white dark:bg-gray-900 rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">
                    سؤال {i + 1} · {TYPE_LABELS[q.type] || q.type} · {q.marks} درجة
                  </p>
                  <p className="font-medium mb-2">{getText(q.text)}</p>
                  {q.options?.length > 0 && (
                    <ul className="text-sm space-y-1">
                      {q.options.map((o) => (
                        <li key={o.id} className={o.isCorrect ? 'text-emerald-600 font-medium' : ''}>
                          {o.isCorrect ? '✓ ' : '• '}{getText(o.text)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditing(q)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(q)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuestionModal quizId={quizId} open={showAdd} onClose={() => setShowAdd(false)}
        onSuccess={() => { setShowAdd(false); onRefresh?.(); }} />
      <QuestionModal quizId={quizId} open={!!editing} initial={editing}
        onClose={() => setEditing(null)}
        onSuccess={() => { setEditing(null); onRefresh?.(); }} />
    </div>
  );
}

function QuestionModal({ quizId, open, onClose, initial, onSuccess }) {
  const isEdit = !!initial;
  const [type, setType] = useState('multiple_choice');
  const [textAr, setTextAr] = useState('');
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([
    { ar: '', isCorrect: false },
    { ar: '', isCorrect: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // reset on open
  if (open && initial && textAr === '' && getText(initial.text) !== '') {
    setType(initial.type);
    setTextAr(getText(initial.text));
    setMarks(initial.marks);
    setOptions((initial.options || []).map((o) => ({
      ar: getText(o.text),
      isCorrect: o.isCorrect,
    })));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!textAr.trim()) {
      setError('نص السؤال مطلوب');
      return;
    }
    const needsOptions = ['multiple_choice', 'multiple_select', 'true_false'].includes(type);
    if (needsOptions && !options.some((o) => o.isCorrect)) {
      setError('حدد إجابة صحيحة واحدة على الأقل');
      return;
    }

    const payload = {
      type,
      text: { ar: textAr },
      marks: Number(marks),
      isRequired: true,
      ...(needsOptions && {
        options: options.map((o, i) => ({
          text: { ar: o.ar },
          isCorrect: o.isCorrect,
          sortOrder: i,
        })),
      }),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await assistantApi.updateQuestion(quizId, initial.id, payload);
      } else {
        await assistantApi.createQuestion(quizId, payload);
      }
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const needsOptions = ['multiple_choice', 'multiple_select', 'true_false'].includes(type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        dir="rtl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold">{isEdit ? 'تعديل سؤال' : 'إضافة سؤال'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {error && <div className="p-2 bg-red-50 text-red-700 text-xs rounded">{error}</div>}

          <label className="block">
            <span className="text-sm font-medium">نوع السؤال</span>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700">
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">نص السؤال *</span>
            <textarea required value={textAr} onChange={(e) => setTextAr(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">الدرجة</span>
            <input type="number" min={1} value={marks} onChange={(e) => setMarks(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700" />
          </label>

          {needsOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">الخيارات</span>
                <button type="button"
                  onClick={() => setOptions((p) => [...p, { ar: '', isCorrect: false }])}
                  className="text-xs text-primary-600 hover:underline">
                  + إضافة خيار
                </button>
              </div>
              <div className="space-y-2">
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type={type === 'multiple_select' ? 'checkbox' : 'radio'}
                      name="correct"
                      checked={o.isCorrect}
                      onChange={(e) => {
                        setOptions((p) => p.map((x, idx) => ({
                          ...x,
                          isCorrect: type === 'multiple_select'
                            ? idx === i ? e.target.checked : x.isCorrect
                            : idx === i,
                        })));
                      }} />
                    <input type="text" value={o.ar} placeholder={`خيار ${i + 1}`}
                      onChange={(e) => setOptions((p) => p.map((x, idx) => idx === i ? { ...x, ar: e.target.value } : x))}
                      className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700" />
                    {options.length > 2 && (
                      <button type="button"
                        onClick={() => setOptions((p) => p.filter((_, idx) => idx !== i))}
                        className="text-red-500 text-xs">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t">
          <button type="submit" disabled={saving}
            className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">إلغاء</button>
        </div>
      </form>
    </div>
  );
}