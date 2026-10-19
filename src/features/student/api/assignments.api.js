import apiClient from '../../../shared/api/client';

/**
 * جلب كل الواجبات الخاصة بالطالب
 * GET /api/student/assignments
 */
export async function getStudentAssignments() {
  const { data } = await apiClient.get('/api/student/assignments');
  return data;
}

/**
 * جلب تفاصيل واجب معين + التسليم بتاعه
 * GET /api/student/assignments/:id
 */
export async function getStudentAssignmentById(assignmentId) {
  const { data } = await apiClient.get(
    `/api/student/assignments/${assignmentId}`
  );
  return data;
}

/**
 * تسليم واجب (أول مرة أو تعديل تسليم موجود)
 * POST /api/student/assignments/:id/submit
 * body: { content?: string, attachmentUrl?: string }
 */
export async function submitAssignment(assignmentId, payload) {
  const { data } = await apiClient.post(
    `/api/student/assignments/${assignmentId}/submit`,
    payload
  );
  return data;
}

/**
 * جلب كل التسليمات بتاعة الطالب
 * GET /api/student/submissions
 */
export async function getStudentSubmissions() {
  const { data } = await apiClient.get('/api/student/submissions');
  return data;
}

/**
 * جلب تفاصيل تسليم معين
 * GET /api/student/submissions/:id
 */
export async function getStudentSubmissionById(submissionId) {
  const { data } = await apiClient.get(
    `/api/student/submissions/${submissionId}`
  );
  return data;
}

export default {
  getStudentAssignments,
  getStudentAssignmentById,
  submitAssignment,
  getStudentSubmissions,
  getStudentSubmissionById,
};

