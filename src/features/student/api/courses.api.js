// src/features/student/api/courses.api.js
import apiClient from '@/shared/api/client';

export const studentCoursesApi = {
  /** GET /student/courses — كل الكورسات */
  getCourses: (params = {}) =>
    apiClient.get('/student/courses', { params }),

  /** GET /student/courses/:id — تفاصيل كورس */
  getCourse: (id) => apiClient.get(`/student/courses/${id}`),

  /** GET /student/modules/:moduleId/lectures — محاضرات وحدة */
  getModuleLectures: (moduleId) =>
    apiClient.get(`/student/modules/${moduleId}/lectures`),

  /** GET /student/lectures/:lectureId — محاضرة واحدة */
  getLecture: (lectureId) =>
    apiClient.get(`/student/lectures/${lectureId}`),

  /** GET /student/lecture-progress/:lectureId — تقدم محاضرة */
  getLectureProgress: (lectureId) =>
    apiClient.get(`/student/lecture-progress/${lectureId}`),

  /** POST /student/lecture-progress — تحديث تقدم */
  updateLectureProgress: (data) =>
    apiClient.post('/student/lecture-progress', data),
};

export default studentCoursesApi;
