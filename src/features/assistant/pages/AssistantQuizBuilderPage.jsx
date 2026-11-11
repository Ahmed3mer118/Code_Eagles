// src/features/assistant/pages/AssistantQuizBuilderPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Send, AlertCircle } from 'lucide-react';
import assistantApi from '../api/assistantApi';
import PermissionGate from '../components/PermissionGate';
import AssistantQuizFormModal from './AssistantQuizFormModal';
import AssistantQuizQuestionsTab from './AssistantQuizQuestionsTab';

const TABS = [
  { key: 'settings', label: 'إعدادات' },
  { key: 'questions', label: 'الأسئلة' },
];

export default function AssistantQuizBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('settings');
  const [showEdit, setShowEdit] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await assistantApi.getQuizById(id);
      const data = res?.data?.data ?? res?.data ?? res;
      setQuiz(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل الكويز');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    assistantApi.getGroups()
      .then((res) => {
        const payload = res?.data ?? res;
        setGroups(Array.isArray(payload) ? payload : payload?.data ?? []);
      })
      .catch(() => setGroups([]));
  }, [id]);

  const handlePublish = async () => {
    const qCount = quiz?._count?.questions ?? quiz?.questions?.length ?? 0;
    if (qCount === 0) {
      alert('لا يمكن النشر بدون أسئلة');
      return;
    }
    if (!confirm('نشر الكويز؟')) return;
    setPublishing(true);
    try {
      await assistantApi.publishQuiz(id);
      await fetchQuiz();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل النشر');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error || 'الكويز غير موجود'}</p>
        <button onClick={() => navigate('/assistant/quizzes')}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg">
          رجوع للاختبارات
        </button>
      </div>
    );
  }

  return (
    <PermissionGate
      permission="quizzes.manage"
      fallback={
        <div className="text-center py-16">
          <AlertCircle size={36} className="text-amber-500 mb-3" />
          <p className="text-sm text-gray-500">ليس لديك صلاحية لتعديل الاختبارات.</p>
        </div>
      }
    >
      <div className="space-y-5" dir="rtl">
        <button onClick={() => navigate('/assistant/quizzes')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition">
          <ArrowRight size={16} /> رجوع للاختبارات
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              الحالة: {quiz.status} · {quiz._count?.questions ?? quiz.questions?.length ?? 0} سؤال · {quiz.totalMarks} درجة
            </p>
          </div>
          <div className="flex gap-2">
            {quiz.status === 'draft' && (
              <>
                <button onClick={() => setShowEdit(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                  تعديل الإعدادات
                </button>
                <button onClick={handlePublish} disabled={publishing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                  <Send size={16} /> {publishing ? 'جاري النشر...' : 'نشر'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 flex gap-1">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">الدرجة الكلية</p><p className="font-bold">{quiz.totalMarks}</p></div>
              <div><p className="text-gray-500">درجة النجاح</p><p className="font-bold">{quiz.passingMarks}</p></div>
              <div><p className="text-gray-500">المدة</p><p className="font-bold">{quiz.durationMinutes} دقيقة</p></div>
              <div><p className="text-gray-500">المحاولات</p><p className="font-bold">{quiz.maxAttempts}</p></div>
            </div>
            {quiz.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-500 text-xs mb-1">الوصف</p>
                <p className="text-sm whitespace-pre-wrap">{quiz.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <AssistantQuizQuestionsTab quizId={id} quiz={quiz} onRefresh={fetchQuiz} />
        )}

        {showEdit && (
          <AssistantQuizFormModal
            open={showEdit}
            onClose={() => setShowEdit(false)}
            groups={groups}
            initial={quiz}
            onCreated={() => {
              setShowEdit(false);
              fetchQuiz();
            }}
          />
        )}
      </div>
    </PermissionGate>
  );
}