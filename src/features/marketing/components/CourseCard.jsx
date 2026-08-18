import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, PlayCircle, Star, Users } from 'lucide-react';
import resolveMediaUrl from '../../../shared/utils/mediaUrl';

export default function CourseCard({ course }) {
  const { t } = useTranslation();
  const coverImage = resolveMediaUrl(course.coverImage);

  return (
    <article className="ce-card ce-card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ce-bg)]">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--ce-primary)]/10 to-[var(--ce-accent)]/20">
            <PlayCircle className="h-12 w-12 text-[var(--ce-primary)]/30" />
          </div>
        )}
        {course.price > 0 && (
          <span className="absolute top-3 end-3 rounded-full bg-[var(--ce-accent)] px-3 py-1 text-xs font-bold text-[#1a1200]">
            {course.price} {t('academy.currency')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-accent)]">
          {course.academyName}
        </p>
        <h3 className="mt-1 text-lg font-extrabold text-[var(--ce-primary)]">{course.name}</h3>
        {course.teacherName && (
          <p className="mt-1 text-sm text-[var(--ce-muted)]">{course.teacherName}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--ce-muted)]">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.durationHours}h
          </span>
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" />
            {course.lessonCount} {t('landing.lessonsLabel')}
          </span>
          {course.studentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.studentCount}
            </span>
          )}
        </div>

        <Link
          to={`/academy/${course.academySlug}`}
          className="ce-btn ce-btn-ghost mt-auto text-sm sm:mt-5"
        >
          {t('landing.viewCourse')}
        </Link>
      </div>
    </article>
  );
}
