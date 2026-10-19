import { useState, useEffect, useCallback } from 'react';
import teacherApi from '@/shared/api/teacherApi';

const unwrap = (res) => {
  const d = res?.data ?? res;
  return d?.data !== undefined ? d.data : d;
};

export function useQuizzes(params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await teacherApi.getQuizzes(params);
      setData(res?.data ?? res); // نحتفظ بالشكل الأصلي عشان نتعامل معاه في الصفحة
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

export function useQuiz(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await teacherApi.getQuiz(id);
      setData(unwrap(res));
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

export function useCreateQuiz() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (payload) => {
    setIsPending(true);
    try {
      const res = await teacherApi.createQuiz(payload);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useUpdateQuiz() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async ({ id, payload }) => {
    setIsPending(true);
    try {
      const res = await teacherApi.updateQuiz(id, payload);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function usePublishQuiz() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (id) => {
    setIsPending(true);
    try {
      const res = await teacherApi.publishQuiz(id);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useDeleteQuiz() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (id) => {
    setIsPending(true);
    try {
      const res = await teacherApi.deleteQuiz(id);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useCreateQuestion(quizId) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (payload) => {
    setIsPending(true);
    try {
      const res = await teacherApi.createQuestion(quizId, payload);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useUpdateQuestion(quizId) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async ({ qId, payload }) => {
    setIsPending(true);
    try {
      const res = await teacherApi.updateQuestion(quizId, qId, payload);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useDeleteQuestion(quizId) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (qId) => {
    setIsPending(true);
    try {
      const res = await teacherApi.deleteQuestion(quizId, qId);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useQuizAttempts(quizId, params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!!quizId);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    if (!quizId) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await teacherApi.getQuizAttempts(quizId, params);
      setData(unwrap(res));
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [quizId, paramsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch: fetchData };
}
