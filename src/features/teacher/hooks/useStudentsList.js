// src/features/teacher/hooks/useStudentsList.js
import { useCallback, useEffect, useState } from 'react';
import teacherApi from '@/shared/api/teacherApi';

/**
 * هوك لجلب قائمة الطلاب (للـ picker في AddPointsModal)
 * مش بيتعامل مع pagination — بيجيب كل الطلاب على دفعات
 */
export function useStudentsList(search = '') {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        role: 'student',
        status: 'active',
        limit: 100,
        page: 1,
      };
      if (search.trim()) params.search = search.trim();

      const res = await teacherApi.getMembers(params);
      const payload = res?.data ?? res;
      const items =
        payload?.data ??
        payload?.items ??
        (Array.isArray(payload) ? payload : []);

      setStudents(items);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل قائمة الطلاب',
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    // debounce بسيط
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}

export default useStudentsList;
