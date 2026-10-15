// src/shared/api/teacherApi.js
import client from './client';

/**
 * Teacher API Wrapper
 * كل endpoints الـ teacher + tenant dashboard + notifications
 */
export const teacherApi = {
  // ============ Dashboard & Stats ============
  getDashboard: () => client.get('/tenant/dashboard'),
  getStats: () => client.get('/tenant/stats'),

  // ============ Profile ============
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.patch('/users/me', data),
  changePassword: (data) => client.post('/users/me/change-password', data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.post('/users/me/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ============ Notifications ============
  getUnreadCount: () => client.get('/me/notifications/unread-count'),
  getNotifications: (params) => client.get('/me/notifications', { params }),
  markNotificationRead: (id) => client.patch(`/me/notifications/${id}/read`),
  markAllNotificationsRead: () => client.patch('/me/notifications/read-all'),
  deleteNotification: (id) => client.delete(`/me/notifications/${id}`),

  // ============ Enrollments (Pending Requests) ============
  getEnrollments: (params) => client.get('/teacher/enrollments', { params }),
  getEnrollment: (id) => client.get(`/teacher/enrollments/${id}`),
  approveEnrollment: (id) => client.patch(`/teacher/enrollments/${id}/approve`),
  rejectEnrollment: (id, data) => client.patch(`/teacher/enrollments/${id}/reject`, data),
  cancelEnrollment: (id) => client.patch(`/teacher/enrollments/${id}/cancel`),

  // ============ Groups ============
  getGroups: (params) => client.get('/teacher/groups', { params }),
  getGroup: (id) => client.get(`/teacher/groups/${id}`),
  createGroup: (data) => client.post('/teacher/groups', data),
  updateGroup: (id, data) => client.patch(`/teacher/groups/${id}`, data),
  deleteGroup: (id) => client.delete(`/teacher/groups/${id}`),
  getGroupStats: (id) => client.get(`/teacher/groups/${id}/stats`),
  getGroupStudents: (id) => client.get(`/teacher/groups/${id}/students`),
  addGroupStudent: (id, data) => client.post(`/teacher/groups/${id}/students`, data),
  removeGroupStudent: (id, studentId) =>
    client.delete(`/teacher/groups/${id}/students/${studentId}`),
  getGroupAssistants: (id) => client.get(`/teacher/groups/${id}/assistants`),
  addGroupAssistant: (id, data) => client.post(`/teacher/groups/${id}/assistants`, data),
  removeGroupAssistant: (id, assistantId) =>
    client.delete(`/teacher/groups/${id}/assistants/${assistantId}`),

  // ============ Members (Students) ============
  getMembers: (params) => client.get('/teacher/members', { params }),
  getMember: (userId) => client.get(`/teacher/members/${userId}`),
  updateMemberStatus: (userId, data) =>
    client.patch(`/teacher/members/${userId}/status`, data),
  removeMember: (userId) => client.delete(`/teacher/members/${userId}`),

  // ============ Assistants ============
  getAssistants: (params) => client.get('/teacher/assistants', { params }),
  getAssistant: (id) => client.get(`/teacher/assistants/${id}`),
  createAssistant: (data) => client.post('/teacher/assistants', data),
  updateAssistant: (id, data) => client.patch(`/teacher/assistants/${id}`, data),
  deleteAssistant: (id) => client.delete(`/teacher/assistants/${id}`),
  updateAssistantPermissions: (id, data) =>
    client.patch(`/teacher/assistants/${id}/permissions`, data),
  assignAssistantGroups: (id, data) =>
    client.post(`/teacher/assistants/${id}/groups`, data),

  // ============ Courses / Subjects ============
  getCourses: (params) => client.get('/tenant/courses', { params }),
  getCourse: (id) => client.get(`/tenant/courses/${id}`),
  createCourse: (data) => client.post('/tenant/courses', data),
  updateCourse: (id, data) => client.patch(`/tenant/courses/${id}`, data),
  deleteCourse: (id) => client.delete(`/tenant/courses/${id}`),
  publishCourse: (id) => client.patch(`/tenant/courses/${id}/publish`),
  archiveCourse: (id) => client.patch(`/tenant/courses/${id}/archive`),

  // ============ Lectures ============
  getLectures: (moduleId) => client.get(`/tenant/modules/${moduleId}/lectures`),
  getLecture: (id) => client.get(`/tenant/lectures/${id}`),
  createLecture: (moduleId, data) =>
    client.post(`/tenant/modules/${moduleId}/lectures`, data),
  updateLecture: (id, data) => client.patch(`/tenant/lectures/${id}`, data),
  deleteLecture: (id) => client.delete(`/tenant/lectures/${id}`),
  reorderLectures: (data) => client.post('/tenant/lectures/reorder', data),

  // ============ Quizzes ============
  getQuizzes: (params) => client.get('/teacher/quizzes', { params }),
  getQuiz: (id) => client.get(`/teacher/quizzes/${id}`),
  createQuiz: (data) => client.post('/teacher/quizzes', data),
  updateQuiz: (id, data) => client.patch(`/teacher/quizzes/${id}`, data),
  deleteQuiz: (id) => client.delete(`/teacher/quizzes/${id}`),
  publishQuiz: (id) => client.patch(`/teacher/quizzes/${id}/publish`),
  linkQuizGroups: (id, data) => client.post(`/teacher/quizzes/${id}/groups`, data),
  linkQuizStudents: (id, data) => client.post(`/teacher/quizzes/${id}/students`, data),
  getQuizAttempts: (id) => client.get(`/teacher/quizzes/${id}/attempts`),

  // ============ Quiz Questions ============
  createQuestion: (quizId, data) =>
    client.post(`/teacher/quizzes/${quizId}/questions`, data),
  updateQuestion: (quizId, qId, data) =>
    client.patch(`/teacher/quizzes/${quizId}/questions/${qId}`, data),
  deleteQuestion: (quizId, qId) =>
    client.delete(`/teacher/quizzes/${quizId}/questions/${qId}`),
  reorderQuestions: (quizId, data) =>
    client.post(`/teacher/quizzes/${quizId}/questions/reorder`, data),

  // ============ Quiz Attempts Grading ============
  getQuizAttemptsList: (params) => client.get('/teacher/quiz-attempts', { params }),
  getQuizAttempt: (id) => client.get(`/teacher/quiz-attempts/${id}`),
  gradeQuizAttempt: (id, data) =>
    client.patch(`/teacher/quiz-attempts/${id}/grade`, data),

  // ============ Assignments ============
  getAssignments: (params) => client.get('/teacher/assignments', { params }),
  getAssignment: (id) => client.get(`/teacher/assignments/${id}`),
  createAssignment: (data) => client.post('/teacher/assignments', data),
  updateAssignment: (id, data) => client.patch(`/teacher/assignments/${id}`, data),
  deleteAssignment: (id) => client.delete(`/teacher/assignments/${id}`),
  publishAssignment: (id) => client.patch(`/teacher/assignments/${id}/publish`),
  linkAssignmentGroups: (id, data) =>
    client.post(`/teacher/assignments/${id}/groups`, data),
  getAssignmentSubmissions: (id) =>
    client.get(`/teacher/assignments/${id}/submissions`),

  // ============ Submissions ============
  getSubmissions: (params) => client.get('/teacher/submissions', { params }),
  getSubmission: (id) => client.get(`/teacher/submissions/${id}`),
  gradeSubmission: (id, data) =>
    client.patch(`/teacher/submissions/${id}/grade`, data),
  returnSubmission: (id) => client.post(`/teacher/submissions/${id}/return`),

  // ============ Payment Plans ============
  getPaymentPlans: (params) => client.get('/teacher/payment-plans', { params }),
  getPaymentPlan: (id) => client.get(`/teacher/payment-plans/${id}`),
  createPaymentPlan: (data) => client.post('/teacher/payment-plans', data),
  updatePaymentPlan: (id, data) => client.patch(`/teacher/payment-plans/${id}`, data),
  deletePaymentPlan: (id) => client.delete(`/teacher/payment-plans/${id}`),

  // ============ Promo Codes ============
  getPromoCodes: (params) => client.get('/teacher/promo-codes', { params }),
  getPromoCode: (id) => client.get(`/teacher/promo-codes/${id}`),
  createPromoCode: (data) => client.post('/teacher/promo-codes', data),
  updatePromoCode: (id, data) => client.patch(`/teacher/promo-codes/${id}`, data),
  deletePromoCode: (id) => client.delete(`/teacher/promo-codes/${id}`),
  linkPromoGroups: (id, data) =>
    client.post(`/teacher/promo-codes/${id}/groups`, data),
  linkPromoPlans: (id, data) =>
    client.post(`/teacher/promo-codes/${id}/plans`, data),

  // ============ Payment Requests ============
  getPaymentRequests: (params) =>
    client.get('/teacher/payment-requests', { params }),
  getPaymentRequest: (id) => client.get(`/teacher/payment-requests/${id}`),
  approvePaymentRequest: (id, data) =>
    client.patch(`/teacher/payment-requests/${id}/approve`, data),
  rejectPaymentRequest: (id, data) =>
    client.patch(`/teacher/payment-requests/${id}/reject`, data),

  // ============ Platform Subscription ============
  getTenantSubscription: () => client.get('/tenant/subscription'),
  requestTenantSubscription: (data) =>
    client.post('/tenant/subscriptions/request', data),
  getTenantSubscriptionHistory: () => client.get('/tenant/subscription/history'),
  uploadPaymentProof: (id, data) =>
    client.patch(`/tenant/subscriptions/${id}/payment-proof`, data),

  // ============ Points ============
  addPoints: (data) => client.post('/teacher/points', data),
  getPoints: (params) => client.get('/teacher/points', { params }),
  getStudentPoints: (studentId) =>
    client.get(`/teacher/points/students/${studentId}`),
  getLeaderboard: (params) => client.get('/teacher/points/leaderboard', { params }),

  // ============ Notifications (Teacher Send) ============
  sendNotification: (data) => client.post('/teacher/notifications', data),
  broadcastNotification: (data) =>
    client.post('/teacher/notifications/broadcast', data),
  getSentNotifications: (params) =>
    client.get('/teacher/notifications/sent', { params }),
  deleteSentNotification: (id) => client.delete(`/teacher/notifications/${id}`),

  // ============ Tenant Settings ============
  getTenantSettings: () => client.get('/tenant/settings'),
  updateTenantSettings: (data) => client.patch('/tenant/settings', data),
  uploadTenantLogo: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.post('/tenant/logo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadTenantCover: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return client.post('/tenant/cover', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default teacherApi;
