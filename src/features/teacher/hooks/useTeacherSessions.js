// src/features/teacher/hooks/useTeacherSessions.js
import { useState, useEffect, useCallback } from 'react';
import userService from '../../../shared/api/userService';

export function useTeacherSessions() {
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, historyRes] = await Promise.allSettled([
        userService.getSessions(),
        userService.getLoginHistory(1, 10),
      ]);

      if (sessionsRes.status === 'fulfilled') {
        setSessions(
          Array.isArray(sessionsRes.value) ? sessionsRes.value : [],
        );
      } else {
        setSessions([]);
      }

      if (historyRes.status === 'fulfilled') {
        const h = historyRes.value;
        setLoginHistory(
          Array.isArray(h) ? h : h?.data || h?.items || [],
        );
      } else {
        setLoginHistory([]);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل الجلسات',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const revokeSession = async (sessionId) => {
    await userService.revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const revokeAllSessions = async () => {
    await userService.revokeAllSessions();
    setSessions([]);
  };

  return {
    sessions,
    loginHistory,
    loading,
    error,
    refetch: fetchAll,
    revokeSession,
    revokeAllSessions,
  };
}
