// src/features/superadmin/hooks/useAdminSessions.js
import { useState, useEffect, useCallback } from 'react';
import userService from '../../../shared/api/userService';

export function useAdminSessions() {
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

      setSessions(
        sessionsRes.status === 'fulfilled' &&
          Array.isArray(sessionsRes.value)
          ? sessionsRes.value
          : [],
      );

      if (historyRes.status === 'fulfilled') {
        const h = historyRes.value;
        setLoginHistory(Array.isArray(h) ? h : h?.data || h?.items || []);
      } else {
        setLoginHistory([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل الجلسات');
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
