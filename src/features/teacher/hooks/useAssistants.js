import { useState, useEffect, useCallback } from 'react';
import teacherApi from '../../../shared/api/teacherApi';

export function useAssistants(params = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const fetchAssistants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await teacherApi.getAssistants(params);
      console.log('🔵 [useAssistants] API Response:', res.data); // عشان نتأكد شكل الداتا

      // ✅ استخراج الداتا بشكل آمن مهما كان شكل الـ Response
      const responseData = res.data?.data ?? res.data;
      const finalData = responseData?.data ?? responseData ?? [];
      
      setData(Array.isArray(finalData) ? finalData : []);
      setTotal(responseData?.total ?? 0);
      setTotalPages(responseData?.totalPages ?? 0);
      
    } catch (err) {
      console.error('🔴 [useAssistants] Error:', err);
      setError(err?.response?.data?.message || 'Failed to load assistants');
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  return { data, total, totalPages, loading, error, refetch: fetchAssistants };
}
