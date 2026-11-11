import apiClient from '../../../shared/api/client';

export async function getStudentAssignments() {
  const { data } = await apiClient.get('/student/assignments');
  return data;
}

export async function getStudentAssignmentById(assignmentId) {
  const { data } = await apiClient.get(`/student/assignments/${assignmentId}`);
  return data;
}

export async function submitAssignment(assignmentId, payload) {
  const { data } = await apiClient.post(`/student/assignments/${assignmentId}/submit`, payload);
  return data;
}

export async function getStudentSubmissions() {
  const { data } = await apiClient.get('/student/submissions');
  return data;
}

export async function getStudentSubmissionById(submissionId) {
  const { data } = await apiClient.get(`/student/submissions/${submissionId}`);
  return data;
}

// ✅ الدالة الجديدة لرفع الملفات (صورة أو PDF)
export async function uploadAssignmentFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  // بنستخدم endpoint الـ file عشان يقبل PDF، ولو صورة ممكن تستخدمي image
  const { data } = await apiClient.post(
    `/upload/file?folder=assignments/submissions`,
    formData,
    {
      headers: {
        'Content-Type': undefined, // Axios هيضيف الـ boundary تلقائي
      },
    }
  );
  return data; // بيرجع { url, path, ... }
}

export default {
  getStudentAssignments,
  getStudentAssignmentById,
  submitAssignment,
  getStudentSubmissions,
  getStudentSubmissionById,
  uploadAssignmentFile,
};
