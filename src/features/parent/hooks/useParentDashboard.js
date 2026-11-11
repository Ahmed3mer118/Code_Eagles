// src/features/parent/hooks/useParentDashboard.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import parentDashboardApi from '../api/dashboard.api';
import parentPointsApi from '../api/points.api';

/**
 * بيجيب كل الداتا اللي محتاجها ParentDashboard
 * - reports     : إحصائيات الأداء (متوسط، نقاط، عدد واجبات/اختبارات)
 * - assignments : قائمة الواجبات + submissions
 * - quizzes     : قائمة الاختبارات + attempts
 * - points      : تفاصيل النقاط + logs (endpoint منفصل)
 */
export function useParentDashboard(childId) {
  const [reports, setReports] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError('');

    const [reportsRes, assignRes, quizRes, pointsRes] = await Promise.allSettled([
      parentDashboardApi.getChildReports(childId),
      parentDashboardApi.getChildAssignments(childId),
      parentDashboardApi.getChildQuizzes(childId),
      parentPointsApi.getChildPoints(childId),
    ]);

    const unwrap = (res, fallback) => {
      if (res.status !== 'fulfilled') return fallback;
      const payload = res.value?.data ?? res.value;
      if (Array.isArray(payload)) return payload;
      return payload?.data ?? payload ?? fallback;
    };

    // reports ممكن يكون object أو null
    const reportsPayload = reportsRes.status === 'fulfilled'
      ? (reportsRes.value?.data ?? reportsRes.value ?? null)
      : null;

    setReports(reportsPayload && typeof reportsPayload === 'object' ? reportsPayload : null);
    setAssignments(unwrap(assignRes, []));
    setQuizzes(unwrap(quizRes, []));
    setPoints(unwrap(pointsRes, null));

    // لو كل حاجة فشلت، نطلّع error
    const allFailed = [reportsRes, assignRes, quizRes, pointsRes].every(
      (r) => r.status === 'rejected'
    );
    if (allFailed) {
      setError('تعذر تحميل بيانات الابن، حاول مرة أخرى');
    } else if (reportsRes.status === 'rejected') {
      // مش خطأ قاتل، بس نبه
      setError(reportsRes.reason?.response?.data?.message || '');
    }

    setLastUpdated(new Date());
    setLoading(false);
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ═══════════ Derived stats ═══════════ */
  const stats = useMemo(() => {
    const gradedSubs = assignments.filter((a) => a.submissions?.[0]?.status === 'graded');
    const pendingSubs = assignments.filter(
      (a) => a.submissions?.[0]?.status === 'submitted' || a.submissions?.[0]?.status === 'late'
    );
    const notSubmitted = assignments.filter((a) => !a.submissions?.[0]);

    const gradedAttempts = quizzes.filter(
      (q) => q.attempts?.[0]?.status === 'graded'
    );
    const passedAttempts = gradedAttempts.filter((q) => q.attempts[0].passed);
    const pendingAttempts = quizzes.filter(
      (q) => q.attempts?.[0] && q.attempts[0].status !== 'graded'
    );
    const notAttempted = quizzes.filter((q) => !q.attempts?.[0]);

    // متوسط من reports لو موجود، وإلا احسبه من الواجبات
    let avgGrade = null;
    if (reports && typeof reports.averageAssignmentGrade === 'number') {
      avgGrade = reports.averageAssignmentGrade;
    } else if (gradedSubs.length > 0) {
      const total = gradedSubs.reduce((sum, a) => sum + (Number(a.submissions[0].grade) || 0), 0);
      const max = gradedSubs.reduce((sum, a) => sum + (Number(a.maxPoints) || 100), 0);
      avgGrade = max > 0 ? (total / max) * 100 : 0;
    }

    // النقاط من reports أو من points endpoint
    const totalPoints =
      points?.totalPoints ??
      reports?.totalPoints ??
      0;
    const level = points?.level ?? reports?.level ?? 1;
    const xp = points?.xp ?? reports?.xp ?? 0;

    // نسبة الحضور / الالتزام (submissions / total)
    const totalTasks = assignments.length + quizzes.length;
    const completedTasks =
      assignments.filter((a) => a.submissions?.[0]).length + gradedAttempts.length + pendingAttempts.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalAssignments: assignments.length,
      gradedAssignments: gradedSubs.length,
      pendingAssignments: pendingSubs.length,
      notSubmittedAssignments: notSubmitted.length,

      totalQuizzes: quizzes.length,
      gradedQuizzes: gradedAttempts.length,
      passedQuizzes: passedAttempts.length,
      pendingQuizzes: pendingAttempts.length,
      notAttemptedQuizzes: notAttempted.length,

      avgGrade: avgGrade !== null ? Number(avgGrade).toFixed(1) : '—',

      totalPoints,
      level,
      xp,
      completionRate,

      totalEnrollments: reports?.totalEnrollments ?? 0,
      gradedSubmissions: reports?.gradedSubmissions ?? gradedSubs.length,
      gradedAttempts: reports?.gradedAttempts ?? gradedAttempts.length,
    };
  }, [reports, assignments, quizzes, points]);

  /* ═══════════ آخر الأنشطة (Activity feed) ═══════════ */
  const recentActivity = useMemo(() => {
    const items = [];

    assignments.forEach((a) => {
      const sub = a.submissions?.[0];
      if (sub?.status === 'graded' && sub.gradedAt) {
        items.push({
          type: 'assignment_graded',
          title: `تم تصحيح: ${a.title}`,
          subtitle: `الدرجة: ${sub.grade} / ${a.maxPoints}`,
          date: new Date(sub.gradedAt),
          icon: 'check',
          color: 'emerald',
        });
      } else if (sub?.submittedAt) {
        items.push({
          type: 'assignment_submitted',
          title: `تم تسليم: ${a.title}`,
          subtitle: 'بانتظار التصحيح',
          date: new Date(sub.submittedAt),
          icon: 'clock',
          color: 'amber',
        });
      }
    });

    quizzes.forEach((q) => {
      const attempt = q.attempts?.[0];
      if (attempt?.submittedAt) {
        items.push({
          type: attempt.status === 'graded' ? 'quiz_graded' : 'quiz_submitted',
          title: `${attempt.status === 'graded' ? 'تم تصحيح' : 'تم أداء'}: ${q.title}`,
          subtitle: attempt.status === 'graded'
            ? `${attempt.score} / ${attempt.maxScore ?? q.totalMarks ?? '—'}`
            : 'بانتظار التصحيح',
          date: new Date(attempt.submittedAt),
          icon: attempt.status === 'graded' ? 'check' : 'clock',
          color: attempt.status === 'graded'
            ? (attempt.passed ? 'emerald' : 'rose')
            : 'amber',
        });
      }
    });

    return items.sort((a, b) => b.date - a.date).slice(0, 6);
  }, [assignments, quizzes]);

  /* ═══════════ أقرب مواعيد تسليم ═══════════ */
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const items = [];

    assignments.forEach((a) => {
      if (!a.dueDate) return;
      const due = new Date(a.dueDate);
      if (due < now) return;
      if (a.submissions?.[0]?.status === 'graded') return;
      items.push({
        id: a.id,
        title: a.title,
        subject: a.subject?.name || 'مادة',
        dueDate: due,
        type: 'assignment',
      });
    });

    quizzes.forEach((q) => {
      if (!q.endDate) return;
      const end = new Date(q.endDate);
      if (end < now) return;
      if (q.attempts?.[0]?.status === 'graded') return;
      items.push({
        id: q.id,
        title: q.title,
        subject: q.subject?.name || 'مادة',
        dueDate: end,
        type: 'quiz',
      });
    });

    return items.sort((a, b) => a.dueDate - b.dueDate).slice(0, 4);
  }, [assignments, quizzes]);

  return {
    reports,
    assignments,
    quizzes,
    points,
    stats,
    recentActivity,
    upcomingDeadlines,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}

export default useParentDashboard;