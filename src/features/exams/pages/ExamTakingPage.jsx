import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { quizApi } from '../../../shared/api/platformApi';
import LoadingScreen from '../../../shared/ui/LoadingScreen';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog';
import ExamTimer from '../components/ExamTimer';
import ExamProgressBar from '../components/ExamProgressBar';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionPanel from '../components/QuestionPanel';
import {
  answersToPayload,
  buildAnswerMap,
  countAnswered,
  countUnanswered,
} from '../utils/examHelpers';

export default function ExamTakingPage() {
  const { quizId, attemptId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [settings, setSettings] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerMap, setAnswerMap] = useState({});
  const [flaggedIds, setFlaggedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const autosaveRef = useRef(null);

  const questions = exam?.questions || [];
  const onePerPage = settings.oneQuestionPerPage !== false;
  const allowBack = settings.allowBackNavigation !== false;

  const loadSession = useCallback(async () => {
    try {
      if (location.state?.session) {
        const { attempt: att, exam: ex, settings: st } = location.state.session;
        setAttempt(att);
        setExam(ex);
        setSettings(st || {});
        setCurrentIndex(att.currentQuestionIndex || 0);
        setAnswerMap(buildAnswerMap(att.answers));
        setFlaggedIds((att.flaggedQuestionIds || []).map(String));
        setLoading(false);
        return;
      }
      const data = await quizApi.getAttempt(quizId, attemptId);
      setAttempt(data.attempt);
      setExam(data.exam);
      setSettings(data.settings || {});
      setCurrentIndex(data.attempt.currentQuestionIndex || 0);
      setAnswerMap(buildAnswerMap(data.attempt.answers));
      setFlaggedIds((data.attempt.flaggedQuestionIds || []).map(String));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
      navigate(`/dashboard/student/quizzes/${quizId}`);
    } finally {
      setLoading(false);
    }
  }, [attemptId, location.state, navigate, quizId, t]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const blockCopy = (e) => {
      e.preventDefault();
      return false;
    };
    const blockKeys = (e) => {
      const key = e.key?.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(key)) {
        e.preventDefault();
      }
      if (key === 'f12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key))) {
        e.preventDefault();
      }
    };
    document.body.classList.add('ce-exam-mode');
    document.addEventListener('copy', blockCopy);
    document.addEventListener('cut', blockCopy);
    document.addEventListener('contextmenu', blockCopy);
    document.addEventListener('paste', blockCopy);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('selectstart', blockCopy);
    document.addEventListener('dragstart', blockCopy);
    return () => {
      document.body.classList.remove('ce-exam-mode');
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('cut', blockCopy);
      document.removeEventListener('contextmenu', blockCopy);
      document.removeEventListener('paste', blockCopy);
      document.removeEventListener('keydown', blockKeys);
      document.removeEventListener('selectstart', blockCopy);
      document.removeEventListener('dragstart', blockCopy);
    };
  }, []);

  const persist = useCallback(async (silent = true) => {
    if (!attempt?._id || settings.autoSaveEnabled === false) return;
    setSaving(true);
    try {
      await quizApi.saveAttempt(quizId, attemptId, {
        answers: answersToPayload(answerMap),
        currentQuestionIndex: currentIndex,
        flaggedQuestionIds: flaggedIds,
      });
      if (!silent) toast.success(t('exams.saved'));
    } catch (err) {
      if (err?.response?.data?.autoSubmitted) {
        navigate(`/dashboard/student/quizzes/${quizId}/results/${attemptId}`);
        return;
      }
      if (!silent) toast.error(t('exams.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [answerMap, attempt?._id, attemptId, currentIndex, flaggedIds, navigate, quizId, settings.autoSaveEnabled, t]);

  useEffect(() => {
    if (loading) return undefined;
    autosaveRef.current = setInterval(() => persist(true), 5000);
    return () => clearInterval(autosaveRef.current);
  }, [loading, persist, answerMap, currentIndex, flaggedIds]);

  const submitExam = useCallback(async (auto = false) => {
    setSubmitting(true);
    try {
      const data = await quizApi.submitAttempt(quizId, attemptId, {
        answers: answersToPayload(answerMap),
      });
      navigate(`/dashboard/student/quizzes/${quizId}/results/${attemptId}`, { state: { result: data, autoSubmitted: auto } });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }, [answerMap, attemptId, navigate, quizId, t]);

  const handleExpire = useCallback(async () => {
    toast.error(t('exams.timeExpired'));
    await submitExam(true);
  }, [submitExam, t]);

  const unanswered = useMemo(() => countUnanswered(questions, answerMap), [questions, answerMap]);
  const answered = useMemo(() => countAnswered(questions, answerMap), [questions, answerMap]);

  const setAnswer = (questionId, value) => {
    setAnswerMap((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleFlag = (questionId) => {
    setFlaggedIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  if (loading) return <LoadingScreen />;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="ce-exam-taking min-h-screen select-none bg-[var(--ce-bg)] pb-8">
      <div className="sticky top-0 z-40 border-b border-[var(--ce-border)] bg-[var(--ce-surface)]/95 backdrop-blur">
        <div className="ce-container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <h1 className="text-lg font-extrabold text-[var(--ce-primary)]">{exam?.title}</h1>
            <p className="text-xs text-[var(--ce-muted)]">
              {t('exams.attemptNumber', { n: attempt?.attemptNumber || 1 })}
              {saving && ` · ${t('exams.saving')}`}
            </p>
          </div>
          <ExamTimer expiresAt={attempt?.expiresAt} onExpire={handleExpire} />
        </div>
      </div>

      <div className="ce-container grid gap-6 py-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <ExamProgressBar answered={answered} total={questions.length} />

          {onePerPage ? (
            <QuestionPanel
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              value={answerMap[String(currentQuestion?._id)]}
              onChange={(val) => setAnswer(String(currentQuestion?._id), val)}
              flagged={flaggedIds.includes(String(currentQuestion?._id))}
              onToggleFlag={toggleFlag}
            />
          ) : (
            questions.map((q, index) => (
              <QuestionPanel
                key={q._id}
                question={q}
                index={index}
                total={questions.length}
                value={answerMap[String(q._id)]}
                onChange={(val) => setAnswer(String(q._id), val)}
                flagged={flaggedIds.includes(String(q._id))}
                onToggleFlag={toggleFlag}
              />
            ))
          )}

          {onePerPage && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="ce-btn ce-btn-ghost"
                disabled={!allowBack || currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('exams.previous')}
              </button>
              <button
                type="button"
                className="ce-btn ce-btn-primary"
                disabled={currentIndex >= questions.length - 1}
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              >
                {t('exams.next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            className="ce-btn ce-btn-accent w-full sm:w-auto"
            disabled={submitting}
            onClick={() => setConfirmOpen(true)}
          >
            <Send className="h-4 w-4" />
            {t('exams.finishExam')}
          </button>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answerMap={answerMap}
            flaggedIds={flaggedIds}
            onSelect={setCurrentIndex}
          />
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t('exams.submitTitle')}
        message={
          unanswered > 0
            ? t('exams.submitConfirmUnanswered', { count: unanswered })
            : t('exams.submitConfirm')
        }
        confirmLabel={t('exams.submitExam')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => submitExam(false)}
      />
    </div>
  );
}
