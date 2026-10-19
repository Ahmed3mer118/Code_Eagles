// src/features/student/api/lectures.api.js
import apiClient from '@/shared/api/client';

export const studentLecturesApi = {
  /** GET /student/courses — كل الكورسات (عشان نجيب الوحدات) */
  getCourses: (params = {}) =>
    apiClient.get('/student/courses', { params }),

  /** GET /student/courses/:id — تفاصيل كورس */
  getCourse: (id) => apiClient.get(`/student/courses/${id}`),

  /** GET /student/modules/:moduleId/lectures — محاضرات وحدة */
  getModuleLectures: (moduleId) =>
    apiClient.get(`/student/modules/${moduleId}/lectures`),

  /** GET /student/lectures/:id — محاضرة واحدة */
  getLectureById: (lectureId) =>
    apiClient.get(`/student/lectures/${lectureId}`),

  /** POST /student/lectures/:id/progress — تحديث التقدم */
  updateProgress: (lectureId, data) =>
    apiClient.post(`/student/lectures/${lectureId}/progress`, data),

  /** GET /student/lectures/:id/progress — جلب التقدم */
  getProgress: (lectureId) =>
    apiClient.get(`/student/lectures/${lectureId}/progress`),
};

// ==========================================
// 🆕 Aliases عشان الملفات القديمة ماتضربش Error
// ==========================================

export const getStudentLecturesByModule = (moduleId) =>
  studentLecturesApi.getModuleLectures(moduleId);

export const getStudentLectureById = (lectureId) =>
  studentLecturesApi
    .getLectureById(lectureId)
    .then((res) => res?.data ?? res);

export const updateLectureProgress = (lectureId, data) =>
  studentLecturesApi.updateProgress(lectureId, data);

export const getLectureProgress = (lectureId) =>
  studentLecturesApi.getProgress(lectureId);

// ==========================================

export default studentLecturesApi;
