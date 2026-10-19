import { useState, useEffect } from 'react';
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from '../../hooks/useQuizzes';

const TYPE_LABELS = {
  multiple_choice: 'اختيار من متعدد',
  multiple_select: 'اختيار متعدد',
  true_false: 'صح / خطأ',
  short_answer: 'إجابة قصيرة',
  long_answer: 'إجابة طويلة',
};

// استخراج النص من JSON object { ar, en, ... }
function getText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value.ar || value.en || '';
  return String(value);
}

export default function QuizQuestionsTab({ quizId, quiz }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const questions = quiz?.questions ?? [];
  const deleteMut = useDeleteQuestion(quizId);

  const handleDelete = async (q) => {
    if (!confirm('حذف هذا السؤال؟')) return;
    try {
      await deleteMut.mutateAsync(q.id);
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          الأسئلة ({questions.length})
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + إضافة سؤال
        </button>
      </div>

      {questions.length === 0 && (
        <div className="text-center py-10 text-gray-500 border rounded bg-white">
          لا توجد أسئلة بعد.
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white border rounded p-4 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">
                  سؤال {idx + 1} · {TYPE_LABELS[q.type] ?? q.type} · درجة:{' '}
                  {q.marks}
                </div>
                <div className="font-medium mb-2">{getText(q.text)}</div>

                {q.options?.length > 0 && (
                  <ul className="text-sm space-y-1">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        className={`flex items-center gap-2 ${
                          o.isCorrect ? 'text-green-700 font-medium' : ''
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            o.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        {getText(o.text)}
                        {o.isCorrect && (
                          <span className="text-xs">(صحيحة)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {q.explanation && (
                  <div className="text-xs text-gray-500 mt-2">
                    الشرح: {getText(q.explanation)}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditing(q)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(q)}
                  disabled={deleteMut.isPending}
                  className="text-red-600 hover:underline text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <QuestionModal
        quizId={quizId}
        open={showAdd}
        onClose={() => setShowAdd(false)}
      />

      {/* Edit Modal */}
      <QuestionModal
        quizId={quizId}
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

// ============ Question Modal (Add + Edit) ============
function QuestionModal({ quizId, open, onClose, initial }) {
  const isEdit = !!initial;
  const createMut = useCreateQuestion(quizId);
  const updateMut = useUpdateQuestion(quizId);

  const [type, setType] = useState('multiple_choice');
  const [textAr, setTextAr] = useState('');
  const [textEn, setTextEn] = useState('');
  const [marks, setMarks] = useState(1);
  const [explanationAr, setExplanationAr] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [options, setOptions] = useState([
    { ar: '', en: '', isCorrect: false },
    { ar: '', en: '', isCorrect: false },
  ]);

  // إعادة تهيئة الفورم عند فتح المودال
  useEffect(() => {
    if (!open) return;

    if (initial) {
      setType(initial.type);
      setTextAr(getText(initial.text));
      setTextEn(
        typeof initial.text === 'object' ? initial.text.en ?? '' : '',
      );
      setMarks(initial.marks);
      setExplanationAr(getText(initial.explanation));
      setIsRequired(initial.isRequired ?? true);
      setOptions(
        (initial.options ?? []).map((o) => ({
          ar: getText(o.text),
          en: typeof o.text === 'object' ? o.text.en ?? '' : '',
          isCorrect: o.isCorrect,
        })),
      );
    } else {
      setType('multiple_choice');
      setTextAr('');
      setTextEn('');
      setMarks(1);
      setExplanationAr('');
      setIsRequired(true);
      setOptions([
        { ar: '', en: '', isCorrect: false },
        { ar: '', en: '', isCorrect: false },
      ]);
    }
  }, [open, initial?.id]);

  if (!open) return null;

  const needsOptions = ['multiple_choice', 'multiple_select', 'true_false'].includes(type);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      type,
      text: { ar: textAr, ...(textEn && { en: textEn }) },
      marks: Number(marks),
      isRequired,
      ...(explanationAr && {
        explanation: { ar: explanationAr },
      }),
      ...(needsOptions && {
        options:
          type === 'true_false'
            ? [
                {
                  text: { ar: 'صح', en: 'True' },
                  isCorrect: options[0]?.isCorrect ?? false,
                  sortOrder: 0,
                },
                {
                  text: { ar: 'خطأ', en: 'False' },
                  isCorrect: options[1]?.isCorrect ?? false,
                  sortOrder: 1,
                },
              ]
            : options.map((o, i) => ({
                text: { ar: o.ar, ...(o.en && { en: o.en }) },
                isCorrect: o.isCorrect,
                sortOrder: i,
              })),
      }),
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync({
          qId: initial.id,
          payload,
        });
      } else {
        await createMut.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل الحفظ');
    }
  };

  const setOptionField = (idx, field, value) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)),
    );
  };

  const markCorrect = (idx, checked) => {
    setOptions((prev) =>
      prev.map((o, i) => ({
        ...o,
        isCorrect:
          type === 'multiple_select'
            ? i === idx
              ? checked
              : o.isCorrect
            : i === idx
              ? true
              : false,
      })),
    );
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? 'تعديل سؤال' : 'إضافة سؤال'}
        </h2>

        <label className="block mb-3">
          <span className="text-sm font-medium">نوع السؤال</span>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === 'true_false') {
                setOptions([
                  { ar: 'صح', en: 'True', isCorrect: false },
                  { ar: 'خطأ', en: 'False', isCorrect: false },
                ]);
              }
            }}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="multiple_choice">اختيار من متعدد</option>
            <option value="multiple_select">اختيار متعدد الإجابات</option>
            <option value="true_false">صح / خطأ</option>
            <option value="short_answer">إجابة قصيرة</option>
            <option value="long_answer">إجابة طويلة</option>
          </select>
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">نص السؤال (عربي) *</span>
          <input
            required
            value={textAr}
            onChange={(e) => setTextAr(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">نص السؤال (إنجليزي)</span>
          <input
            value={textEn}
            onChange={(e) => setTextEn(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label>
            <span className="text-sm font-medium">الدرجة</span>
            <input
              type="number"
              min={1}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            <span>سؤال إجباري</span>
          </label>
        </div>

        <label className="block mb-3">
          <span className="text-sm font-medium">الشرح (اختياري)</span>
          <input
            value={explanationAr}
            onChange={(e) => setExplanationAr(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        {needsOptions && (
          <div className="mb-3">
            <div className="text-sm font-medium mb-2">الخيارات</div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type={type === 'multiple_select' ? 'checkbox' : 'radio'}
                    name="correct-option"
                    checked={opt.isCorrect}
                    onChange={(e) => markCorrect(i, e.target.checked)}
                    disabled={type === 'true_false'}
                  />
                  <input
                    placeholder={`خيار ${i + 1} (ar)`}
                    value={opt.ar}
                    onChange={(e) => setOptionField(i, 'ar', e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                    disabled={type === 'true_false'}
                  />
                  <input
                    placeholder={`خيار ${i + 1} (en)`}
                    value={opt.en}
                    onChange={(e) => setOptionField(i, 'en', e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                    disabled={type === 'true_false'}
                  />
                  {type !== 'true_false' && options.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setOptions((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {type !== 'true_false' && (
              <button
                type="button"
                onClick={() =>
                  setOptions((prev) => [
                    ...prev,
                    { ar: '', en: '', isCorrect: false },
                  ])
                }
                className="mt-2 text-blue-600 text-sm hover:underline"
              >
                + إضافة خيار
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  );
}
