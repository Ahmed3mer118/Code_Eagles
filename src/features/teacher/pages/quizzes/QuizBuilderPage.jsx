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
import { Layers } from 'lucide-react'; // ✅ ضفنا الأيقونة دي

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
  const [groups, setGroups] = useState([]); // ✅ State للمجموعات
  const [selectedGroupIds, setSelectedGroupIds] = useState([]); // ✅ State للمجموعات المختارة
  const [savingGroups, setSavingGroups] = useState(false); // ✅ State للحفظ

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

  // ✅ جلب المجموعات وتعبئة المجموعات المختارة (لو الكويز متربط بمجموعات أصلاً)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const [groupsRes, quizRes] = await Promise.all([
          teacherApi.getGroups({ limit: 100 }),
          teacherApi.getQuiz(id) // بنجيب الكويز تاني عشان نشوف متربط بمجموعات ولا لأ
        ]);
        
        const groupsData = groupsRes?.data?.data || groupsRes?.data || [];
        setGroups(Array.isArray(groupsData) ? groupsData : []);

        // لو الكويز راجع فيه groups، بنحطها في الـ state
        const linkedGroups = quizRes?.data?.groups || quizRes?.groups || [];
        setSelectedGroupIds(linkedGroups.map((g) => g.groupId));
      } catch (err) {
        console.error('Failed to load groups or quiz links', err);
      }
    };
    fetchGroups();
  }, [id]);

  useEffect(() => {
    if (!quiz) return;
    setForm({
      title: quiz.title ?? '',
      description: quiz.description ?? '',
      subjectId: quiz.subjectId ?? '', 
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

  // ✅ دالة حفظ المجموعات
  const handleSaveGroups = async () => {
    setSavingGroups(true);
    try {
      await teacherApi.linkQuizGroups(id, { groupIds: selectedGroupIds });
      alert('تم ربط المجموعات بنجاح');
      refetch();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل ربط المجموعات');
    } finally {
      setSavingGroups(false);
    }
  };

  // ✅ دالة تحديد/إلغاء تحديد المجموعة
  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((gId) => gId !== groupId)
        : [...prev, groupId]
    );
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
    <div className="p-6" dir="rtl">
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* العمود الأول: الإعدادات الأساسية */}
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <label className="block">
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

            <label className="block">
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

            <label className="block">
              <span className="text-sm font-medium">الوصف</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-2">
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
              className="w-full bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMut.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </form>

          {/* العمود التاني: ربط المجموعات */}
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Layers size={20} className="text-blue-600" />
              المجموعات المستهدفة
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              اختاري المجموعات التي سيظهر لها هذا الكويز. (لازم المجموعة دي يكون فيها الطالب).
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-sm text-gray-500">لا توجد مجموعات متاحة. تأكدي من إنشاء مجموعة أولاً.</p>
              ) : (
                groups.map((group) => (
                  <label 
                    key={group.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{group.name}</p>
                      {group.gradeLevel && <p className="text-xs text-gray-500">{group.gradeLevel}</p>}
                    </div>
                  </label>
                ))
              )}
            </div>
            
            <button
              type="button"
              onClick={handleSaveGroups}
              disabled={savingGroups}
              className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingGroups ? 'جاري الحفظ...' : 'حفظ المجموعات'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <QuizQuestionsTab quizId={id} quiz={quiz} onRefresh={refetch} />
      )}

      {activeTab === 'attempts' && <QuizAttemptsTab quizId={id} />}
    </div>
  );
}
