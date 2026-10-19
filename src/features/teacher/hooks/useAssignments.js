import { useState, useEffect, useCallback } from 'react';
import teacherApi from '@/shared/api/teacherApi';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

// ============ Assignments List ============
export function useAssignments(params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await teacherApi.getAssignments(params);
      setData(unwrap(res));
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

// ============ Single Assignment ============
export function useAssignment(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await teacherApi.getAssignment(id);
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

// ============ Mutations ============
export function useCreateAssignment() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (payload) => {
    setIsPending(true);
    try {
      const res = await teacherApi.createAssignment(payload);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useUpdateAssignment() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async ({ id, payload }) => {
    setIsPending(true);
    try {
      const res = await teacherApi.updateAssignment(id, payload);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function usePublishAssignment() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (id) => {
    setIsPending(true);
    try {
      const res = await teacherApi.publishAssignment(id);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useDeleteAssignment() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (id) => {
    setIsPending(true);
    try {
      const res = await teacherApi.deleteAssignment(id);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

// ============ Submissions ============
export function useSubmissions(params = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await teacherApi.getSubmissions(params);
      setData(unwrap(res));
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

export function useSubmission(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await teacherApi.getSubmission(id);
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

export function useGradeSubmission() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async ({ id, payload }) => {
    setIsPending(true);
    try {
      const res = await teacherApi.gradeSubmission(id, payload);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}

export function useReturnSubmission() {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = async (id) => {
    setIsPending(true);
    try {
      const res = await teacherApi.returnSubmission(id);
      return unwrap(res);
    } finally {
      setIsPending(false);
    }
  };
  return { mutateAsync, isPending };
}
