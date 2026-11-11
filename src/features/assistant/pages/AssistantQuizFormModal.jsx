// src/features/assistant/pages/AssistantQuizFormModal.jsx
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
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
  selectedGroupIds: [],
};

function generateSlug(title) {
  const base = title.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `quiz-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AssistantQuizFormModal({
  open, onClose, groups = [], onCreated, initial = null,
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState(EMPTY);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        subjectId: initial.subjectId || '',
        totalMarks: initial.totalMarks ?? 100,
        durationMinutes: initial.durationMinutes ?? 60,
        passingMarks: initial.passingMarks ?? 50,
        maxAttempts: initial.maxAttempts ?? 1,
        resultMode: initial.resultMode ?? 'instant',
        shuffleQuestions: initial.shuffleQuestions ?? false,
        shuffleOptions: initial.shuffleOptions ?? false,
        showCorrectAnswers: initial.showCorrectAnswers ?? true,
        selectedGroupIds: initial.groups?.map((g) => g.groupId ?? g.group?.id ?? g.id) ?? [],
      });
    } else {
      setForm(EMPTY);
    }
    setError('');

    let cancelled = false;
    setLoadingSubjects(true);
    assistantApi.getSubjects({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        const data = res?.data?.data ?? res?.data ?? [];
        setSubjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingSubjects(false));

    return () => { cancelled = true; };
  }, [open, initial]);

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleGroup = (id) => {
    setForm((p) => ({
      ...p,
      selectedGroupIds: p.selectedGroupIds.includes(id)
        ? p.selectedGroupIds.filter((x) => x !== id)
        : [...p.selectedGroupIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(form.passingMarks) > Number(form.totalMarks)) {
      setError('درجة النجاح لا يمكن أن تتجاوز الدرجة الكلية');
      return;
    }
    if (form.selectedGroupIds.length === 0) {
      setError('اختر مجموعة واحدة على الأقل ليظهر الكويز للطلاب');
      return;
    }

    const payload = {
      title: form.title.trim(),
      totalMarks: Number(form.totalMarks),
      durationMinutes: Number(form.durationMinutes),
      passingMarks: Number(form.passingMarks),
      maxAttempts: Number(form.maxAttempts),
      resultMode: form.resultMode,
      shuffleQuestions: form.shuffleQuestions,
      shuffleOptions: form.shuffleOptions,
      showCorrectAnswers: form.showCorrectAnswers,
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.subjectId) payload.subjectId = form.subjectId;
    if (!isEdit) payload.slug = generateSlug(form.title);

    setSaving(true);

    if (isEdit) {
      try {
        await assistantApi.updateQuiz(initial.id, payload);
        await assistantApi.linkQuizGroups(initial.id, {
          groupIds: form.selectedGroupIds,
        });
        onCreated?.({ ...initial, ...payload });
        onClose();
      } catch (err) {
        setError(err?.response?.data?.message || 'فشل تعديل الكويز');
      } finally {
        setSaving(false);
      }
      return;
    }

    // Create mode with rollback
    let createdId = null;
    try {
      const res = await assistantApi.createQuiz(payload);
      const quiz = res?.data?.data ?? res?.data ?? res;
      createdId = quiz?.id;
      if (!createdId) throw new Error('لم يتم استلام ID الكويز');

      try {
        await assistantApi.linkQuizGroups(createdId, {
          groupIds: form.selectedGroupIds,
        });
      } catch (linkErr) {
        try { await assistantApi.deleteQuiz(createdId); } catch {}
        throw new Error(
          linkErr?.response?.data?.message || 'فشل ربط الكويز بالمجموعات'
        );
      }

      onCreated?.(quiz);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'فشل إنشاء الكويز');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? 'تعديل الكويز' : 'كويز جديد'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium">العنوان *</span>
            <input
              required minLength={2} maxLength={300}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">المادة (اختياري)</span>
            <select
              value={form.subjectId}
              onChange={(e) => setField('subjectId', e.target.value)}
              disabled={loadingSubjects}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">{loadingSubjects ? 'جاري التحميل...' : '-- بدون مادة --'}</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">الوصف</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
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
              <span className="text-sm font-medium">عدد المحاولات</span>
              <input type="number" min={1} value={form.maxAttempts}
                onChange={(e) => setField('maxAttempts', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">طريقة النتائج</span>
            <select value={form.resultMode}
              onChange={(e) => setField('resultMode', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 dark:bg-gray-800 dark:border-gray-700">
              <option value="instant">فوري</option>
              <option value="manual">يدوي</option>
              <option value="after_end">بعد انتهاء الكويز</option>
            </select>
          </label>

          <div className="space-y-2">
            {[
              ['shuffleQuestions', 'ترتيب عشوائي للأسئلة'],
              ['shuffleOptions', 'ترتيب عشوائي للخيارات'],
              ['showCorrectAnswers', 'إظهار الإجابات الصحيحة'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 justify-end">
                <span className="text-sm">{label}</span>
                <input type="checkbox" checked={form[key]}
                  onChange={(e) => setField(key, e.target.checked)} />
              </label>
            ))}
          </div>

          <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                المجموعات * <span className="text-red-500">(مطلوب)</span>
              </span>
              {groups.length > 0 && (
                <button type="button"
                  onClick={() => setField('selectedGroupIds',
                    form.selectedGroupIds.length === groups.length ? [] : groups.map((g) => g.id))}
                  className="text-xs text-primary-600 hover:underline">
                  {form.selectedGroupIds.length === groups.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </button>
              )}
            </div>
            {groups.length === 0 ? (
              <p className="text-xs text-amber-600">لا توجد مجموعات متاحة.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-gray-800 p-1.5 rounded">
                    <input type="checkbox"
                      checked={form.selectedGroupIds.includes(g.id)}
                      onChange={() => toggleGroup(g.id)} />
                    <span>{g.name}</span>
                    {g.subject?.name && <span className="text-xs text-gray-500">— {g.subject.name}</span>}
                  </label>
                ))}
              </div>
            )}
            {form.selectedGroupIds.length > 0 && (
              <p className="text-xs text-emerald-600 mt-2">
                ✅ تم اختيار {form.selectedGroupIds.length} مجموعة
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
          <button type="submit" disabled={saving || form.selectedGroupIds.length === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50">
            <Save size={16} />
            {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إنشاء الكويز'}
          </button>
          <button type="button" onClick={onClose} disabled={saving}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}