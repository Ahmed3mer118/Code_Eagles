import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, Building2, Plus } from 'lucide-react';
import resolveMediaUrl from '../../../shared/utils/mediaUrl';

/**
 * Compact active-academy indicator with switch / explore actions.
 * Shown in the student dashboard header on every page.
 */
export default function StudentAcademySwitcher({
  academy,
  academyCount = 0,
  loading = false,
  variant = 'header',
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className={`ce-skeleton rounded-xl ${variant === 'sidebar' ? 'mx-3 mb-3 h-20' : 'h-10 w-48'}`} />
    );
  }

  if (!academy) {
    return (
      <Link
        to="/dashboard/student/select-academy"
        className={`inline-flex items-center gap-2 rounded-xl bg-[var(--ce-accent)] px-3 py-2 text-sm font-bold text-white transition hover:opacity-90 ${
          variant === 'sidebar' ? 'mx-3 mb-3 w-[calc(100%-1.5rem)] justify-center' : ''
        }`}
      >
        <Building2 className="h-4 w-4" />
        {t('student.pickAcademy')}
      </Link>
    );
  }

  const logo = resolveMediaUrl(academy.logoUrl) || '/images/LOGO.png';
  const switchLabel = academyCount > 1 ? t('student.switchAcademy') : t('student.exploreAcademies');
  const switchTo = academyCount > 1
    ? '/dashboard/student/select-academy'
    : '/dashboard/student/select-academy?explore=1';

  if (variant === 'sidebar') {
    return (
      <div className="mx-3 mb-3 rounded-xl border border-white/15 bg-white/10 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">
          {t('student.viewingAcademy')}
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-0.5" />
          <p className="min-w-0 flex-1 truncate text-sm font-extrabold">{academy.name}</p>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <Link
            to={switchTo}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--ce-primary)] transition hover:bg-white/90"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            {switchLabel}
          </Link>
          <Link
            to="/dashboard/student/select-academy?explore=1"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/10"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('student.joinAnotherAcademy')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-2 py-1.5 sm:flex md:gap-3 md:px-3">
      <img src={logo} alt="" className="h-8 w-8 shrink-0 rounded-lg border border-[var(--ce-border)] bg-white object-contain p-0.5" />
      <div className="min-w-0 max-w-[10rem] md:max-w-[14rem]">
        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[var(--ce-muted)]">
          {t('student.viewingAcademy')}
        </p>
        <p className="truncate text-sm font-extrabold text-[var(--ce-primary)]">{academy.name}</p>
      </div>
      <Link
        to={switchTo}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--ce-primary)] px-2.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">{switchLabel}</span>
      </Link>
    </div>
  );
}
