import getApiClient from './client';

export const contentApi = {
  listSubjects(params = {}) {
    return getApiClient().get('/api/content/subjects', { params }).then((r) => r.data);
  },
  createSubject(payload) {
    return getApiClient().post('/api/content/subjects', payload).then((r) => r.data);
  },
  updateSubject(id, payload) {
    return getApiClient().patch(`/api/content/subjects/${id}`, payload).then((r) => r.data);
  },
  deleteSubject(id) {
    return getApiClient().delete(`/api/content/subjects/${id}`).then((r) => r.data);
  },
  getSubjectTree(id) {
    return getApiClient().get(`/api/content/subjects/${id}/tree`).then((r) => r.data);
  },
  myLearning() {
    return getApiClient().get('/api/content/my-learning').then((r) => r.data);
  },
  updateLesson(id, payload) {
    return getApiClient().patch(`/api/content/lessons/${id}`, payload).then((r) => r.data);
  },
  deleteLesson(id) {
    return getApiClient().delete(`/api/content/lessons/${id}`).then((r) => r.data);
  },
  updateModule(id, payload) {
    return getApiClient().patch(`/api/content/modules/${id}`, payload).then((r) => r.data);
  },
  deleteModule(id) {
    return getApiClient().delete(`/api/content/modules/${id}`).then((r) => r.data);
  },
  reorderModules(items) {
    return getApiClient().patch('/api/content/modules/reorder/batch', { items }).then((r) => r.data);
  },
  reorderLessons(items) {
    return getApiClient().patch('/api/content/lessons/reorder/batch', { items }).then((r) => r.data);
  },
  reorderLectures(items) {
    return getApiClient().patch('/api/content/lectures/reorder/batch', { items }).then((r) => r.data);
  },
  createCourse(subjectId, payload) {
    return getApiClient().post(`/api/content/subjects/${subjectId}/courses`, payload).then((r) => r.data);
  },
  createModule(courseId, payload) {
    return getApiClient().post(`/api/content/courses/${courseId}/modules`, payload).then((r) => r.data);
  },
  createLesson(moduleId, payload) {
    return getApiClient().post(`/api/content/modules/${moduleId}/lessons`, payload).then((r) => r.data);
  },
  listLectures(lessonId) {
    return getApiClient().get(`/api/content/lessons/${lessonId}/lectures`).then((r) => r.data);
  },
  createLecture(lessonId, payload) {
    return getApiClient().post(`/api/content/lessons/${lessonId}/lectures`, payload).then((r) => r.data);
  },
  updateLecture(id, payload) {
    return getApiClient().patch(`/api/content/lectures/${id}`, payload).then((r) => r.data);
  },
  deleteLecture(id) {
    return getApiClient().delete(`/api/content/lectures/${id}`).then((r) => r.data);
  },
};

export const quizApi = {
  list(params = {}) {
    return getApiClient().get('/api/quizzes', { params }).then((r) => r.data);
  },
  getOne(id) {
    return getApiClient().get(`/api/quizzes/${id}`).then((r) => r.data);
  },
  examInfo(id) {
    return getApiClient().get(`/api/quizzes/${id}/exam-info`).then((r) => r.data);
  },
  start(id) {
    return getApiClient().post(`/api/quizzes/${id}/start`).then((r) => r.data);
  },
  getAttempt(quizId, attemptId) {
    return getApiClient().get(`/api/quizzes/${quizId}/attempt/${attemptId}`).then((r) => r.data);
  },
  saveAttempt(quizId, attemptId, payload) {
    return getApiClient().patch(`/api/quizzes/${quizId}/attempt/${attemptId}/save`, payload).then((r) => r.data);
  },
  submitAttempt(quizId, attemptId, payload = {}) {
    return getApiClient().post(`/api/quizzes/${quizId}/attempt/${attemptId}/submit`, payload).then((r) => r.data);
  },
  myHistory() {
    return getApiClient().get('/api/quizzes/my-history').then((r) => r.data);
  },
  teacherDashboard(params = {}) {
    return getApiClient().get('/api/quizzes/dashboard/teacher', { params }).then((r) => r.data);
  },
  searchAttempts(params = {}) {
    return getApiClient().get('/api/quizzes/attempts/search', { params }).then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/quizzes', payload).then((r) => r.data);
  },
  update(id, payload) {
    return getApiClient().patch(`/api/quizzes/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return getApiClient().delete(`/api/quizzes/${id}`).then((r) => r.data);
  },
  submit(id, answers) {
    return getApiClient().post(`/api/quizzes/${id}/submit`, { answers }).then((r) => r.data);
  },
  listAttempts(id) {
    return getApiClient().get(`/api/quizzes/${id}/attempts`).then((r) => r.data);
  },
  reviewAttempt(quizId, attemptId, payload) {
    return getApiClient().patch(`/api/quizzes/${quizId}/attempts/${attemptId}`, payload).then((r) => r.data);
  },
  bulkPublishAttempts(quizId, payload) {
    return getApiClient().post(`/api/quizzes/${quizId}/attempts/bulk-publish`, payload).then((r) => r.data);
  },
};

export const paymentApi = {
  create(payload) {
    return getApiClient().post('/api/payment-requests', payload).then((r) => r.data);
  },
  listMine() {
    return getApiClient().get('/api/payment-requests/me').then((r) => r.data);
  },
  listPending() {
    return getApiClient().get('/api/payment-requests/pending').then((r) => r.data);
  },
  review(id, payload) {
    return getApiClient().patch(`/api/payment-requests/${id}/review`, payload).then((r) => r.data);
  },
};

export const paymentPlanApi = {
  list(params = {}) {
    return getApiClient().get('/api/payment-plans', { params }).then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/payment-plans', payload).then((r) => r.data);
  },
  update(id, payload) {
    return getApiClient().patch(`/api/payment-plans/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return getApiClient().delete(`/api/payment-plans/${id}`).then((r) => r.data);
  },
  history(params = {}) {
    return getApiClient().get('/api/payment-plans/history/all', { params }).then((r) => r.data);
  },
};

export const assignmentApi = {
  list(params = {}) {
    return getApiClient().get('/api/assignments', { params }).then((r) => r.data);
  },
  listMine() {
    return getApiClient().get('/api/assignments/student/mine').then((r) => r.data);
  },
  getOne(id) {
    return getApiClient().get(`/api/assignments/${id}`).then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/assignments', payload).then((r) => r.data);
  },
  update(id, payload) {
    return getApiClient().patch(`/api/assignments/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return getApiClient().delete(`/api/assignments/${id}`).then((r) => r.data);
  },
  submit(id, payload) {
    return getApiClient().post(`/api/assignments/${id}/submit`, payload).then((r) => r.data);
  },
  listSubmissions(id, params = {}) {
    return getApiClient().get(`/api/assignments/${id}/submissions`, { params }).then((r) => r.data);
  },
  roster(id, params = {}) {
    return getApiClient().get(`/api/assignments/${id}/roster`, { params }).then((r) => r.data);
  },
  grade(id, submissionId, payload) {
    return getApiClient().patch(`/api/assignments/${id}/submissions/${submissionId}/grade`, payload).then((r) => r.data);
  },
};

export const groupApi = {
  list(params = {}) {
    return getApiClient().get('/api/groups', { params }).then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/groups', payload).then((r) => r.data);
  },
  update(id, payload) {
    return getApiClient().patch(`/api/groups/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return getApiClient().delete(`/api/groups/${id}`).then((r) => r.data);
  },
  enroll(groupId, payload = {}) {
    return getApiClient().post(`/api/groups/${groupId}/enroll`, payload).then((r) => r.data);
  },
  listEnrollments(groupId, params = {}) {
    return getApiClient().get(`/api/groups/${groupId}/enrollments`, { params }).then((r) => r.data);
  },
  reviewEnrollment(groupId, enrollmentId, payload) {
    return getApiClient().patch(`/api/groups/${groupId}/enrollments/${enrollmentId}`, payload).then((r) => r.data);
  },
  getPendingOne(enrollmentId) {
    return getApiClient().get(`/api/groups/enrollments/pending/${enrollmentId}`).then((r) => r.data);
  },
  myEnrollments(params = {}) {
    return getApiClient().get('/api/groups/enrollments/me', { params }).then((r) => r.data);
  },
  listPendingAll() {
    return getApiClient().get('/api/groups/enrollments/pending').then((r) => r.data);
  },
  getMeetingLink(groupId) {
    return getApiClient().get(`/api/groups/${groupId}/meeting-link`).then((r) => r.data);
  },
};

export const tenantApi = {
  getBySlug(slug) {
    return getApiClient().get(`/api/tenants/${slug}`).then((r) => r.data);
  },
  listPublic(params = {}) {
    return getApiClient().get('/api/tenants/public/list', { params }).then((r) => r.data);
  },
  listFeaturedCourses(params = {}) {
    return getApiClient().get('/api/tenants/public/featured-courses', { params }).then((r) => r.data);
  },
  listAll(params = {}) {
    return getApiClient().get('/api/tenants', { params }).then((r) => r.data);
  },
  getById(id) {
    return getApiClient().get(`/api/tenants/manage/${id}`).then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/tenants', payload).then((r) => r.data);
  },
  update(id, payload) {
    return getApiClient().patch(`/api/tenants/manage/${id}`, payload).then((r) => r.data);
  },
  updateStatus(id, status) {
    return getApiClient().patch(`/api/tenants/${id}/status`, { status }).then((r) => r.data);
  },
  updatePlan(id, plan) {
    return getApiClient().patch(`/api/tenants/${id}/plan`, { plan }).then((r) => r.data);
  },
  updateFeatures(id, features) {
    return getApiClient().patch(`/api/tenants/${id}/features`, { features }).then((r) => r.data);
  },
  approve(id, approvalStatus) {
    return getApiClient().patch(`/api/tenants/${id}/approve`, { approvalStatus }).then((r) => r.data);
  },
  updateBranding(id, payload) {
    return getApiClient().patch(`/api/tenants/${id}/branding`, payload).then((r) => r.data);
  },
  updatePackages(id, payload) {
    return getApiClient().patch(`/api/tenants/${id}/packages`, payload).then((r) => r.data);
  },
  updatePublicPage(id, payload) {
    return getApiClient().patch(`/api/tenants/${id}/public-page`, payload).then((r) => r.data);
  },
  updateStudentPolicy(id, payload) {
    return getApiClient().patch(`/api/tenants/${id}/student-policy`, payload).then((r) => r.data);
  },
};

export const uploadApi = {
  uploadReceipt(file) {
    const form = new FormData();
    form.append('file', file);
    return getApiClient()
      .post('/api/uploads/receipt', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
  uploadImage(file) {
    const form = new FormData();
    form.append('file', file);
    return getApiClient()
      .post('/api/uploads/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
  uploadAssignment(file) {
    const form = new FormData();
    form.append('file', file);
    return getApiClient()
      .post('/api/uploads/assignment', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};

export const statsApi = {
  public() {
    return getApiClient().get('/api/stats/public').then((r) => r.data);
  },
  platform() {
    return getApiClient().get('/api/stats/platform').then((r) => r.data);
  },
  tenant(tenantId) {
    return getApiClient().get(`/api/stats/tenant/${tenantId}`).then((r) => r.data);
  },
  me() {
    return getApiClient().get('/api/stats/me').then((r) => r.data);
  },
};

export const assistantApi = {
  list() {
    return getApiClient().get('/api/assistants').then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/assistants', payload).then((r) => r.data);
  },
  update(id, payload) {
    return getApiClient().patch(`/api/assistants/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return getApiClient().delete(`/api/assistants/${id}`).then((r) => r.data);
  },
  myPermissions() {
    return getApiClient().get('/api/assistants/me/permissions').then((r) => r.data);
  },
};

export const teacherApi = {
  search(q) {
    return getApiClient().get('/api/teacher/search', { params: { q } }).then((r) => r.data);
  },
  studentResults(params = {}) {
    return getApiClient().get('/api/teacher/student-results', { params }).then((r) => r.data);
  },
  listStudents(params = {}) {
    return getApiClient().get('/api/teacher/students', { params }).then((r) => r.data);
  },
  getStudent(id) {
    return getApiClient().get(`/api/teacher/students/${id}`).then((r) => r.data);
  },
  updateStudentStatus(id, status) {
    return getApiClient().patch(`/api/teacher/students/${id}/status`, { status }).then((r) => r.data);
  },
  reports() {
    return getApiClient().get('/api/teacher/reports').then((r) => r.data);
  },
};

export const promoApi = {
  list() {
    return getApiClient().get('/api/promo-codes').then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/promo-codes', payload).then((r) => r.data);
  },
  update(id, payload) {
    return getApiClient().patch(`/api/promo-codes/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return getApiClient().delete(`/api/promo-codes/${id}`).then((r) => r.data);
  },
  validate(payload) {
    return getApiClient().post('/api/promo-codes/validate', payload).then((r) => r.data);
  },
};

export const studentApi = {
  accessStatus() {
    return getApiClient().get('/api/students/access-status').then((r) => r.data);
  },
  dashboard() {
    return getApiClient().get('/api/students/dashboard').then((r) => r.data);
  },
  myAcademies() {
    return getApiClient().get('/api/students/my-academies').then((r) => r.data);
  },
  leaveAcademy() {
    return getApiClient().post('/api/students/leave-academy').then((r) => r.data);
  },
};

export const parentApi = {
  listChildren() {
    return getApiClient().get('/api/parent/children').then((r) => r.data);
  },
  childOverview(studentId) {
    return getApiClient().get(`/api/parent/children/${studentId}/overview`).then((r) => r.data);
  },
  notifications() {
    return getApiClient().get('/api/parent/notifications').then((r) => r.data);
  },
};

export const platformSiteApi = {
  getPublic() {
    return getApiClient().get('/api/platform/site').then((r) => r.data);
  },
  getAdmin() {
    return getApiClient().get('/api/platform/site/admin').then((r) => r.data);
  },
  updateSection(key, payload) {
    return getApiClient().patch(`/api/platform/site/sections/${key}`, payload).then((r) => r.data);
  },
  updateFooter(payload) {
    return getApiClient().patch('/api/platform/site/footer', payload).then((r) => r.data);
  },
  createFaq(payload) {
    return getApiClient().post('/api/platform/faq', payload).then((r) => r.data);
  },
  updateFaq(id, payload) {
    return getApiClient().patch(`/api/platform/faq/${id}`, payload).then((r) => r.data);
  },
  deleteFaq(id) {
    return getApiClient().delete(`/api/platform/faq/${id}`).then((r) => r.data);
  },
  updateBackupSettings(payload) {
    return getApiClient().patch('/api/platform/site/backup-settings', payload).then((r) => r.data);
  },
  runBackup(payload = {}) {
    return getApiClient().post('/api/platform/site/run-backup', payload).then((r) => r.data);
  },
  listBackups() {
    return getApiClient().get('/api/platform/site/backups').then((r) => r.data);
  },
  async downloadBackup(filename) {
    const response = await getApiClient().get(`/api/platform/site/backups/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  listTestimonials(params = {}) {
    return getApiClient().get('/api/platform/testimonials', { params }).then((r) => r.data);
  },
  createTestimonial(payload) {
    return getApiClient().post('/api/platform/testimonials', payload).then((r) => r.data);
  },
  updateTestimonial(id, payload) {
    return getApiClient().patch(`/api/platform/testimonials/${id}`, payload).then((r) => r.data);
  },
  removeTestimonial(id) {
    return getApiClient().delete(`/api/platform/testimonials/${id}`).then((r) => r.data);
  },
};

export const gamificationApi = {
  leaderboard(params = {}) {
    return getApiClient().get('/api/gamification/leaderboard', { params }).then((r) => r.data);
  },
};

export const subscriptionApi = {
  mine() {
    return getApiClient().get('/api/tenant-subscriptions/mine').then((r) => r.data);
  },
  request(payload) {
    return getApiClient().post('/api/tenant-subscriptions/request', payload).then((r) => r.data);
  },
  updateMine(payload) {
    return getApiClient().patch('/api/tenant-subscriptions/mine', payload).then((r) => r.data);
  },
  list(params = {}) {
    return getApiClient().get('/api/tenant-subscriptions', { params }).then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/tenant-subscriptions', payload).then((r) => r.data);
  },
  review(id, payload) {
    return getApiClient().patch(`/api/tenant-subscriptions/${id}/review`, payload).then((r) => r.data);
  },
  sendReminder(id) {
    return getApiClient().post(`/api/tenant-subscriptions/${id}/remind`).then((r) => r.data);
  },
};

export const platformPlanApi = {
  listPublic() {
    return getApiClient().get('/api/platform/plans').then((r) => r.data);
  },
  listAdmin() {
    return getApiClient().get('/api/platform/plans/admin').then((r) => r.data);
  },
  update(key, payload) {
    return getApiClient().patch(`/api/platform/plans/${key}`, payload).then((r) => r.data);
  },
  create(payload) {
    return getApiClient().post('/api/platform/plans', payload).then((r) => r.data);
  },
  toggleStatus(key) {
    return getApiClient().patch(`/api/platform/plans/${key}/toggle`).then((r) => r.data);
  },
};

export const FEATURE_KEYS = [
  'quizzes',
  'assignments',
  'certificates',
  'groups',
  'payments',
  'leaderboard',
  'discussions',
  'liveSessions',
];

export const ASSISTANT_PERMISSIONS = [
  'record_attendance',
  'homework_review',
  'quiz_review',
  'review_payments',
  'student_support',
  'manage_content',
  'view_student_reports',
  'enroll_students',
  'grade_assignments',
  'view_limited_reports',
  'reply_discussions',
  'manage_groups',
  'manage_quizzes',
];
