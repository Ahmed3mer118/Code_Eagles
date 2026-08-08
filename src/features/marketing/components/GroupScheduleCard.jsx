import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Users } from 'lucide-react';

export default function GroupScheduleCard({ group, joinLink, registerLink, isApproved }) {
  const { t } = useTranslation();

  const scheduleText =
    group.schedule ||
    [group.meetingDays?.join(', '), group.startTime, group.endTime].filter(Boolean).join(' · ');

  return (
    <article className="ce-card ce-card-hover p-5">
      <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{group.name}</h3>
      <p className="mt-1 text-sm text-[var(--ce-muted)]">
        {group.subjectId?.name} · {t(`auth.grade${group.gradeLevel?.replace('grade_', '')}`, group.gradeLevel)}
      </p>

      {scheduleText && (
        <p className="mt-3 inline-flex items-start gap-2 text-sm">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
          {scheduleText}
        </p>
      )}

      {group.classroom && (
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--ce-muted)]">
          <Clock className="h-4 w-4 text-[var(--ce-accent)]" />
          {group.classroom}
        </p>
      )}

      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ce-primary)]">
        <Users className="h-4 w-4 text-[var(--ce-accent)]" />
        {t('academy.seatsAvailable', { count: group.seatsAvailable ?? group.capacity })}
      </p>

      {isApproved && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={joinLink(group._id)} className="ce-btn ce-btn-accent text-sm">
            {t('student.requestJoin')}
          </Link>
          <Link to={registerLink(group._id)} className="ce-btn ce-btn-ghost text-sm">
            {t('nav.register')}
          </Link>
        </div>
      )}
    </article>
  );
}
