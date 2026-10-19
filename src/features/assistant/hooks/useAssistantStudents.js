// src/features/assistant/hooks/useAssistantStudents.js
import { useState, useEffect, useCallback } from 'react';
import assistantApi from '../api/assistantApi';

/**
 * بيجيب كل طلاب المساعد من كل مجموعاته
 * (الباك مفيهوش endpoint يجيب كل الطلاب مرة واحدة)
 */
export function useAssistantStudents() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. جلب مجموعات المساعد
      const groupsRes = await assistantApi.getGroups();
      const groupsPayload = groupsRes?.data ?? groupsRes;
      const groupsList = Array.isArray(groupsPayload)
        ? groupsPayload
        : groupsPayload?.data ?? [];

      setGroups(groupsList);

      // 2. لكل مجموعة، جلب طلابها
      const results = await Promise.allSettled(
        groupsList.map((g) => assistantApi.getGroupStudents(g.id)),
      );

      // 3. تجميع الطلاب (مع إزالة التكرار لو طالب في أكتر من مجموعة)
      const studentsMap = new Map();

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return;
        const p = result.value?.data ?? result.value;
        const items = Array.isArray(p) ? p : p?.data ?? [];
        const group = groupsList[index];

        items.forEach((s) => {
          const studentId = s.studentId || s.id;
          if (!studentId) return;

          if (studentsMap.has(studentId)) {
            // موجود بالفعل - نضيفه للمجموعات التانية
            const existing = studentsMap.get(studentId);
            existing.groups.push({
              id: group.id,
              name: group.name,
              subject: group.subject?.name,
            });
          } else {
            studentsMap.set(studentId, {
              ...s,
              groups: [
                {
                  id: group.id,
                  name: group.name,
                  subject: group.subject?.name,
                },
              ],
            });
          }
        });
      });

      setStudents(Array.from(studentsMap.values()));
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل الطلاب');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, groups, loading, error, refetch: fetchStudents };
}

export default useAssistantStudents;
