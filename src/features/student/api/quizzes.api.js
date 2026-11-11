import apiClient from '../../../shared/api/client';

/**
 * جلب كل الاختبارات المتاحة للطالب
 * GET /student/quizzes
 */
export async function getStudentQuizzes() {
  const { data } = await apiClient.get('/student/quizzes');
  return data;
}

/**
 * جلب تفاصيل اختبار + الأسئلة
 * GET /student/quizzes/:id
 */
export async function getStudentQuizById(quizId) {
  const { data } = await apiClient.get(`/student/quizzes/${quizId}`);
  return data;
}

/**
 * بدء محاولة جديدة
 * POST /student/quizzes/:id/start
 */
export async function startQuizAttempt(quizId) {
  const { data } = await apiClient.post(`/student/quizzes/${quizId}/start`);
  return data;
}

/**
 * الإجابة على سؤال
 * POST /student/quizzes/:id/attempts/:attemptId/answer
 * body: { questionId, selectedOption?, textAnswer? }
 */
export async function answerQuestion(quizId, attemptId, payload) {
  const { data } = await apiClient.post(
    `/student/quizzes/${quizId}/attempts/${attemptId}/answer`,
    payload
  );
  return data;
}

/**
 * تسليم الاختبار
 * POST /student/quizzes/:id/attempts/:attemptId/submit
 */
export async function submitQuizAttempt(quizId, attemptId) {
  const { data } = await apiClient.post(
    `/student/quizzes/${quizId}/attempts/${attemptId}/submit`
  );
  return data;
}

/**
 * جلب محاولات الطالب في اختبار معين
 * GET /student/quizzes/:id/attempts
 */
export async function getQuizAttempts(quizId) {
  const { data } = await apiClient.get(`/student/quizzes/${quizId}/attempts`);
  return data;
}

/**
 * جلب تفاصيل محاولة
 * GET /student/attempts/:id
 */
export async function getAttemptById(attemptId) {
  const { data } = await apiClient.get(`/student/attempts/${attemptId}`);
  return data;
}

/**
 * جلب نتيجة محاولة
 * GET /student/attempts/:id/result
 */
export async function getAttemptResult(attemptId) {
  const { data } = await apiClient.get(`/student/attempts/${attemptId}/result`);
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
