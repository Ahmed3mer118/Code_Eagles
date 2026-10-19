import { useState, useEffect, useCallback } from 'react';
import {
  getStudentAssignmentById,
  submitAssignment,
} from '../api/assignments.api';

export default function useStudentAssignment(assignmentId) {
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const fetchAssignment = useCallback(async () => {
    if (!assignmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStudentAssignmentById(assignmentId);
      setAssignment(data);
    } catch (err) {
      console.error('Failed to load assignment:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تحميل الواجب.'
      );
      setAssignment(null);
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  const submit = useCallback(
    async (payload) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const result = await submitAssignment(assignmentId, payload);
        // إعادة جلب الواجب بعد التسليم
        await fetchAssignment();
        return { success: true, data: result };
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'تعذر تسليم الواجب.';
        setSubmitError(msg);
        return { success: false, error: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [assignmentId, fetchAssignment]
  );

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  return {
    assignment,
    isLoading,
    isSubmitting,
    error,
    submitError,
    refetch: fetchAssignment,
    submit,
  };
}
