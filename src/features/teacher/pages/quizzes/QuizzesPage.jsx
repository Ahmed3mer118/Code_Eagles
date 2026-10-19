import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQuizzes,
  usePublishQuiz,
  useDeleteQuiz,
} from '../../hooks/useQuizzes';
import { CreateQuizModal } from './CreateQuizModal';

const STATUS_LABELS = {
  draft: 'مسودة',
  published: 'منشور',
  closed: 'مغلق',
  archived: 'مؤرشف',
};

const STATUS_COLORS = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
};

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, error } = useQuizzes({
    page,
    limit: 20,
    ...(search && { search }),
    ...(status && { status }),
  });

  const publishMut = usePublishQuiz();
  const deleteMut = useDeleteQuiz();

  // تأمين استخراج البيانات
  const quizzes = Array.isArray(data) ? data : (data?.data || []);
  const totalPages = data?.totalPages ?? 1;

  const handlePublish = async (quiz) => {
    if ((quiz._count?.questions ?? 0) === 0) {
      alert('لا يمكن نشر الكويز لأنه لا يحتوي على أسئلة. اضغط تعديل وأضف أسئلة أولاً.');
      return;
    }
    if (!confirm(`نشر الكويز "${quiz.title}"؟`)) return;
    
    try {
      await publishMut.mutateAsync(quiz.id);
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل النشر');
    }
  };

  const handleDelete = async (quiz) => {
    if (!confirm(`حذف الكويز "${quiz.title}"؟`)) return;
    try {
      await deleteMut.mutateAsync(quiz.id);
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الاختبارات</h1>
          <p className="text-gray-500">إدارة اختباراتك</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + كويز جديد
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="بحث بالعنوان..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="closed">مغلق</option>
          <option value="archived">مؤرشف</option>
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          {error?.response?.data?.message || 'حدث خطأ في تحميل الكويزات'}
        </div>
      )}

      {!isLoading && !isError && quizzes.length === 0 && (
        <div className="text-center py-10 text-gray-500 border border-dashed rounded-lg bg-gray-50">
          لا توجد كويزات. ابدأ بإنشاء أول كويز.
        </div>
      )}

      {!isLoading && quizzes.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden border">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">العنوان</th>
                <th className="px-4 py-3">المادة</th>
                <th className="px-4 py-3 text-center">الأسئلة</th>
                <th className="px-4 py-3 text-center">المحاولات</th>
                <th className="px-4 py-3 text-center">الحالة</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{quiz.title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {quiz.subject?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {quiz._count?.questions ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {quiz._count?.attempts ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[quiz.status] ?? ''}`}
                    >
                      {STATUS_LABELS[quiz.status] ?? quiz.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        تعديل
                      </button>
                      {quiz.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(quiz)}
                          disabled={publishMut.isPending}
                          className="text-green-600 hover:underline text-sm"
                        >
                          نشر
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(quiz)}
                        disabled={deleteMut.isPending}
                        className="text-red-600 hover:underline text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            السابق
          </button>
          <span className="px-3 py-1">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      <CreateQuizModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(q) => {
          setShowCreate(false);
          navigate(`/teacher/quizzes/${q.id}`);
        }}
      />
    </div>
  );
}
