// src/features/assistant/api/assistantApi.js
import apiClient from '../../../shared/api/client';

export const assistantApi = {
  /* ═══════ Profile & Dashboard ═══════ */
  getMe: () => apiClient.get('/assistant/me'),
  getDashboard: () => apiClient.get('/assistant/dashboard'),

  /* ═══════ Groups & Students ═══════ */
  getGroups: () => apiClient.get('/assistant/groups'),
  getGroupById: (id) => apiClient.get(`/assistant/groups/${id}`),
  getGroupStudents: (id) => apiClient.get(`/assistant/groups/${id}/students`),

  /* ═══════ Quizzes — كل شيء تحت /assistant ═══════ */
  getQuizzes: (params) => apiClient.get('/assistant/quizzes', { params }),
  getQuizById: (id) => apiClient.get(`/assistant/quizzes/${id}`),
  createQuiz: (data) => apiClient.post('/assistant/quizzes', data),
  updateQuiz: (id, data) => apiClient.patch(`/assistant/quizzes/${id}`, data),
  deleteQuiz: (id) => apiClient.delete(`/assistant/quizzes/${id}`),
  publishQuiz: (id) => apiClient.patch(`/assistant/quizzes/${id}/publish`),
  linkQuizGroups: (id, data) =>
    apiClient.post(`/assistant/quizzes/${id}/groups`, data),

  // الأسئلة
  createQuestion: (quizId, data) =>
    apiClient.post(`/assistant/quizzes/${quizId}/questions`, data),
  updateQuestion: (quizId, qId, data) =>
    apiClient.patch(`/assistant/quizzes/${quizId}/questions/${qId}`, data),
  deleteQuestion: (quizId, qId) =>
    apiClient.delete(`/assistant/quizzes/${quizId}/questions/${qId}`),
  reorderQuestions: (quizId, data) =>
    apiClient.post(`/assistant/quizzes/${quizId}/questions/reorder`, data),

  // المحاولات
  getQuizAttempts: (quizId, params) =>
    apiClient.get(`/assistant/quizzes/${quizId}/attempts`, { params }),
  listAttempts: (params) =>
    apiClient.get('/assistant/quiz-attempts', { params }),
  getQuizAttempt: (id) => apiClient.get(`/assistant/quiz-attempts/${id}`),
  gradeQuizAttempt: (id, data) =>
    apiClient.patch(`/assistant/quiz-attempts/${id}/grade`, data),

  /* ═══════ Assignments — نستخدم teacher endpoints (شغالة للمساعد) ═══════ */
  getAssignments: (params) => apiClient.get('/teacher/assignments', { params }),
  getAssignmentById: (id) => apiClient.get(`/teacher/assignments/${id}`),
  getAssignmentSubmissions: (id, params) =>
    apiClient.get(`/teacher/assignments/${id}/submissions`, { params }),
  gradeSubmission: (id, data) =>
    apiClient.patch(`/teacher/submissions/${id}/grade`, data),

  /* ═══════ Subjects ═══════ */
  getSubjects: (params) => apiClient.get('/tenant/subjects', { params }),
};

export default assistantApi;