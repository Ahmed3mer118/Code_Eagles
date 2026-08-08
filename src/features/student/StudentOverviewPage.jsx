import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { studentApi, groupApi } from '../../shared/api/platformApi';
import StudentWaitingView from './StudentWaitingView';
import StatusBadge from '../../shared/ui/StatusBadge';

export default function StudentOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [academies, setAcademies] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const academiesRes = await studentApi.myAcademies().catch(() => ({ academies: [] }));
        setAcademies(academiesRes.academies || []);
        if ((academiesRes.academies || []).length > 1 && !sessionStorage.getItem('ce_tenant_slug')) {
          navigate('/dashboard/student/select-academy', { replace: true });
          return;
        }
        const res = await studentApi.dashboard();
        setData(res);
      } catch (err) {
        toast.error(err?.message || t('common.error'));
      }
    })();
  }, [navigate, t]);

  if (!data) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  const joinLiveSession = async (groupId) => {
    try {
      const res = await groupApi.getMeetingLink(groupId);
      if (res.meetingLink) window.open(res.meetingLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('student.meetingLinkUnavailable'));
    }
  };

  const { groups, subjects, lectures, quizzes, assignments, recentAttempts, progress, pendingEnrollments } = data;

  return (
    <StudentWaitingView>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="ce-stat-card"><p className="text-2xl font-extrabold">{progress.activeGroups}</p><p className="text-sm text-[var(--ce-muted)]">{t('student.myGroups')}</p></div>
          <div className="ce-stat-card"><p className="text-2xl font-extrabold">{progress.subjects}</p><p className="text-sm text-[var(--ce-muted)]">{t('student.mySubjects')}</p></div>
          <div className="ce-stat-card"><p className="text-2xl font-extrabold">{progress.completedQuizzes}</p><p className="text-sm text-[var(--ce-muted)]">{t('student.myQuizzes')}</p></div>
          <div className="ce-stat-card"><p className="text-2xl font-extrabold">{progress.pendingAssignments}</p><p className="text-sm text-[var(--ce-muted)]">{t('student.myHomework')}</p></div>
        </div>

        {academies.length > 1 && (
          <section className="ce-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.myAcademies')}</h3>
              <Link to="/dashboard/student/select-academy" className="text-sm font-semibold text-[var(--ce-primary)]">
                {t('student.switchAcademy')}
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {academies.map((ac) => (
                <div key={ac.tenantId || ac.slug} className="rounded-xl border border-[var(--ce-border)] p-4">
                  <p className="font-bold">{ac.name}</p>
                  <p className="mt-1 text-xs text-[var(--ce-muted)]">
                    {t('student.activeGroups', { count: ac.activeGroups || 0 })}
                    {ac.pendingGroups ? ` · ${t('student.pendingGroups', { count: ac.pendingGroups })}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {pendingEnrollments?.length > 0 && (
          <div className="ce-card p-5">
            <h3 className="font-bold text-[var(--ce-primary)]">{t('student.pendingBanner')}</h3>
            <ul className="mt-3 space-y-2">
              {pendingEnrollments.map((en) => (
                <li key={en._id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{en.group?.name} — {en.group?.subjectId?.name}</span>
                  <Link to={`/dashboard/student/payments?enrollment=${en._id}`} className="ce-btn ce-btn-accent text-xs">{t('payments.payNow')}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="ce-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.myGroups')}</h3>
            <Link to="/dashboard/student/join" className="text-sm font-semibold text-[var(--ce-primary)]">{t('student.viewRequests')}</Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {groups.length ? groups.map((g) => (
              <div key={g._id} className="rounded-xl border border-[var(--ce-border)] p-4">
                <p className="font-bold">{g.group?.name}</p>
                <p className="text-sm text-[var(--ce-muted)]">{g.group?.subjectId?.name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status="approved" label={t('student.status.active')} />
                  {g.group?._id && (
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => joinLiveSession(g.group._id)}>
                      {t('student.joinLiveSession')}
                    </button>
                  )}
                </div>
              </div>
            )) : <p className="text-sm text-[var(--ce-muted)]">{t('student.noGroups')}</p>}
          </div>
        </section>

        <section className="ce-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.mySubjects')}</h3>
            <Link to="/dashboard/student/courses" className="text-sm font-semibold text-[var(--ce-primary)]">{t('dashboard.myCourses')}</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.length ? subjects.map((s) => (
              <span key={s._id} className="rounded-full bg-[var(--ce-bg)] px-4 py-2 text-sm font-semibold">{s.name}</span>
            )) : <p className="text-sm text-[var(--ce-muted)]">{t('student.noCourses')}</p>}
          </div>
        </section>

        <section className="ce-card p-5">
          <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.myLectures')}</h3>
          <ul className="mt-4 space-y-2">
            {lectures.length ? lectures.map((lec) => (
              <li key={lec._id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{lec.title || lec.lessonTitle}</span>
                {lec.videoUrl && <a href={lec.videoUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--ce-primary)]">{t('student.watch')}</a>}
              </li>
            )) : <li className="text-sm text-[var(--ce-muted)]">{t('student.noLectures')}</li>}
          </ul>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="ce-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.myQuizzes')}</h3>
              <Link to="/dashboard/student/quizzes" className="text-sm font-semibold text-[var(--ce-primary)]">{t('exams.backToExams')}</Link>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {quizzes.length ? quizzes.map((q) => (
                <li key={q._id}>{q.title}</li>
              )) : <li className="text-[var(--ce-muted)]">{t('exams.noExams')}</li>}
            </ul>
          </section>

          <section className="ce-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.myHomework')}</h3>
              <Link to="/dashboard/student/assignments" className="text-sm font-semibold text-[var(--ce-primary)]">{t('assignments.viewAll')}</Link>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {assignments.length ? assignments.map((a) => (
                <li key={a._id} className="flex justify-between gap-2">
                  <span>{a.title}</span>
                  <span className="text-[var(--ce-muted)]">{a.submission ? t(`assignments.status.${a.submission.status}`) : t('assignments.status.pending')}</span>
                </li>
              )) : <li className="text-[var(--ce-muted)]">{t('assignments.empty')}</li>}
            </ul>
          </section>
        </div>

        <section className="ce-card p-5">
          <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.myProgress')}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {recentAttempts.length ? recentAttempts.map((a) => (
              <li key={a._id} className="flex flex-wrap justify-between gap-2">
                <span>{a.quizTitle}</span>
                <span className="font-semibold">{a.score != null ? `${a.score}/${a.maxScore}` : t(`exams.pendingReview`)}</span>
              </li>
            )) : <li className="text-[var(--ce-muted)]">{t('student.noProgress')}</li>}
          </ul>
        </section>
      </div>
    </StudentWaitingView>
  );
}
