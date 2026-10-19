import { useState } from 'react';
import { useSubmissions, useGradeSubmission } from '../../hooks/useAssignments';

const STATUS_LABELS = {
  draft: 'مسودة',
  submitted: 'تم التسليم',
  late: 'متأخر',
  graded: 'تم التصحيح',
  returned: 'مُعاد',
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  late: 'bg-yellow-100 text-yellow-800',
  graded: 'bg-green-100 text-green-800',
  returned: 'bg-red-100 text-red-800',
};

export default function SubmissionsTab({ assignmentId, maxPoints }) {
  const [page, setPage] = useState(1);
  const [grading, setGrading] = useState(null);

  const { data, isLoading, isError, error, refetch } = useSubmissions({
    assignmentId,
    page,
    limit: 20,
  });

  const submissions = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        التسليمات ({data?.total ?? 0})
      </h2>

      {isLoading && (
        <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-4 rounded">
          {error?.response?.data?.message || 'حدث خطأ'}
        </div>
      )}

      {!isLoading && !isError && submissions.length === 0 && (
        <div className="text-center py-10 text-gray-500 border rounded bg-white">
          لا توجد تسليمات بعد.
        </div>
      )}

      {!isLoading && submissions.length > 0 && (
        <div className="bg-white border rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right">الطالب</th>
                <th className="px-4 py-3 text-center">الدرجة</th>
                <th className="px-4 py-3 text-center">الحالة</th>
                <th className="px-4 py-3 text-center">تاريخ التسليم</th>
                <th className="px-4 py-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {s.student?.name ?? '—'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.student?.email ?? ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.grade != null ? `${s.grade} / ${maxPoints}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        STATUS_COLORS[s.status] ?? ''
                      }`}
                    >
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {s.submittedAt
                      ? new Date(s.submittedAt).toLocaleString('ar-EG')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setGrading(s)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {s.grade != null ? 'تعديل الدرجة' : 'تصحيح'}
                    </button>
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

      {grading && (
        <GradeModal
          submission={grading}
          maxPoints={maxPoints}
          onClose={() => setGrading(null)}
          onGraded={() => {
            setGrading(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function GradeModal({ submission, maxPoints, onClose, onGraded }) {
  const [grade, setGrade] = useState(submission.grade ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const gradeMut = useGradeSubmission();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await gradeMut.mutateAsync({
        id: submission.id,
        payload: {
          grade: Number(grade),
          ...(feedback.trim() && { feedback: feedback.trim() }),
        },
      });
      onGraded();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل التصحيح');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          تصحيح - {submission.student?.name}
        </h2>

        {submission.content && (
          <div className="mb-3">
            <div className="text-sm font-medium mb-1">محتوى التسليم:</div>
            <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
              {submission.content}
            </div>
          </div>
        )}

        {submission.attachmentUrl && (
          <div className="mb-3">
            <a
              href={submission.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              📎 عرض المرفق
            </a>
          </div>
        )}

        <label className="block mb-3">
          <span className="text-sm font-medium">
            الدرجة (من {maxPoints})
          </span>
          <input
            type="number"
            min={0}
            max={maxPoints}
            required
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm font-medium">ملاحظات</span>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            maxLength={5000}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

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
            disabled={gradeMut.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {gradeMut.isPending ? 'جاري الحفظ...' : 'حفظ الدرجة'}
          </button>
        </div>
      </form>
    </div>
  );
}
