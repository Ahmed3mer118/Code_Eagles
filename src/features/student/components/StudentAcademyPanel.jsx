import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ExternalLink, LogOut, School, Users } from 'lucide-react';
import resolveMediaUrl from '../../../shared/utils/mediaUrl';
import { getAcademyPublicUrl } from '../../../shared/utils/academyUrl';

export default function StudentAcademyPanel({
  academy,
  activeCount = 0,
  pendingCount = 0,
  leftCount = 0,
  hasLeft = false,
  selected = false,
  onSelect,
  onLeave,
  showEnter = false,
  enterLabel,
  leaving = false,
  variant = 'list',
  isCatalog = false,
}) {
  const { t } = useTranslation();
  if (!academy) return null;

  const url = getAcademyPublicUrl(academy.slug);
  const cover = resolveMediaUrl(academy.coverUrl);
  const logo = resolveMediaUrl(academy.logoUrl) || '/images/LOGO.png';

  if (variant === 'grid') {
    return (
      <article
        className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
          selected
            ? 'border-[var(--ce-accent)] ring-2 ring-[var(--ce-accent)]/30'
            : 'border-[var(--ce-border)]'
        }`}
      >
        <div className="relative h-28 bg-gradient-to-br from-[var(--ce-primary)]/15 to-[var(--ce-accent)]/10">
          {cover && (
            <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <img
            src={logo}
            alt=""
            className="absolute bottom-3 end-3 h-12 w-12 rounded-xl border-2 border-white bg-white object-contain p-1 shadow"
          />
          {selected && (
            <span className="absolute start-3 top-3 rounded-full bg-[var(--ce-accent)] px-2.5 py-0.5 text-xs font-bold text-white">
              {t('student.currentAcademy')}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{academy.name}</h3>
          {academy.ownerName && (
            <p className="mt-0.5 text-xs text-[var(--ce-muted)]">{academy.ownerName}</p>
          )}
          {!isCatalog && (
            <p className="mt-2 text-sm text-[var(--ce-muted)]">
              {t('student.activeGroups', { count: activeCount })}
              {pendingCount > 0 ? ` · ${t('student.pendingGroups', { count: pendingCount })}` : ''}
            </p>
          )}
          {isCatalog && academy.studentCount != null && (
            <p className="mt-2 flex items-center gap-1 text-sm text-[var(--ce-muted)]">
              <Users className="h-3.5 w-3.5" />
              {t('student.catalogStudents', { count: academy.studentCount || 0 })}
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {onSelect && (
              <button
                type="button"
                className="ce-btn ce-btn-accent flex-1 text-sm"
                onClick={() => onSelect(academy)}
              >
                {enterLabel || (isCatalog ? t('student.browseAcademyAction') : t('student.enterAcademy'))}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {academy.slug && (
              <Link
                to={`/academy/${academy.slug}`}
                target="_blank"
                rel="noreferrer"
                className="ce-btn ce-btn-ghost text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`ce-card overflow-hidden transition ${
        selected ? 'ring-2 ring-[var(--ce-accent)]' : 'ce-card-hover'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <img
          src={logo}
          alt=""
          className="h-16 w-16 shrink-0 rounded-2xl border border-[var(--ce-border)] bg-white object-contain p-2"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{academy.name}</h3>
            {selected && (
              <span className="rounded-full bg-[var(--ce-accent)]/15 px-2.5 py-0.5 text-xs font-bold text-[var(--ce-accent)]">
                {t('student.currentAcademy')}
              </span>
            )}
            {hasLeft && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                {t('student.status.left')}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--ce-muted)]">
            {t('student.activeGroups', { count: activeCount })}
            {pendingCount > 0 ? ` · ${t('student.pendingGroups', { count: pendingCount })}` : ''}
            {leftCount > 0 ? ` · ${t('student.leftGroups', { count: leftCount })}` : ''}
          </p>
        </div>
      </div>

      {(showEnter || onSelect || onLeave) && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-4">
          {onSelect && (
            <button type="button" className="ce-btn ce-btn-accent text-sm" onClick={() => onSelect(academy)}>
              <School className="h-4 w-4" />
              {enterLabel || t('student.enterAcademy')}
            </button>
          )}
          {academy.slug && (
            <Link
              to={`/academy/${academy.slug}`}
              target="_blank"
              rel="noreferrer"
              className="ce-btn ce-btn-ghost text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
              {t('student.openAcademyPage')}
            </Link>
          )}
          {onLeave && activeCount > 0 && (
            <button
              type="button"
              className="ce-btn ce-btn-ghost text-sm text-red-700"
              onClick={onLeave}
              disabled={leaving}
            >
              <LogOut className="h-4 w-4" />
              {leaving ? t('common.loading') : t('student.leaveAcademy')}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
