import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useQuiz,
  useUpdateQuiz,
  usePublishQuiz,
} from '../../hooks/useQuizzes';
import teacherApi from '@/shared/api/teacherApi';
import QuizQuestionsTab from './QuizQuestionsTab';
import QuizAttemptsTab from './QuizAttemptsTab';

const TABS = [
  { key: 'settings', label: 'إعدادات الكويز' },
  { key: 'questions', label: 'الأسئلة' },
  { key: 'attempts', label: 'محاولات الطلاب' },
];

const STATUS_LABELS = {
  draft: 'مسودة',
  published: 'منشور',
  closed: 'مغلق',
  archived: 'مؤرشف',
};

export default function QuizBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [subjects, setSubjects] = useState([]);

  const { data: quiz, isLoading, isError, error, refetch } = useQuiz(id);
  const updateMut = useUpdateQuiz();
  const publishMut = usePublishQuiz();

  const [form, setForm] = useState(null);

  // جلب المواد
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await teacherApi.getSubjects({ limit: 100 });
        const subjectsData = res?.data?.data || res?.data || [];
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!quiz) return;
    setForm({
      title: quiz.title ?? '',
      description: quiz.description ?? '',
      subjectId: quiz.subjectId ?? '', // تعبئة المادة الحالية
      durationMinutes: quiz.durationMinutes ?? 60,
      passingMarks: quiz.passingMarks ?? 50,
      maxAttempts: quiz.maxAttempts ?? 1,
      resultMode: quiz.resultMode ?? 'instant',
      shuffleQuestions: quiz.shuffleQuestions ?? false,
      shuffleOptions: quiz.shuffleOptions ?? false,
      showCorrectAnswers: quiz.showCorrectAnswers ?? true,
    });
  }, [quiz]);

  if (isLoading) {
    return <div className="p-6 text-gray-500">جاري التحميل...</div>;
  }

  if (isError || !quiz) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded">
          {error?.response?.data?.message || 'لم يتم العثور على الكويز'}
        </div>
        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← رجوع للقائمة
        </button>
      </div>
    );
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title.trim(),
        durationMinutes: Number(form.durationMinutes),
        passingMarks: Number(form.passingMarks),
        maxAttempts: Number(form.maxAttempts),
        resultMode: form.resultMode,
        shuffleQuestions: form.shuffleQuestions,
        shuffleOptions: form.shuffleOptions,
        showCorrectAnswers: form.showCorrectAnswers,
        // إرسال المادة (أو null لو المستخدم مسحها)
        subjectId: form.subjectId || null, 
      };

      if (form.description.trim()) {
        payload.description = form.description.trim();
      }

      await updateMut.mutateAsync({ id, payload });
      refetch();
      alert('تم الحفظ بنجاح');
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل الحفظ');
    }
  };

  const handlePublish = async () => {
    if ((quiz._count?.questions ?? quiz.questions?.length ?? 0) === 0) {
      alert('لا يمكن النشر بدون أسئلة. أضف سؤالاً أولاً.');
      return;
    }
    if (!confirm('نشر الكويز؟ لن تستطيع إضافة أسئلة بعد النشر.')) return;
    try {
      await publishMut.mutateAsync(id);
      refetch();
      alert('تم النشر بنجاح');
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل النشر');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="text-sm text-blue-600 hover:underline mb-1"
          >
            ← رجوع للقائمة
          </button>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="text-sm text-gray-500 mt-1">
            الحالة: {STATUS_LABELS[quiz.status] ?? quiz.status} · عدد الأسئلة:{' '}
            {quiz._count?.questions ?? quiz.questions?.length ?? 0} · الدرجة
            الكلية: {quiz.totalMarks}
          </div>
        </div>
        {quiz.status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={publishMut.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishMut.isPending ? 'جاري النشر...' : 'نشر الكويز'}
          </button>
        )}
      </div>

      <div className="border-b mb-4">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-1 ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'settings' && form && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl text-right">
          <label className="block mb-3">
            <span className="text-sm font-medium">العنوان *</span>
            <input
              required
              minLength={2}
              maxLength={300}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          {/* قائمة اختيار المادة للتعديل */}
          <label className="block mb-3">
            <span className="text-sm font-medium">المادة (اختياري)</span>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">-- بدون مادة --</option>
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
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label>
              <span className="text-sm font-medium">المدة (دقيقة)</span>
              <input
                type="number" min={1} value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
            <label>
              <span className="text-sm font-medium">درجة النجاح</span>
              <input
                type="number" min={0} value={form.passingMarks}
                onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
            <label>
              <span className="text-sm font-medium">عدد المحاولات</span>
              <input
                type="number" min={1} value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
            <label>
              <span className="text-sm font-medium">طريقة النتائج</span>
              <select
                value={form.resultMode}
                onChange={(e) => setForm({ ...form, resultMode: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="instant">فوري</option>
                <option value="manual">يدوي</option>
                <option value="after_end">بعد انتهاء الكويز</option>
              </select>
            </label>
          </div>

          <div className="space-y-2 mb-4">
            <label className="flex items-center justify-end gap-2">
              <span>ترتيب عشوائي للأسئلة</span>
              <input type="checkbox" checked={form.shuffleQuestions}
                onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-end gap-2">
              <span>ترتيب عشوائي للخيارات</span>
              <input type="checkbox" checked={form.shuffleOptions}
                onChange={(e) => setForm({ ...form, shuffleOptions: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-end gap-2">
              <span>إظهار الإجابات الصحيحة</span>
              <input type="checkbox" checked={form.showCorrectAnswers}
                onChange={(e) => setForm({ ...form, showCorrectAnswers: e.target.checked })}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={updateMut.isPending}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMut.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </form>
      )}

      {activeTab === 'questions' && (
        <QuizQuestionsTab quizId={id} quiz={quiz} onRefresh={refetch} />
      )}

      {activeTab === 'attempts' && <QuizAttemptsTab quizId={id} />}
    </div>
  );
}
