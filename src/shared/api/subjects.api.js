import apiClient from '../../../shared/api/client';

/**
 * جلب المواد الخاصة بالطالب الحالي
 * GET /student/subjects
 * 
 * الـ Backend بيرجع مصفوفة مباشرة (مش { data, total })
 * والـ tenantId بيتبعت أوتوماتيك في الهيدر X-Tenant-Id
 */
export async function getStudentSubjects() {
  const { data } = await apiClient.get('/student/subjects');
  return data;
}

export default { getStudentSubjects };
