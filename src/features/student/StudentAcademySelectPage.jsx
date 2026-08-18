import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import StudentAcademyPanel from './components/StudentAcademyPanel';
import { useStudentAcademyContext } from './StudentAcademyContext';
import { tenantApi } from '../../shared/api/platformApi';

function mapCatalogAcademy(academy) {
  return {
    academy,
    enrollments: [],
    activeCount: 0,
    pendingCount: 0,
    leftCount: 0,
    isCatalog: true,
  };
}

export default function StudentAcademySelectPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const returnTo = params.get('returnTo');
  const exploreRequested = params.get('explore') === '1';
  const {
    academies,
    currentAcademy,
    loading,
    browseMode,
    requiresSelection,
    hasMemberships,
    selectAcademy,
  } = useStudentAcademyContext();

  const showExplore = exploreRequested || browseMode;
  const memberSlugs = useMemo(
    () => new Set(academies.map((item) => item.academy?.slug).filter(Boolean)),
    [academies]
  );

  useEffect(() => {
    if (loading || browseMode || requiresSelection) return;
    if (exploreRequested) return;
    if (academies.length === 1 && academies[0]?.academy) {
      selectAcademy(academies[0].academy, { navigateTo: returnTo || '/dashboard/student' });
    }
  }, [academies, browseMode, exploreRequested, loading, requiresSelection, returnTo, selectAcademy]);

  useEffect(() => {
    if (!showExplore) {
      setCatalog([]);
      return;
    }

    let cancelled = false;
    setCatalogLoading(true);
    tenantApi.listPublic({ limit: 100 })
      .then((data) => {
        if (cancelled) return;
        setCatalog((data.academies || []).map(mapCatalogAcademy));
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });

    return () => { cancelled = true; };
  }, [showExplore]);

  const myFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return academies;
    return academies.filter((item) => {
      const a = item.academy || {};
      return [a.name, a.slug, a.ownerName].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [academies, search]);

  const catalogFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const extra = catalog.filter((item) => !memberSlugs.has(item.academy?.slug));
    if (!q) return extra;
    return extra.filter((item) => {
      const a = item.academy || {};
      return [a.name, a.slug, a.ownerName].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [catalog, memberSlugs, search]);

  const browseList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = academies.length ? academies : catalog;
    if (!q) return source;
    return source.filter((item) => {
      const a = item.academy || {};
      return [a.name, a.slug, a.ownerName].some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [academies, catalog, search]);

  const handleSelect = (academy, item) => {
    const needsJoin = item?.isCatalog || ((item?.activeCount || 0) === 0 && (item?.pendingCount || 0) === 0);
    const destination = returnTo || (needsJoin ? '/dashboard/student/join' : '/dashboard/student');
    selectAcademy(academy, { navigateTo: destination });
    toast.success(t('student.academySelected', { name: academy.name }));
  };

  const openExplore = () => {
    const next = new URLSearchParams(params);
    next.set('explore', '1');
    setParams(next, { replace: true });
  };

  if (loading) return <LoadingScreen />;

  const title = showExplore && hasMemberships
    ? t('student.exploreAcademiesTitle')
    : (browseMode ? t('student.browseAcademiesTitle') : t('student.selectAcademyTitle'));

  const hint = showExplore && hasMemberships
    ? t('student.exploreAcademiesHint')
    : (browseMode
      ? t('student.browseAcademiesHint')
      : (requiresSelection ? t('student.memberAcademiesHint') : t('student.selectAcademyHint')));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="ce-card overflow-hidden">
        <div className="bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-primary)]/85 px-6 py-8 text-white">
          <h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85">{hint}</p>
          {!browseMode && hasMemberships && (
            <p className="mt-3 max-w-2xl rounded-xl bg-white/10 px-4 py-2 text-sm text-white/90">
              {t('student.switchWithoutLeave')}
            </p>
          )}
          {currentAcademy && (
            <p className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm">
              {t('student.selectedAcademyContinue', { name: currentAcademy.name })}
            </p>
          )}
        </div>
      </div>

      {(showExplore || academies.length > 3) && (
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

      {hasMemberships && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ce-muted)]">
              {t('student.myAcademies')}
            </h2>
            {!showExplore && (
              <button type="button" className="ce-btn ce-btn-ghost inline-flex items-center gap-1.5 text-sm" onClick={openExplore}>
                <Plus className="h-4 w-4" />
                {t('student.joinAnotherAcademy')}
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {myFiltered.map((item) => (
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

          {!myFiltered.length && (
            <div className="ce-card p-8 text-center text-sm text-[var(--ce-muted)]">
              {search ? t('student.noAcademiesMatch') : t('student.noAcademies')}
            </div>
          )}
        </>
      )}

      {showExplore && hasMemberships && (
        <>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ce-muted)]">
            {t('student.discoverAcademies')}
          </h2>

          {catalogLoading ? (
            <p className="text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalogFiltered.map((item) => (
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
          )}

          {!catalogLoading && !catalogFiltered.length && (
            <div className="ce-card p-8 text-center text-sm text-[var(--ce-muted)]">
              {search ? t('student.noAcademiesMatch') : t('student.allAcademiesAlreadyListed')}
            </div>
          )}
        </>
      )}

      {browseMode && !hasMemberships && (
        <>
          {loading || catalogLoading ? (
            <p className="text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {browseList.map((item) => (
                <StudentAcademyPanel
                  key={item.academy._id}
                  academy={item.academy}
                  activeCount={item.activeCount}
                  pendingCount={item.pendingCount}
                  selected={item.academy.slug === currentAcademy?.slug}
                  onSelect={(academy) => handleSelect(academy, item)}
                  variant="grid"
                  isCatalog={item.isCatalog}
                />
              ))}
            </div>
          )}

          {!loading && !catalogLoading && !browseList.length && (
            <div className="ce-card p-8 text-center text-sm text-[var(--ce-muted)]">
              {search ? t('student.noAcademiesMatch') : t('student.noPublicAcademies')}
            </div>
          )}
        </>
      )}

      {currentAcademy && hasMemberships && (
        <div className="text-center">
          <Link to="/dashboard/student" className="text-sm font-semibold text-[var(--ce-primary)]">
            {t('student.backToDashboard')}
          </Link>
        </div>
      )}
    </div>
  );
}
