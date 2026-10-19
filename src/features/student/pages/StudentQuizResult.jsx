import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  AlertCircle,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { getAttemptResult, getStudentQuizById } from '../api/quizzes.api';

function resolveText(text) {
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    return text.ar || text.en || Object.values(text)[0] || '';
  }
  return String(text);
}

export default function StudentQuizResult() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setIsLoading(true);
        const [resultData, quizData] = await Promise.all([
          getAttemptResult(attemptId),
          getStudentQuizById(quizId),
        ]);
        if (!mounted) return;
        setResult(resultData);
        setQuiz(quizData);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err?.response?.data?.message || 'تعذر تحميل النتيجة.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [quizId, attemptId]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !result || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error || 'النتيجة غير متاحة'}</p>
        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
        >
          رجوع للاختبارات
        </Link>
      </div>
    );
  }

  const passed = result.passed === true;
  const percentage = Math.round(result.percentage || 0);
  const score = result.score ?? 0;
  const maxScore = result.maxScore ?? quiz.totalMarks;
  const showCorrect = quiz.showCorrectAnswers;

  const questions = quiz.questions || [];
  const answersMap = new Map((result.answers || []).map((a) => [a.questionId, a]));

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <Link
        to="/student/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowRight size={16} />
        رجوع للاختبارات
      </Link>

      {/* Result Card */}
      <div
        className={`rounded-2xl p-6 text-center ${
          passed
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        } text-white`}
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
          {passed ? <Trophy size={40} /> : <XCircle size={40} />}
        </div>
        <h1 className="text-2xl font-bold mb-1">
          {passed ? 'مبروك! نجحت 🎉' : 'للأسف، ماعدّيتش'}
        </h1>
        <p className="text-white/80 text-sm">{quiz.title}</p>

        <div className="mt-5 flex items-center justify-center gap-6">
          <div>
            <p className="text-3xl font-bold">{score}/{maxScore}</p>
            <p className="text-xs text-white/70 mt-1">الدرجة</p>
          </div>
          <div className="w-px h-12 bg-white/30" />
          <div>
            <p className="text-3xl font-bold">{percentage}%</p>
            <p className="text-xs text-white/70 mt-1">النسبة</p>
          </div>
          <div className="w-px h-12 bg-white/30" />
          <div>
            <p className="text-3xl font-bold">{quiz.passingMarks}</p>
            <p className="text-xs text-white/70 mt-1">درجة النجاح</p>
          </div>
        </div>
      </div>

      {/* Answers Review */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <ClipboardList size={20} className="text-indigo-600" />
          مراجعة الإجابات
        </h2>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const ans = answersMap.get(q.id);
            const isCorrect = ans?.isCorrect === true;
            const answered = !!ans;
            const correctOptId = ans?.correctOptionId;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                      !answered
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        : isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">
                      {resolveText(q.text)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {q.marks} درجة
                      {answered && ans.marksAwarded != null && (
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {' '}· حصلت على {ans.marksAwarded}
                        </span>
                      )}
                    </p>

                    {/* Options review */}
                    {q.type === 'mcq' && q.options && (
                      <div className="mt-3 space-y-1.5">
                        {q.options.map((opt) => {
                          const isSelected =
                            ans && ans.questionId === q.id; // الـ selectedOption مش راجع من الـ result
                          const isCorrectOpt = showCorrect && correctOptId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                isCorrectOpt
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {isCorrectOpt && <CheckCircle2 size={14} />}
                              <span>{resolveText(opt.text)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Not answered */}
                    {!answered && (
                      <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                        لم تجاوب على هذا السؤال
                      </p>
                    )}
                  </div>

                  {/* Status icon */}
                  <div className="shrink-0">
                    {!answered ? (
                      <AlertCircle size={20} className="text-gray-400" />
                    ) : isCorrect ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-center pt-2">
        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={16} />
          رجوع للاختبارات
        </Link>
      </div>
    </div>
  );
}
