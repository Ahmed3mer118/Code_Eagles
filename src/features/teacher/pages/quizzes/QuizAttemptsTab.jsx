import { useState } from 'react';
import { useQuizAttempts } from '../../hooks/useQuizzes';

const STATUS_LABELS = {
  in_progress: 'قيد التنفيذ',
  submitted: 'بانتظار التصحيح',
  graded: 'تم التصحيح',
  cancelled: 'ملغي',
};

const STATUS_COLORS = {
  in_progress: 'bg-blue-100 text-blue-800',
  submitted: 'bg-yellow-100 text-yellow-800',
  graded: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function QuizAttemptsTab({ quizId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuizAttempts(quizId, {
    page,
    limit: 20,
  });

  const attempts = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">محاولات الطلاب</h2>

      {isLoading && (
        <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-4 rounded">
          {error?.response?.data?.message || 'حدث خطأ'}
        </div>
      )}

      {!isLoading && !isError && attempts.length === 0 && (
        <div className="text-center py-10 text-gray-500 border rounded bg-white">
          لا توجد محاولات بعد.
        </div>
      )}

      {!isLoading && attempts.length > 0 && (
        <div className="bg-white border rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right">الطالب</th>
                <th className="px-4 py-3 text-center">المحاولة</th>
                <th className="px-4 py-3 text-center">الدرجة</th>
                <th className="px-4 py-3 text-center">النسبة</th>
                <th className="px-4 py-3 text-center">الحالة</th>
                <th className="px-4 py-3 text-center">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {a.student?.name ?? '—'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {a.student?.email ?? ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.attemptNumber}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.score ?? '—'} / {a.maxScore ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.percentage != null
                      ? `${Number(a.percentage).toFixed(1)}%`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        STATUS_COLORS[a.status] ?? ''
                      }`}
                    >
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleString('ar-EG')
                      : new Date(a.startedAt).toLocaleString('ar-EG')}
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
    </div>
  );
}
