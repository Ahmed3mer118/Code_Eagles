import { useState, useEffect } from 'react';
import { useCreateQuiz } from '../../hooks/useQuizzes';
import teacherApi from '@/shared/api/teacherApi';

export function CreateQuizModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '', // الحقل الجديد للمادة
    durationMinutes: 60,
    passingMarks: 50,
    maxAttempts: 1,
    resultMode: 'instant',
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
  });

  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const createMut = useCreateQuiz();

  // جلب المواد عند فتح المودال
  useEffect(() => {
    if (!open) return;

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const res = await teacherApi.getSubjects({ limit: 100 });
        // تأمين استخراج الداتا
        const subjectsData = res?.data?.data || res?.data || [];
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (err) {
        console.error('Failed to load subjects', err);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // توليد Slug من العنوان، ولو عربي نستخدم حاجة عشوائية
  let generatedSlug = form.title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  if (!generatedSlug) {
    generatedSlug = `quiz-${Math.random().toString(36).substring(2, 8)}`;
  }

  const payload = {
    title: form.title.trim(),
    slug: generatedSlug, // بعت الـ slug للباك
    durationMinutes: Number(form.durationMinutes),
    // ... باقي الحقول
  };

  if (form.description.trim()) {
    payload.description = form.description.trim();
  }
  if (form.subjectId) {
    payload.subjectId = form.subjectId;
  }

  try {
    const quiz = await createMut.mutateAsync(payload);
    onCreated?.(quiz);
    onClose();
  } catch (err) {
    alert(err?.response?.data?.message || 'فشل إنشاء الكويز');
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto text-right"
      >
        <h2 className="text-xl font-bold mb-4">كويز جديد</h2>

        <label className="block mb-3">
          <span className="text-sm font-medium">العنوان *</span>
          <input
            required
            minLength={2}
            maxLength={300}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        {/* قائمة اختيار المادة */}
        <label className="block mb-3">
          <span className="text-sm font-medium">المادة (اختياري)</span>
          <select
            value={form.subjectId}
            onChange={(e) => handleChange('subjectId', e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            disabled={isLoadingSubjects}
          >
            <option value="">
              {isLoadingSubjects ? 'جاري تحميل المواد...' : '-- اختر المادة --'}
            </option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">الوصف</span>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            rows={3}
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label>
            <span className="text-sm font-medium">المدة (دقيقة)</span>
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label>
            <span className="text-sm font-medium">درجة النجاح</span>
            <input
              type="number"
              min={0}
              value={form.passingMarks}
              onChange={(e) => handleChange('passingMarks', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label>
            <span className="text-sm font-medium">عدد المحاولات</span>
            <input
              type="number"
              min={1}
              value={form.maxAttempts}
              onChange={(e) => handleChange('maxAttempts', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label>
            <span className="text-sm font-medium">طريقة النتائج</span>
            <select
              value={form.resultMode}
              onChange={(e) => handleChange('resultMode', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="instant">فوري</option>
              <option value="manual">يدوي</option>
              <option value="after_end">بعد انتهاء الكويز</option>
            </select>
          </label>
        </div>

        <div className="space-y-2 mb-4 text-right">
          <label className="flex items-center gap-2 justify-end">
            <span>ترتيب عشوائي للأسئلة</span>
            <input
              type="checkbox"
              checked={form.shuffleQuestions}
              onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
            />
          </label>
          <label className="flex items-center gap-2 justify-end">
            <span>ترتيب عشوائي للخيارات</span>
            <input
              type="checkbox"
              checked={form.shuffleOptions}
              onChange={(e) => handleChange('shuffleOptions', e.target.checked)}
            />
          </label>
          <label className="flex items-center gap-2 justify-end">
            <span>إظهار الإجابات الصحيحة بعد التسليم</span>
            <input
              type="checkbox"
              checked={form.showCorrectAnswers}
              onChange={(e) => handleChange('showCorrectAnswers', e.target.checked)}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createMut.isPending ? 'جاري الحفظ...' : 'إنشاء'}
          </button>
        </div>
      </form>
    </div>
  );
}
