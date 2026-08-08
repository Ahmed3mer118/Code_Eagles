import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, BadgeCheck, BookOpen, Star, Users } from 'lucide-react';

export default function AcademyCard({ academy }) {
  const { t } = useTranslation();

  return (
    <article className="ce-card ce-card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-primary-soft)]">
        {academy.coverUrl ? (
          <img
            src={academy.coverUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-white/20">
            {academy.name?.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {academy.logoUrl ? (
          <img
            src={academy.logoUrl}
            alt=""
            loading="lazy"
            className="absolute bottom-3 start-3 h-12 w-12 rounded-xl border-2 border-white object-cover shadow-lg"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{academy.name}</h3>
            {academy.ownerName && (
              <p className="mt-1 text-sm text-[var(--ce-muted)]">{academy.ownerName}</p>
            )}
          </div>
          {academy.isVerified && (
            <span className="ce-badge ce-badge-success inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t('landing.verified')}
            </span>
          )}
        </div>

        {academy.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--ce-muted)]">
            {academy.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--ce-muted)]">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
            {academy.studentCount} {t('landing.studentsLabel')}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
            {academy.courseCount} {t('landing.coursesLabel')}
          </span>
          {academy.rating > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-[var(--ce-accent)] text-[var(--ce-accent)]" />
              {academy.rating}
            </span>
          )}
        </div>

        {academy.category && (
          <span className="ce-badge mt-4 w-fit">{t(`landing.categories.${academy.category}`, academy.category)}</span>
        )}

        <Link
          to={`/academy/${academy.slug}`}
          className="ce-btn ce-btn-primary mt-auto pt-5 text-sm w-full sm:w-auto sm:mt-5"
        >
          {t('landing.viewAcademy')}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
