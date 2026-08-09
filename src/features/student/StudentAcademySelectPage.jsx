import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import StudentAcademyPanel from './components/StudentAcademyPanel';
import { useStudentAcademy } from './useStudentAcademy';

export default function StudentAcademySelectPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const returnTo = params.get('returnTo');
  const {
    academies,
    currentAcademy,
    loading,
    browseMode,
    requiresSelection,
    hasMemberships,
    selectAcademy,
  } = useStudentAcademy();

  useEffect(() => {
    if (loading || browseMode || requiresSelection) return;
    if (academies.length === 1 && academies[0]?.academy) {
      selectAcademy(academies[0].academy, { navigateTo: returnTo || '/dashboard/student' });
    }
  }, [academies, browseMode, loading, requiresSelection, returnTo, selectAcademy]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return academies;
    return academies.filter((item) => {
      const a = item.academy || {};
      return [a.name, a.slug, a.ownerName].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [academies, search]);

  const handleSelect = (academy, item) => {
    const destination = returnTo || (item?.isCatalog ? '/dashboard/student/join' : '/dashboard/student');
    selectAcademy(academy, { navigateTo: destination });
    toast.success(t('student.academySelected', { name: academy.name }));
  };

  if (loading) return <LoadingScreen />;

  const title = browseMode ? t('student.browseAcademiesTitle') : t('student.selectAcademyTitle');
  const hint = browseMode
    ? t('student.browseAcademiesHint')
    : (requiresSelection ? t('student.memberAcademiesHint') : t('student.selectAcademyHint'));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="ce-card overflow-hidden">
        <div className="bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-primary)]/85 px-6 py-8 text-white">
          <h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85">{hint}</p>
          {currentAcademy && browseMode && (
            <p className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm">
              {t('student.selectedAcademyContinue', { name: currentAcademy.name })}
            </p>
          )}
        </div>
      </div>

      {browseMode && academies.length > 3 && (
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ce-muted)]" />
          <input
            type="search"
            className="ce-input w-full ps-10"
            placeholder={t('student.searchAcademies')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {!browseMode && hasMemberships && (
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ce-muted)]">
          {t('student.myAcademies')}
        </h2>
      )}

      {browseMode ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <StudentAcademyPanel
              key={item.academy._id}
              academy={item.academy}
              activeCount={item.activeCount}
              pendingCount={item.pendingCount}
              selected={item.academy.slug === currentAcademy?.slug}
              onSelect={(academy) => handleSelect(academy, item)}
              variant="grid"
              isCatalog
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <StudentAcademyPanel
              key={item.academy._id}
              academy={item.academy}
              activeCount={item.activeCount}
              pendingCount={item.pendingCount}
              leftCount={item.leftCount}
              hasLeft={item.hasLeft}
              selected={item.academy.slug === currentAcademy?.slug}
              onSelect={(academy) => handleSelect(academy, item)}
              showEnter
            />
          ))}
        </div>
      )}

      {!filtered.length && (
        <div className="ce-card p-10 text-center text-[var(--ce-muted)]">
          {search ? t('student.noAcademiesMatch') : t('student.noAcademies')}
        </div>
      )}
    </div>
  );
}
