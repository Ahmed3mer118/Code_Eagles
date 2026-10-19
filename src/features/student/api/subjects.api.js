// src/features/student/api/subjects.api.js
import apiClient from '@/shared/api/client';

/**
 * Student Subjects API
 * بيجمع من endpoints مختلفة عشان يبني صفحة المواد والتفاصيل
 */
export const studentSubjectsApi = {
  /** GET /student/subjects — المواد */
  getSubjects: () => apiClient.get('/student/subjects'),

  /** GET /student/subjects/:id — تفاصيل مادة */
  getSubject: (id) => apiClient.get(`/student/subjects/${id}`),

  /** GET /student/courses — كورسات الطالب */
  getCourses: (params = {}) =>
    apiClient.get('/student/courses', { params }),

  /** GET /student/courses/:id — تفاصيل كورس */
  getCourse: (id) => apiClient.get(`/student/courses/${id}`),

  /** GET /student/groups — المجموعات */
  getGroups: () => apiClient.get('/student/groups'),

  /** GET /student/enrollments — التسجيلات */
  getEnrollments: () => apiClient.get('/student/enrollments'),

  /** GET /student/lectures — المحاضرات */
  getLectures: (params = {}) =>
    apiClient.get('/student/lectures', { params }),

  /** GET /student/assignments — الواجبات */
  getAssignments: (params = {}) =>
    apiClient.get('/student/assignments', { params }),

  /** GET /student/quizzes — الاختبارات */
  getQuizzes: (params = {}) =>
    apiClient.get('/student/quizzes', { params }),
};

export default studentSubjectsApi;
