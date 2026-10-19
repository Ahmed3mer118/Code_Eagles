import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  getStudentQuizById,
  startQuizAttempt,
  answerQuestion,
  submitQuizAttempt,
} from '../api/quizzes.api';

/**
 * تحويل نص السؤال من Record<string, any> لـ string
 */
function resolveText(text) {
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    return text.ar || text.en || Object.values(text)[0] || '';
  }
  return String(text);
}

// مؤقت تنازلي
function useCountdown(endTime, onEnd) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setRemaining(diff);
      if (diff === 0 && onEnd) onEnd();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return { remaining, minutes, seconds };
}

export default function StudentQuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptFromUrl = searchParams.get('attempt');

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selectedOption, textAnswer } }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [savingIds, setSavingIds] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const submittedRef = useRef(false);

  // تحميل الاختبار + بدء/استئناف المحاولة
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const quizData = await getStudentQuizById(quizId);
        if (!mounted) return;
        setQuiz(quizData);

        // هل في محاولة جارية في الـ quiz.attempts؟
        const inProgress = quizData.attempts?.find((a) => a.status === 'in_progress');

        let activeAttempt = null;
        if (attemptFromUrl) {
          // استئناف محاولة معينة
          activeAttempt = quizData.attempts?.find((a) => a.id === attemptFromUrl);
        } else if (inProgress) {
          activeAttempt = inProgress;
        }

        // لو مفيش محاولة جارية، ابدأ واحدة جديدة
        if (!activeAttempt) {
          const newAttempt = await startQuizAttempt(quizId);
          if (!mounted) return;
          activeAttempt = newAttempt;
        }

        setAttempt(activeAttempt);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              'تعذر تحميل الاختبار.'
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [quizId, attemptFromUrl]);

  // حساب وقت النهاية
  const startedAt = attempt?.startedAt ? new Date(attempt.startedAt).getTime() : null;
  const durationMs = quiz?.durationMinutes ? quiz.durationMinutes * 60 * 1000 : null;
  const endTime = startedAt && durationMs ? startedAt + durationMs : null;

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (!attempt || submittedRef.current) return;
      submittedRef.current = true;

      setIsSubmitting(true);
      try {
        await submitQuizAttempt(quizId, attempt.id);
        navigate(`/student/quizzes/${quizId}/result/${attempt.id}`, {
          replace: true,
        });
      } catch (err) {
        console.error(err);
        if (!autoSubmit) {
          alert(
            err?.response?.data?.message ||
              'تعذر تسليم الاختبار. حاول تاني.'
          );
        }
        submittedRef.current = false;
        setIsSubmitting(false);
      }
    },
    [attempt, quizId, navigate]
  );

  const { minutes, seconds } = useCountdown(endTime, () => {
    if (!isSubmitting) handleSubmit(true);
  });

  // اختيار إجابة
  const handleAnswer = async (questionId, payload) => {
    // تحديث الـ UI فوراً
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...payload },
    }));

    // إرسال للباك
    if (!attempt) return;
    setSavingIds((prev) => ({ ...prev, [questionId]: true }));
    try {
      await answerQuestion(quizId, attempt.id, {
        questionId,
        ...payload,
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    } finally {
      setSavingIds((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-3xl mx-auto">
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !quiz || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error || 'الاختبار غير متاح'}</p>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
        >
          رجوع للاختبارات
        </button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ?.id] || {};
  const answeredCount = Object.keys(answers).length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const isLowTime = minutes < 5;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header: Timer + Progress */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              سؤال {currentIndex + 1} من {questions.length}
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold ${
              isLowTime
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Clock size={18} />
            <span className="font-mono">
              {String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <p className="text-lg font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">
              {resolveText(currentQ.text)}
            </p>
            <span className="shrink-0 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400">
              {currentQ.marks} درجة
            </span>
          </div>

          {/* Options (MCQ) */}
          {currentQ.type === 'mcq' && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                const selected = currentAnswer.selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      handleAnswer(currentQ.id, { selectedOption: opt.id })
                    }
                    className={`w-full text-start px-4 py-3 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {selected && (
                          <CheckCircle2 size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {resolveText(opt.text)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Text Answer */}
          {currentQ.type === 'short_answer' && (
            <textarea
              value={currentAnswer.textAnswer || ''}
              onChange={(e) =>
                handleAnswer(currentQ.id, { textAnswer: e.target.value })
              }
              rows={4}
              placeholder="اكتب إجابتك هنا..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-y"
            />
          )}

          {/* Saving indicator */}
          {savingIds[currentQ.id] && (
            <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" />
              جاري الحفظ...
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight size={16} />
          السابق
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              جاري التسليم...
            </>
          ) : (
            <>
              <Send size={16} />
              تسليم الاختبار
            </>
          )}
        </button>

        <button
          onClick={() =>
            setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
          }
          disabled={currentIndex === questions.length - 1}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          التالي
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {questions.map((q, i) => {
          const answered = !!answers[q.id];
          const current = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                current
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                  : answered
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              تأكيد التسليم
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              جاوبت على {answeredCount} من {questions.length} سؤال.
              {answeredCount < questions.length &&
                ' الأسئلة اللي مش مجاوب عليها مش هتاخد درجات.'}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                رجوع
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
              >
                <Send size={16} />
                أيوه، سلّم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
