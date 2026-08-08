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

export function getResultModeLabel(exam, t) {
  const key = exam?.resultMessageKey || exam?.resultMode;
  return t(`exams.resultModes.${key}`, t(`quizzes.result${exam?.resultMode === 'immediate' ? 'Immediate' : 'Teacher'}`, key));
}
