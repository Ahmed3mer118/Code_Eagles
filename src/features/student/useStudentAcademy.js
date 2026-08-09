import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { studentApi, tenantApi } from '../../shared/api/platformApi';
import { getStoredTenantSlug, setStoredTenant, clearStoredTenant } from '../../shared/api/tenantContext';

const SELECT_PATH = '/dashboard/student/select-academy';

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

export function useStudentAcademy({ autoRedirect = false } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [academies, setAcademies] = useState([]);
  const [currentAcademy, setCurrentAcademy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [browseMode, setBrowseMode] = useState(false);
  const [requiresSelection, setRequiresSelection] = useState(false);
  const [hasMemberships, setHasMemberships] = useState(false);

  const syncCurrent = useCallback((list, { forceSelection = false } = {}) => {
    const storedSlug = getStoredTenantSlug();
    const match = list.find((item) => item.academy?.slug === storedSlug);

    if (match?.academy && !forceSelection) {
      setStoredTenant(match.academy);
      setCurrentAcademy(match.academy);
      return match.academy;
    }

    const enterable = list.filter(
      (item) => item.activeCount > 0 || item.pendingCount > 0 || (!item.isCatalog && !item.hasLeft)
    );

    if (!forceSelection && enterable.length === 1 && enterable[0]?.academy) {
      setStoredTenant(enterable[0].academy);
      setCurrentAcademy(enterable[0].academy);
      return enterable[0].academy;
    }

    setCurrentAcademy(null);
    return null;
  }, []);

  const reload = useCallback(async () => {
    let nextBrowseMode = false;
    let nextRequiresSelection = false;
    let nextHasMemberships = false;
    let list = [];

    try {
      const data = await studentApi.myAcademies();
      nextBrowseMode = !!data.browseMode;
      nextRequiresSelection = !!data.requiresSelection;
      nextHasMemberships = !!data.hasMemberships;
      list = data.academies || [];
    } catch (err) {
      const code = err?.response?.data?.code;
      const status = err?.response?.status;
      if (code !== 'TENANT_REQUIRED' && status !== 400) throw err;
      nextBrowseMode = true;
      nextHasMemberships = false;
      clearStoredTenant();
    }

    setBrowseMode(nextBrowseMode);
    setRequiresSelection(nextRequiresSelection);
    setHasMemberships(nextHasMemberships);

    if (nextBrowseMode) {
      const publicData = await tenantApi.listPublic({ limit: 100 });
      list = (publicData.academies || []).map(mapCatalogAcademy);
    }

    setAcademies(list);
    const selected = syncCurrent(list, { forceSelection: nextRequiresSelection });

    const storedSlug = getStoredTenantSlug();
    const shouldPickAcademy =
      nextRequiresSelection
      || (nextBrowseMode && !storedSlug)
      || (!nextBrowseMode && list.length > 1 && !selected)
      || (!nextBrowseMode && !list.length);

    if (autoRedirect && !location.pathname.startsWith(SELECT_PATH) && shouldPickAcademy) {
      navigate(SELECT_PATH, { replace: true });
    }

    return { list, browseMode: nextBrowseMode, requiresSelection: nextRequiresSelection };
  }, [autoRedirect, location.pathname, navigate, syncCurrent]);

  useEffect(() => {
    reload()
      .catch(async (err) => {
        try {
          clearStoredTenant();
          const publicData = await tenantApi.listPublic({ limit: 100 });
          const list = (publicData.academies || []).map(mapCatalogAcademy);
          setAcademies(list);
          setBrowseMode(true);
          setRequiresSelection(false);
          setHasMemberships(false);
          setCurrentAcademy(null);
          if (autoRedirect && !location.pathname.startsWith(SELECT_PATH)) {
            navigate(SELECT_PATH, { replace: true });
          }
        } catch {
          setAcademies([]);
          setCurrentAcademy(null);
        }
      })
      .finally(() => setLoading(false));
  }, [reload, autoRedirect, location.pathname, navigate]);

  const selectAcademy = useCallback((academy, { navigateTo = '/dashboard/student' } = {}) => {
    if (!academy) return;
    setStoredTenant(academy);
    setCurrentAcademy(academy);
    if (navigateTo) navigate(navigateTo, { replace: true });
  }, [navigate]);

  return {
    academies,
    currentAcademy,
    loading,
    browseMode,
    requiresSelection,
    hasMemberships,
    selectAcademy,
    reload,
    hasMultipleAcademies: requiresSelection || academies.length > 1,
  };
}

export async function resolveStudentPostLoginPath(returnTo) {
  try {
    const data = await studentApi.myAcademies();
    const list = data.academies || [];

    if (data.browseMode || data.requiresSelection) {
      const storedSlug = getStoredTenantSlug();
      if (data.browseMode && storedSlug) {
        return returnTo || '/dashboard/student/join';
      }
      if (returnTo) {
        return `/dashboard/student/select-academy?returnTo=${encodeURIComponent(returnTo)}`;
      }
      return '/dashboard/student/select-academy';
    }

    const enterable = list.filter(
      (item) => item.activeCount > 0 || item.pendingCount > 0 || item.enrollments?.length === 0
    );

    if (enterable.length === 1 && enterable[0]?.academy) {
      setStoredTenant(enterable[0].academy);
    } else {
      const storedSlug = getStoredTenantSlug();
      const match = list.find((item) => item.academy?.slug === storedSlug);
      if (match?.academy) setStoredTenant(match.academy);
    }

    return returnTo || '/dashboard/student';
  } catch (err) {
    const code = err?.response?.data?.code;
    if (code === 'TENANT_REQUIRED' || err?.response?.status === 400) {
      clearStoredTenant();
      if (returnTo) {
        return `/dashboard/student/select-academy?returnTo=${encodeURIComponent(returnTo)}`;
      }
      return '/dashboard/student/select-academy';
    }
    throw err;
  }
}
