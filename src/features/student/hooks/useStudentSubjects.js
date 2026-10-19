// src/features/student/hooks/useStudentSubjects.js
import { useCallback, useEffect, useState } from 'react';
import studentSubjectsApi from '../api/subjects.api';

/**
 * hook لجلب المواد
 * لو endpoint /student/subjects مش موجود، بيرجع المواد من enrollments كـ fallback
 */
export function useStudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState('direct'); // 'direct' | 'fallback'

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // محاولة 1: endpoint مباشر
      const res = await studentSubjectsApi.getSubjects();
      const payload = res?.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? payload?.items ?? [];

      if (items.length > 0 || Array.isArray(payload)) {
        setSubjects(items);
        setSource('direct');
        setLoading(false);
        return;
      }
    } catch (err) {
      // endpoint مش موجود — نستخدم fallback
      console.warn('Direct subjects endpoint failed, using fallback:', err?.message);
    }

    // محاولة 2: fallback من enrollments
    try {
      const enrollmentsRes = await studentSubjectsApi.getEnrollments();
      const payload = enrollmentsRes?.data ?? enrollmentsRes;
      const enrollments = Array.isArray(payload)
        ? payload
        : payload?.data ?? [];

      // نجمع المواد الفريدة من المجموعات
      const subjectsMap = new Map();
      enrollments.forEach((enrollment) => {
        const subject = enrollment?.group?.subject;
        if (subject?.id && !subjectsMap.has(subject.id)) {
          subjectsMap.set(subject.id, {
            ...subject,
            enrollmentsCount: 1,
            groups: [enrollment.group],
          });
        } else if (subject?.id) {
          const existing = subjectsMap.get(subject.id);
          existing.enrollmentsCount += 1;
          existing.groups.push(enrollment.group);
        }
      });

      setSubjects(Array.from(subjectsMap.values()));
      setSource('fallback');
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل المواد',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    subjects,
    loading,
    error,
    source,
    refetch: fetchData,
  };
}

export default useStudentSubjects;
