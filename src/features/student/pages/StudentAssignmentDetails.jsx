import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Calendar,
  Award,
  Clock,
  AlertCircle,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  Paperclip,
  MessageSquare,
  Upload,
} from 'lucide-react';
import useStudentAssignment from '../hooks/useStudentAssignment';

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StudentAssignmentDetails() {
  const { assignmentId } = useParams();
  const {
    assignment,
    isLoading,
    isSubmitting,
    error,
    submitError,
    refetch,
    submit,
  } = useStudentAssignment(assignmentId);

  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showForm, setShowForm] = useState(false);

  const submission = assignment?.submissions?.[0];
  const isGraded = submission?.status === 'graded';
  const isReturned = submission?.status === 'returned';
  const isSubmitted = submission && !isGraded && !isReturned;

  // تعبئة الفورم بالقيم الموجودة
  useEffect(() => {
    if (submission) {
      setContent(submission.content || '');
      setAttachmentUrl(submission.attachmentUrl || '');
    }
  }, [submission]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !attachmentUrl.trim()) {
      alert('لازم تكتب محتوى أو تضيف رابط مرفق على الأقل');
      return;
    }
    const result = await submit({
      content: content.trim() || undefined,
      attachmentUrl: attachmentUrl.trim() || undefined,
    });
    if (result.success) {
      setShowForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error || 'الواجب غير موجود'}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
        >
          <RefreshCw size={16} /> حاول تاني
        </button>
      </div>
    );
  }

  const now = new Date();
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate && now > dueDate;
  const canSubmit = !isGraded && !isReturned && (!isOverdue || assignment.allowLateSubmission);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <Link
        to="/student/assignments"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowRight size={16} />
        رجوع للواجبات
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {assignment.title}
            </h1>
            {assignment.subject?.name && (
              <p className="mt-1 text-sm text-primary-600 dark:text-primary-400 font-medium">
                {assignment.subject.name}
              </p>
            )}
          </div>

          {/* Status Badge */}
          {isGraded && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold">
              <CheckCircle2 size={16} />
              مصحح
            </span>
          )}
          {isReturned && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-sm font-semibold">
              <RefreshCw size={16} />
              مرتجع
            </span>
          )}
          {isSubmitted && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold">
              <Send size={16} />
              مسلّم
            </span>
          )}
          {!submission && isOverdue && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-semibold">
              <XCircle size={16} />
              متأخر
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          {dueDate && (
            <span
              className={`inline-flex items-center gap-1.5 ${
                isOverdue && !submission ? 'text-red-600 dark:text-red-400 font-medium' : ''
              }`}
            >
              <Calendar size={15} />
              التسليم: {formatDateTime(assignment.dueDate)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Award size={15} />
            الدرجة: {assignment.maxPoints}
          </span>
          {assignment.allowLateSubmission && (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock size={15} />
              يقبل التسليم المتأخر
              {assignment.latePenaltyPercent > 0 &&
                ` (خصم ${assignment.latePenaltyPercent}%)`}
            </span>
          )}
        </div>

        {/* Description */}
        {assignment.description && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              التعليمات
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>
        )}
      </div>

      {/* Submission section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Send size={18} className="text-primary-600" />
          {submission ? 'تسليمك' : 'تسليم الواجب'}
        </h2>

        {/* Grade display */}
        {isGraded && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                الدرجة النهائية
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {submission.grade} / {assignment.maxPoints}
              </span>
            </div>
            {submission.feedback && (
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1 flex items-center gap-1">
                  <MessageSquare size={12} />
                  ملاحظات المدرس
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                  {submission.feedback}
                </p>
              </div>
            )}
            {submission.gradedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                تم التصحيح {formatDateTime(submission.gradedAt)}
              </p>
            )}
          </div>
        )}

        {/* Returned notice */}
        {isReturned && (
          <div className="mb-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300 flex items-center gap-2">
              <RefreshCw size={16} />
              الواجب ده اترجع ليك. تواصل مع المدرس عشان تعرف السبب.
            </p>
          </div>
        )}

        {/* Submitted content (view mode) */}
        {submission && !showForm && (
          <div className="space-y-3">
            {submission.content && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">المحتوى</p>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {submission.content}
                </div>
              </div>
            )}
            {submission.attachmentUrl && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">المرفق</p>
                <a
                  href={submission.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Paperclip size={14} />
                  فتح المرفق
                </a>
              </div>
            )}
            {submission.submittedAt && (
              <p className="text-xs text-gray-500">
                سلّمت {formatDateTime(submission.submittedAt)}
              </p>
            )}

            {/* Edit button if allowed */}
            {(isSubmitted || (!isGraded && !isReturned)) && (
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                تعديل التسليم
              </button>
            )}
          </div>
        )}

        {/* Submit form */}
        {(!submission || showForm) && canSubmit && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                المحتوى
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="اكتب إجابتك هنا..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                رابط المرفق (اختياري)
              </label>
              <div className="relative">
                <Paperclip
                  size={16}
                  className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400"
                />
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full ps-9 pe-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    جاري التسليم...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    {submission ? 'حفظ التعديل' : 'تسليم الواجب'}
                  </>
                )}
              </button>
              {showForm && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    if (submission) {
                      setContent(submission.content || '');
                      setAttachmentUrl(submission.attachmentUrl || '');
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        )}

        {/* Cannot submit notice */}
        {!submission && !canSubmit && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
              <XCircle size={16} />
              {isOverdue
                ? 'الوقت انتهى ومفيش تسليم متأخر مسموح للواجب ده.'
                : 'مش قادر تسلّم الواجب دلوقتي.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
