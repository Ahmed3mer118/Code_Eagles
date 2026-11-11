// src/features/student/hooks/useStudentAcademies.js
import { useCallback, useEffect, useState } from 'react';
import studentAcademiesApi from '../api/academies.api';

export default function useStudentAcademies(params = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAcademies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentAcademiesApi.getAcademies(params);
      const list = res?.data?.data ?? res?.data ?? [];
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('useStudentAcademies error:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchAcademies();
  }, [fetchAcademies]);

  return { data, loading, error, refetch: fetchAcademies };
}

export function useAcademyDetails(slug) {
  const [academy, setAcademy] = useState(null);
  const [plans, setPlans] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [academyRes, plansRes, groupsRes] = await Promise.all([
          studentAcademiesApi.getPublicTenant(slug),
          studentAcademiesApi.getAcademyPlans(slug).catch(() => ({ data: [] })),
          studentAcademiesApi.getAcademyGroups(slug).catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        setAcademy(academyRes?.data?.data ?? academyRes?.data ?? null);
        const p = plansRes?.data?.data ?? plansRes?.data ?? [];
        const g = groupsRes?.data?.data ?? groupsRes?.data ?? [];
        setPlans(Array.isArray(p) ? p : []);
        setGroups(Array.isArray(g) ? g : []);
      } catch (err) {
        console.error('useAcademyDetails error:', err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { academy, plans, groups, loading, error };
}
