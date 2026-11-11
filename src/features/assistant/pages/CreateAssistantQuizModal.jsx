// src/features/assistant/pages/CreateAssistantQuizModal.jsx
import { useState, useEffect } from 'react';
import { X, ClipboardList } from 'lucide-react';
import assistantApi from '../api/assistantApi';

const EMPTY = {
  title: '',
  description: '',
  subjectId: '',
  totalMarks: 100,
  durationMinutes: 60,
  passingMarks: 50,
  maxAttempts: 1,
  resultMode: 'instant',
  shuffleQuestions: false,
  shuffleOptions: false,
  showCorrectAnswers: true,
  groupIds: [], // ⬅️ المساعد يختار من مجموعاته فقط
};

function generateSlug(title) {
  const base = title.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return base || `quiz-${Math.random().toString(36).slice(2, 8)}`;
}

export function CreateAssistantQuizModal({ open, onClose, onCreated, assistantGroupIds = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // reset + fetch
  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setError('');

    let cancelled = false;

    // subjects
    setLoadingSubjects(true);
    assistantApi.getSubjects()
      .then((res) => {
        if (cancelled) return;
        const p = res?.data?.data ?? res?.data ?? [];
        setSubjects(Array.isArray(p) ? p : []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingSubjects(false));

    // groups — المساعد يشوف مجموعاته فقط
    setLoadingGroups(true);
    assistantApi.getGroups()
      .then((res) => {
        if (cancelled) return;
        const p = res?.data ?? res;
        const list = Array.isArray(p) ? p : p?.data ?? [];
        setGroups(list);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingGroups(false));

    return () => { cancelled = true; };
  }, [open]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleGroup = (id) =>
    setForm((f) => ({
      ...f,
      groupIds: f.groupIds.includes(id)
        ? f.groupIds.filter((g) => g !== id)
        : [...f.groupIds, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.passingMarks) > Number(form.totalMarks)) {
      setError('درجة النجاح لا يمكن أن تتجاوز الدرجة الكلية');
      return;
    }
    if (form.groupIds.length === 0) {
      setError('اختر مجموعة واحدة على الأقل ليظهر الكويز للطلاب');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      slug: generateSlug(form.title),
      totalMarks: Number(form.totalMarks),
      durationMinutes: Number(form.durationMinutes),
      passingMarks: Number(form.passingMarks),
      maxAttempts: Number(form.maxAttempts),
      resultMode: form.resultMode,
      shuffleQuestions: form.shuffleQuestions,
      shuffleOptions: form.shuffleOptions,
      showCorrectAnswers: form.showCorrectAnswers,
      groupIds: form.groupIds, // ⬅️ الربط مع المجموعات
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.subjectId) payload.subjectId = form.subjectId;

    try {
      const res = await assistantApi.createQuiz(payload);
      const quiz = res?.data?.data ?? res?.data ?? res;
      onCreated?.(quiz);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل إنشاء الكويز');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList size={20} className="text-primary-600" /> كويز جديد
          </h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>
        )}

        {/* العنوان */}
        <label className="block mb-3">
          <span className="text-sm font-medium">العنوان *</span>
          <input
            required minLength={2} maxLength={300}
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700"
          />
        </label>

        {/* المادة */}
        <label className="block mb-3">
          <span className="text-sm font-medium">المادة (اختياري)</span>
          <select
            value={form.subjectId}
            onChange={(e) => setField('subjectId', e.target.value)}
            disabled={loadingSubjects}
            className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">{loadingSubjects ? 'جاري التحميل...' : '-- بدون مادة --'}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        {/* الوصف */}
        <label className="block mb-3">
          <span className="text-sm font-medium">الوصف</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700"
          />
        </label>

        {/* الدرجات + المدة */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <label>
            <span className="text-sm font-medium">الدرجة الكلية</span>
            <input type="number" min={1} value={form.totalMarks}
              onChange={(e) => setField('totalMarks', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700" />
          </label>
          <label>
            <span className="text-sm font-medium">درجة النجاح</span>
            <input type="number" min={0} max={form.totalMarks} value={form.passingMarks}
              onChange={(e) => setField('passingMarks', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700" />
          </label>
          <label>
            <span className="text-sm font-medium">المدة (دقيقة)</span>
            <input type="number" min={1} value={form.durationMinutes}
              onChange={(e) => setField('durationMinutes', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700" />
          </label>
          <label>
            <span className="text-sm font-medium">المحاولات</span>
            <input type="number" min={1} value={form.maxAttempts}
              onChange={(e) => setField('maxAttempts', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700" />
          </label>
        </div>

        {/* طريقة النتائج */}
        <label className="block mb-3">
          <span className="text-sm font-medium">طريقة النتائج</span>
          <select value={form.resultMode}
            onChange={(e) => setField('resultMode', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700">
            <option value="instant">فوري</option>
            <option value="manual">يدوي</option>
            <option value="after_end">بعد انتهاء الكويز</option>
          </select>
        </label>

        {/* Checkboxes */}
        <div className="space-y-2 mb-4">
          {[
            ['shuffleQuestions', 'ترتيب عشوائي للأسئلة'],
            ['shuffleOptions', 'ترتيب عشوائي للخيارات'],
            ['showCorrectAnswers', 'إظهار الإجابات الصحيحة'],
          ].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 justify-end">
              <span>{label}</span>
              <input type="checkbox" checked={form[k]} onChange={(e) => setField(k, e.target.checked)} />
            </label>
          ))}
        </div>

        {/* المجموعات */}
        <div className="mb-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              المجموعات * <span className="text-red-500">(مطلوب)</span>
            </span>
            {groups.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setField('groupIds',
                    form.groupIds.length === groups.length ? [] : groups.map((g) => g.id))
                }
                className="text-xs text-primary-600 hover:underline"
              >
                {form.groupIds.length === groups.length ? 'إلغاء الكل' : 'تحديد الكل'}
              </button>
            )}
          </div>

          {loadingGroups ? (
            <p className="text-xs text-gray-500">جاري تحميل المجموعات...</p>
          ) : groups.length === 0 ? (
            <p className="text-xs text-amber-600">
              ⚠️ لا توجد مجموعات مخصصة لك. تواصل مع المدرس.
            </p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={form.groupIds.includes(g.id)}
                    onChange={() => toggleGroup(g.id)}
                  />
                  <span>{g.name}</span>
                  {g.subject?.name && (
                    <span className="text-xs text-gray-500">— {g.subject.name}</span>
                  )}
                </label>
              ))}
            </div>
          )}

          {form.groupIds.length > 0 && (
            <p className="text-xs text-emerald-600 mt-2">
              ✅ تم اختيار {form.groupIds.length} مجموعة
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            إلغاء
          </button>
          <button type="submit" disabled={saving || form.groupIds.length === 0}
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'جاري الحفظ...' : 'إنشاء الكويز'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAssistantQuizModal;