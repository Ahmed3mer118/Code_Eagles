import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BookOpen, ClipboardList, CreditCard, Layers, Plus, RefreshCw, Trophy, UserPlus, Video } from 'lucide-react';
import { studentApi } from '../../shared/api/platformApi';
import { clearStoredTenant } from '../../shared/api/tenantContext';
import StudentWaitingView from './StudentWaitingView';
import StatusBadge from '../../shared/ui/StatusBadge';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import IconButton from '../../shared/ui/IconButton';
import StudentAcademyPanel from './components/StudentAcademyPanel';
import { useStudentAcademyContext } from './StudentAcademyContext';
import getApiErrorMessage from '../../shared/utils/apiError';

const statIcons = [Layers, BookOpen, Trophy, ClipboardList];

export default function StudentOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    academies,
    currentAcademy,
    loading: academiesLoading,
    reload: reloadAcademies,
    selectAcademy,
  } = useStudentAcademyContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const currentEntry = academies.find((a) => a.academy._id === currentAcademy?._id);

  useEffect(() => {
    if (academiesLoading) return;
    if (!currentAcademy) return;

    (async () => {
      setLoading(true);
      try {
        const res = await studentApi.dashboard();
        setData(res);
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [academiesLoading, currentAcademy?.slug]);

  if (academiesLoading || loading) {
    return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;
  }

  if (!currentAcademy) {
    return null;
  }

  if (!data) {
    return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;
  }

  const { groups, subjects, lectures, quizzes, assignments, recentAttempts, progress, pendingEnrollments, package: packageInfo } = data;
  const statItems = [
    { label: t('student.myGroups'), value: progress.activeGroups },
    { label: t('student.mySubjects'), value: progress.subjects },
    { label: t('student.myQuizzes'), value: progress.completedQuizzes },
    { label: t('student.myHomework'), value: progress.pendingAssignments },
  ];

  const handleLeaveAcademy = async () => {
    setLeaving(true);
    try {
      await studentApi.leaveAcademy();
      toast.success(t('student.leftAcademySuccess'));
      clearStoredTenant();
      setLeaveOpen(false);

      const { list } = await reloadAcademies();
      const remaining = (list || []).filter(
        (item) => item.activeCount > 0 || item.pendingCount > 0
      );

      if (remaining.length === 1 && remaining[0]?.academy) {
        selectAcademy(remaining[0].academy, { navigateTo: '/dashboard/student' });
        return;
      }

      if (remaining.length > 1) {
        navigate('/dashboard/student/select-academy', { replace: true });
        return;
      }

      navigate('/dashboard/student/select-academy?explore=1', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <StudentWaitingView>
      <div className="space-y-6">
        {currentAcademy && (
          <div className="space-y-3">
            <StudentAcademyPanel
              academy={currentAcademy}
              activeCount={currentEntry?.activeCount ?? progress.activeGroups}
              pendingCount={currentEntry?.pendingCount ?? 0}
              leftCount={currentEntry?.leftCount ?? 0}
              hasLeft={currentEntry?.hasLeft}
              selected
              showEnter={false}
              onLeave={() => setLeaveOpen(true)}
              leaving={leaving}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item, index) => {
            const Icon = statIcons[index];
            return (
              <div key={item.label} className="ce-stat-card flex items-start gap-3">
                <div className="rounded-xl bg-[var(--ce-primary)]/10 p-2.5 text-[var(--ce-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[var(--ce-primary)]">{item.value}</p>
                  <p className="text-sm text-[var(--ce-muted)]">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {packageInfo && (
          <div className="ce-card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--ce-muted)]">{t('settings.studentPlan')}</p>
              <p className="mt-1 text-lg font-extrabold text-[var(--ce-primary)]">
                {packageInfo.planName || packageInfo.packageLabel || t('payments.fullPackage')}
              </p>
              {packageInfo.packageLabel && packageInfo.planName && (
                <p className="mt-1 text-sm text-[var(--ce-muted)]">{packageInfo.packageLabel}</p>
              )}
            </div>
            {groups.length > 0 && (
              <IconButton
                icon={RefreshCw}
                label={t('payments.updatePlan')}
                variant="accent"
                to="/dashboard/student/subscription"
              />
            )}
          </div>
        )}

        {pendingEnrollments?.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-900">{t('student.pendingBanner')}</h3>
            <ul className="mt-3 space-y-2">
              {pendingEnrollments.map((en) => (
                <li key={en._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm">
                  <span className="font-medium">{en.group?.name} — {en.group?.subjectId?.name}</span>
                  {en.amountDue > 0 && (
                    <IconButton
                      icon={CreditCard}
                      label={t('payments.payNow')}
                      variant="accent"
                      to={`/dashboard/student/payments?enrollment=${en._id}`}
                    />
                  )}
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
              <div key={g._id} className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)]/40 p-4">
                <p className="font-bold text-[var(--ce-primary)]">{g.group?.name}</p>
                <p className="text-sm text-[var(--ce-muted)]">{g.group?.subjectId?.name}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status="approved" label={t('student.status.active')} />
                  {g.group?.meetingLink && (
                    <IconButton
                      icon={Video}
                      label={t('student.joinLiveSession')}
                      href={g.group.meetingLink}
                      className="h-8 w-8"
                    />
                  )}
                  <IconButton
                    icon={RefreshCw}
                    label={t('payments.updatePlan')}
                    variant="ghost"
                    to={`/dashboard/student/subscription?enrollment=${g._id}`}
                  />
                </div>
              </div>
            )) : (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-[var(--ce-border)] p-8 text-center">
                <p className="text-sm text-[var(--ce-muted)]">{t('student.noGroups')}</p>
                <div className="mt-4 flex justify-center">
                  <IconButton icon={UserPlus} label={t('student.requestJoin')} variant="accent" to="/dashboard/student/join" />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="ce-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.mySubjects')}</h3>
            <Link to="/dashboard/student/courses" className="text-sm font-semibold text-[var(--ce-primary)]">{t('dashboard.myCourses')}</Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.length ? subjects.map((s) => (
              <span key={s._id} className="rounded-full border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2 text-sm font-semibold">{s.name}</span>
            )) : <p className="text-sm text-[var(--ce-muted)]">{t('student.noCourses')}</p>}
          </div>
        </section>

        <section className="ce-card p-5">
          <h3 className="font-extrabold text-[var(--ce-primary)]">{t('student.myLectures')}</h3>
          <ul className="mt-4 space-y-2">
            {lectures.length ? lectures.map((lec) => (
              <li key={lec._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--ce-bg)] px-4 py-3 text-sm">
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
                <li key={q._id} className="rounded-xl bg-[var(--ce-bg)] px-4 py-2">{q.title}</li>
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
                <li key={a._id} className="flex justify-between gap-2 rounded-xl bg-[var(--ce-bg)] px-4 py-2">
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
              <li key={a._id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-[var(--ce-bg)] px-4 py-2">
                <span>{a.quizTitle}</span>
                <span className="font-semibold">{a.score != null ? `${a.score}/${a.maxScore}` : t('exams.pendingReview')}</span>
              </li>
            )) : <li className="text-[var(--ce-muted)]">{t('student.noProgress')}</li>}
          </ul>
        </section>
      </div>

      <ConfirmDialog
        open={leaveOpen}
        title={t('student.leaveAcademyTitle')}
        message={t('student.leaveAcademyDesc')}
        confirmLabel={t('student.leaveAcademy')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setLeaveOpen(false)}
        onConfirm={handleLeaveAcademy}
      />
    </StudentWaitingView>
  );
}
