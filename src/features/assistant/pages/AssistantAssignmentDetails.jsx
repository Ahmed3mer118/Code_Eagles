// src/features/assistant/pages/AssistantAssignmentDetails.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  Paperclip,
} from 'lucide-react';
import teacherApi from '../../../shared/api/teacherApi';
import PermissionGate from '../components/PermissionGate';

export default function AssistantAssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingSubmission, setGradingSubmission] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await teacherApi.getAssignmentSubmissions(id, { limit: 100 });
      const payload = res?.data?.data ?? res?.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? payload?.items ?? [];
      setSubmissions(items);
    } catch (err) {
      console.warn('Failed to refresh submissions:', err?.message);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [assignmentRes, submissionsRes] = await Promise.allSettled([
          teacherApi.getAssignment(id),
          teacherApi.getAssignmentSubmissions(id, { limit: 100 }),
        ]);

        if (assignmentRes.status === 'fulfilled') {
          const p = assignmentRes.value?.data?.data ?? assignmentRes.value?.data ?? assignmentRes.value;
          setAssignment(p);
        } else {
          throw new Error(
            assignmentRes.reason?.response?.data?.message || 'فشل تحميل الواجب',
          );
        }

        if (submissionsRes.status === 'fulfilled') {
          const p = submissionsRes.value?.data?.data ?? submissionsRes.value?.data ?? submissionsRes.value;
          const items = Array.isArray(p) ? p : p?.data ?? p?.items ?? [];
          setSubmissions(items);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'فشل تحميل بيانات الواجب');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/assistant/assignments')}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg"
        >
          رجوع للواجبات
        </button>
      </div>
    );
  }

  return (
    <PermissionGate
      permission="assignments.view"
      fallback={
        <div className="text-center py-16">
          <AlertCircle size={36} className="text-amber-500 mb-3" />
          <p className="text-sm text-gray-500">ليس لديك صلاحية لعرض هذا الواجب.</p>
        </div>
      }
    >
      <div className="space-y-5" dir="rtl">
        <button
          onClick={() => navigate('/assistant/assignments')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition"
        >
          <ArrowRight size={16} /> رجوع للواجبات
        </button>

        {/* Header */}
        <div className="bg-gradient-to-l from-primary-500 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">{assignment?.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm opacity-90 mt-2">
            {assignment?.subject?.name && (
              <span>📚 {assignment.subject.name}</span>
            )}
            <span>📊 الدرجة الكلية: {assignment?.maxPoints}</span>
            {assignment?.dueDate && (
              <span>
                ⏰ تسليم: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
              </span>
            )}
          </div>
        </div>

        {/* الوصف */}
        {assignment?.description && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              وصف الواجب
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>
        )}

        {/* التسليمات */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Users size={18} className="text-primary-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">
              التسليمات ({submissions.length})
            </h2>
          </div>

          {submissions.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">
              لا توجد تسليمات لهذا الواجب بعد.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {submissions.map((s) => {
                const isGraded = s.status === 'graded';
                const isSubmitted = ['submitted', 'late', 'graded'].includes(s.status);
                return (
                  <div
                    key={s.id}
                    className="p-4 flex flex-wrap items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0">
                      {s.student?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {s.student?.name || 'طالب'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {s.student?.email || ''}
                      </p>
                      {s.submittedAt && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(s.submittedAt).toLocaleString('ar-EG')}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600">
                          <CheckCircle2 size={12} />
                          {s.grade}/{assignment?.maxPoints}
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600">
                          بانتظار التصحيح
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600">
                          لم يُسلَّم
                        </span>
                      )}
                    </div>
                    {isSubmitted && (
                      <PermissionGate permission="assignments.grade">
                        <button
                          onClick={() => setGradingSubmission(s)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 shrink-0"
                        >
                          {isGraded ? 'تعديل الدرجة' : 'تصحيح'}
                        </button>
                      </PermissionGate>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal التصحيح */}
        {gradingSubmission && (
          <GradeModal
            submission={gradingSubmission}
            maxPoints={assignment?.maxPoints}
            onClose={() => setGradingSubmission(null)}
            onSuccess={() => {
              setGradingSubmission(null);
              fetchSubmissions();
            }}
          />
        )}
      </div>
    </PermissionGate>
  );
}

// ============ Grade Modal ============
function GradeModal({ submission, maxPoints, onClose, onSuccess }) {
  const [grade, setGrade] = useState(submission.grade ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(grade) < 0 || Number(grade) > maxPoints) {
      setError(`الدرجة يجب أن تكون بين 0 و ${maxPoints}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await teacherApi.gradeSubmission(submission.id, {
        grade: Number(grade),
        ...(feedback.trim() && { feedback: feedback.trim() }),
      });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل التصحيح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">
            تصحيح - {submission.student?.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 text-red-700 text-xs rounded">{error}</div>
          )}

          {submission.content && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">محتوى التسليم:</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                {submission.content}
              </div>
            </div>
          )}

          {submission.attachmentUrl && (
            <a
              href={submission.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
            >
              <Paperclip size={14} /> عرض المرفق
            </a>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              الدرجة (من {maxPoints})
            </label>
            <input
              type="number"
              min={0}
              max={maxPoints}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ملاحظات
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الدرجة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
