export function formatDuration(seconds = 0) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function formatDateTime(value, locale) {
  if (!value) return '—';
  return new Date(value).toLocaleString(locale);
}

export function buildAnswerMap(answers = []) {
  return Object.fromEntries(
    answers.map((a) => [String(a.questionId), a.value])
  );
}

export function answersToPayload(answerMap = {}) {
  return Object.entries(answerMap).map(([questionId, value]) => ({
    questionId,
    value: value === undefined ? null : value,
  }));
}

export function isAnswered(value) {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

export function countAnswered(questions = [], answerMap = {}) {
  return questions.filter((q) => isAnswered(answerMap[String(q._id)])).length;
}

export function countUnanswered(questions = [], answerMap = {}) {
  return questions.length - countAnswered(questions, answerMap);
}

export function getRemainingSeconds(expiresAt) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

export function getAvailabilityLabel(exam, t) {
  if (!exam?.hasInProgress && (exam?.attemptsRemaining ?? 0) <= 0) {
    return t('exams.availability.max_attempts');
  }
  if (!exam?.availability?.available) {
    return t(`exams.availability.${exam?.availability?.reason || 'unavailable'}`, exam?.availability?.reason || 'unavailable');
  }
  return t('exams.statusAvailable');
}

export function canStartExam(exam) {
  if (exam?.hasInProgress) return true;
  return Boolean(
    exam?.availability?.available &&
    (exam?.attemptsRemaining ?? 0) > 0 &&
    exam?.access?.allowed !== false
  );
}

export function getStudentExamAction(exam) {
  const quizId = exam?._id;

  if (exam?.hasInProgress) {
    return {
      type: 'resume',
      disabled: false,
      labelKey: 'exams.resumeExam',
      to: `/dashboard/student/quizzes/${quizId}`,
      accent: true,
    };
  }

  if (canStartExam(exam)) {
    return {
      type: 'start',
      disabled: false,
      labelKey: 'exams.openExam',
      to: `/dashboard/student/quizzes/${quizId}`,
      accent: true,
    };
  }

  if (exam?.latestResult?.attemptId) {
    return {
      type: 'viewResult',
      disabled: false,
      labelKey: 'exams.viewResult',
      to: `/dashboard/student/quizzes/${quizId}/results/${exam.latestResult.attemptId}`,
      accent: true,
      result: exam.latestResult,
    };
  }

  const reason = !exam?.availability?.available
    ? exam?.availability?.reason
    : (exam?.attemptsRemaining ?? 0) <= 0
      ? 'max_attempts'
      : 'unavailable';

  return {
    type: 'disabled',
    disabled: true,
    labelKey: 'exams.startExam',
    reason,
    to: null,
    accent: false,
  };
}

export function getResultModeLabel(exam, t) {
  const key = exam?.resultMessageKey || exam?.resultMode;
  return t(`exams.resultModes.${key}`, t(`quizzes.result${exam?.resultMode === 'immediate' ? 'Immediate' : 'Teacher'}`, key));
}

export const FIXED_EXAM_INSTRUCTIONS = {
  ar: 'اقرأ كل سؤال بعناية. نظّم وقتك وراجع الأسئلة المعلّمة قبل التسليم.\n\nيبدأ المؤقت فقط بعد الضغط على بدء الامتحان.\n\nيتم حفظ إجاباتك تلقائيًا كل بضع ثوانٍ.\n\nاستخدم متصفح الأسئلة للانتقال بين الأسئلة وتعليمها للمراجعة.\n\nسلّم فقط عندما تكون مستعدًا. الأسئلة غير المجاب عنها تُحسب كم skipped.',
  en: 'Read each question carefully. Manage your time and review flagged questions before submitting.\n\nThe timer starts only after you click Start Exam.\n\nYour answers are automatically saved every few seconds.\n\nUse the question navigator to move between questions and flag questions for review.\n\nSubmit only when you are ready. Unanswered questions will be counted as skipped.',
};

export function getFixedExamInstructions(lang = 'ar') {
  return FIXED_EXAM_INSTRUCTIONS[lang] || FIXED_EXAM_INSTRUCTIONS.ar;
}

export function getExamInstructions(exam, lang = 'ar') {
  const fixed = getFixedExamInstructions(lang);
  const extra = exam?.instructions?.trim();
  if (!extra) return fixed;
  return `${fixed}\n\n${extra}`;
}
