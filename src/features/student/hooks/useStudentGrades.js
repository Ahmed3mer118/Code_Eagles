// src/features/student/hooks/useStudentGrades.js
import { useState, useEffect, useCallback } from 'react';
import { getStudentQuizzes } from '../api/quizzes.api'; 

export default function useStudentGrades() {
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // بنجيب كل الكويزات، وكل كويز جواه الـ attempts بتاعته
      const quizzes = await getStudentQuizzes(); 
      const quizzesList = Array.isArray(quizzes) ? quizzes : (quizzes?.data || []);

      // بنجمع كل المحاولات من كل الكويزات في مصفوفة واحدة
      const allAttempts = [];
      quizzesList.forEach((quiz) => {
        if (quiz.attempts && quiz.attempts.length > 0) {
          quiz.attempts.forEach((attempt) => {
            allAttempts.push({
              ...attempt,
              quiz: { // بنضيف بيانات الكويز عشان نعرض اسمه
                id: quiz.id,
                title: quiz.title,
                totalMarks: quiz.totalMarks,
                passingMarks: quiz.passingMarks,
              }
            });
          });
        }
      });

      // بنفلتر المحاولات اللي خلصت (مش in_progress) 
      const gradedAttempts = allAttempts.filter(
        (a) => a.status === 'graded' || a.status === 'submitted'
      );

      // بنرتبهم من الأحدث للأقدم
      gradedAttempts.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));

      setGrades(gradedAttempts);
    } catch (err) {
      console.error('Failed to load grades:', err);
      setError(err?.response?.data?.message || 'تعذر تحميل الدرجات.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return { grades, isLoading, error, refetch: fetchGrades };
}
