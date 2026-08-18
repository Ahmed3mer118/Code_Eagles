import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  MapPin,
  PlayCircle,
  Trophy,
  Users,
} from 'lucide-react';
import resolveMediaUrl from '../../../shared/utils/mediaUrl';

export default function AcademyGroupCourseCard({
  group,
  joinLink,
  registerLink,
  isApproved,
}) {
  const { t } = useTranslation();
  const subject = group.subjectDetail || group.subjectId;
  const stats = group.contentStats || {};
  const scheduleText =
    group.schedule ||
    [group.meetingDays?.join(', '), group.startTime, group.endTime].filter(Boolean).join(' · ');

  const contentItems = [
    { icon: PlayCircle, label: t('academy.content.lectures'), value: stats.lectureCount || stats.lessonCount || 0 },
    { icon: Trophy, label: t('academy.content.quizzes'), value: stats.quizCount || 0 },
    { icon: ClipboardList, label: t('academy.content.assignments'), value: stats.assignmentCount || 0 },
  ];

  return (
    <article className="ce-card ce-card-hover flex h-full flex-col overflow-hidden">
      <div className="border-b border-[var(--ce-border)] bg-gradient-to-br from-[var(--ce-primary)]/5 to-[var(--ce-accent)]/10 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[var(--ce-primary)]/10 p-3 text-[var(--ce-primary)]">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-accent)]">
              {t('academy.groupSchedule')}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-[var(--ce-primary)]">{group.name}</h3>
            {scheduleText && (
              <p className="mt-2 flex items-start gap-2 text-sm text-[var(--ce-muted)]">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
                {scheduleText}
              </p>
            )}
            {group.classroom && (
              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--ce-muted)]">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
                {group.classroom}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          {subject?.coverImage ? (
            <img
              src={resolveMediaUrl(subject.coverImage)}
              alt=""
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--ce-bg)] text-[var(--ce-primary)]">
              <BookOpen className="h-7 w-7" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-muted)]">
              {t('academy.subjectInsideGroup')}
            </p>
            <h4 className="mt-1 text-lg font-extrabold text-[var(--ce-primary)]">
              {subject?.name || t('academy.noSubject')}
            </h4>
            {subject?.description && (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--ce-muted)]">{subject.description}</p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {contentItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl bg-[var(--ce-bg)] px-3 py-3 text-center">
              <Icon className="mx-auto h-4 w-4 text-[var(--ce-accent)]" />
              <p className="mt-1 text-lg font-extrabold text-[var(--ce-primary)]">{value}</p>
              <p className="text-[10px] font-semibold text-[var(--ce-muted)]">{label}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ce-primary)]">
          <Users className="h-4 w-4 text-[var(--ce-accent)]" />
          {t('academy.seatsAvailable', { count: group.seatsAvailable ?? group.capacity ?? 0 })}
        </p>

        {isApproved && (
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <Link to={joinLink(group._id)} className="ce-btn ce-btn-accent flex-1 text-sm">
              {t('student.requestJoin')}
            </Link>
            {/* <Link to={registerLink(group._id)} className="ce-btn ce-btn-ghost text-sm">
              {t('nav.register')}
            </Link> */}
          </div>
        )}
      </div>
    </article>
  );
}
