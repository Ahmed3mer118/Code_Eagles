// src/features/student/hooks/useStudentSubjectDetails.js
import { useCallback, useEffect, useState } from 'react';
import studentSubjectsApi from '../api/subjects.api';
import studentCoursesApi from '../api/courses.api';

export function useStudentSubjectDetails(subjectId) {
  const [data, setData] = useState({
    subject: null,
    courses: [],
    groups: [],
    lectures: [],
    assignments: [],
    quizzes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!subjectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    const results = await Promise.allSettled([
      studentSubjectsApi.getSubject(subjectId),           // 0: Subject
      studentSubjectsApi.getCourses({ subjectId }),       // 1: Courses
      studentSubjectsApi.getGroups(),                     // 2: Groups
      studentSubjectsApi.getAssignments({ subjectId }),   // 3: Assignments
      studentSubjectsApi.getQuizzes({ subjectId }),       // 4: Quizzes
    ]);

    const extract = (r, fallback = []) => {
      if (r.status !== 'fulfilled') return fallback;
      const payload = r.value?.data ?? r.value;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return payload ?? fallback;
    };

    const subject = extract(results[0], null);
    let courses = extract(results[1], []);
    const allGroups = extract(results[2], []);
    const assignments = extract(results[3], []);
    const quizzes = extract(results[4], []);

    // فلترة المجموعات
    const groups = allGroups.filter(
      (g) => g?.subject?.id === subjectId || g?.subjectId === subjectId,
    );

    // ==========================================
    // 🆕 استخراج المحاضرات من الكورسات والوحدات
    // ==========================================
    let allLectures = [];

    // 1. لو الكورسات جاية وفيها modules جاهزة
    courses.forEach(course => {
      if (course.modules && Array.isArray(course.modules)) {
        course.modules.forEach(mod => {
          if (mod.lectures && Array.isArray(mod.lectures)) {
            allLectures.push(...mod.lectures.map(l => ({ ...l, module: mod })));
          }
        });
      }
    });

    // 2. لو مفيش محاضرات لسه، هنجيب تفاصيل كل كورس (عشان الـ endpoint بيرجع الـ modules)
    if (allLectures.length === 0 && courses.length > 0) {
      const courseDetailsResults = await Promise.allSettled(
        courses.map(c => studentCoursesApi.getCourse(c.id))
      );

      courseDetailsResults.forEach((r, idx) => {
        if (r.status !== 'fulfilled') return;
        const payload = r.value?.data ?? r.value;
        const courseData = payload?.data ?? payload;
        
        // نحدث الكورس في المصفوفة عشان يكون فيه الـ modules
        courses[idx] = courseData;

        if (courseData?.modules && Array.isArray(courseData.modules)) {
          courseData.modules.forEach(mod => {
            if (mod.lectures && Array.isArray(mod.lectures)) {
              allLectures.push(...mod.lectures.map(l => ({ ...l, module: mod })));
            }
          });
        }
      });
    }

    setData({
      subject,
      courses,
      groups,
      lectures: allLectures,
      assignments,
      quizzes,
    });

    if (results.every((r) => r.status === 'rejected')) {
      setError('فشل تحميل بيانات المادة');
    }

    setLoading(false);
  }, [subjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
}

export default useStudentSubjectDetails;
