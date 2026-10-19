import apiClient from '../../../shared/api/client';

/**
 * جلب كل الاختبارات المتاحة للطالب
 * GET /api/student/quizzes
 */
export async function getStudentQuizzes() {
  const { data } = await apiClient.get('/api/student/quizzes');
  return data;
}

/**
 * جلب تفاصيل اختبار + الأسئلة
 * GET /api/student/quizzes/:id
 */
export async function getStudentQuizById(quizId) {
  const { data } = await apiClient.get(`/api/student/quizzes/${quizId}`);
  return data;
}

/**
 * بدء محاولة جديدة
 * POST /api/student/quizzes/:id/start
 */
export async function startQuizAttempt(quizId) {
  const { data } = await apiClient.post(`/api/student/quizzes/${quizId}/start`);
  return data;
}

/**
 * الإجابة على سؤال
 * POST /api/student/quizzes/:id/attempts/:attemptId/answer
 * body: { questionId, selectedOption?, textAnswer? }
 */
export async function answerQuestion(quizId, attemptId, payload) {
  const { data } = await apiClient.post(
    `/api/student/quizzes/${quizId}/attempts/${attemptId}/answer`,
    payload
  );
  return data;
}

/**
 * تسليم الاختبار
 * POST /api/student/quizzes/:id/attempts/:attemptId/submit
 */
export async function submitQuizAttempt(quizId, attemptId) {
  const { data } = await apiClient.post(
    `/api/student/quizzes/${quizId}/attempts/${attemptId}/submit`
  );
  return data;
}

/**
 * جلب محاولات الطالب في اختبار معين
 * GET /api/student/quizzes/:id/attempts
 */
export async function getQuizAttempts(quizId) {
  const { data } = await apiClient.get(`/api/student/quizzes/${quizId}/attempts`);
  return data;
}

/**
 * جلب تفاصيل محاولة
 * GET /api/student/attempts/:id
 */
export async function getAttemptById(attemptId) {
  const { data } = await apiClient.get(`/api/student/attempts/${attemptId}`);
  return data;
}

/**
 * جلب نتيجة محاولة
 * GET /api/student/attempts/:id/result
 */
export async function getAttemptResult(attemptId) {
  const { data } = await apiClient.get(`/api/student/attempts/${attemptId}/result`);
  return data;
}

export default {
  getStudentQuizzes,
  getStudentQuizById,
  startQuizAttempt,
  answerQuestion,
  submitQuizAttempt,
  getQuizAttempts,
  getAttemptById,
  getAttemptResult,
};
