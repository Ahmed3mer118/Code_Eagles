import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { studentApi } from '../../shared/api/platformApi';
import LoadingScreen from '../../shared/ui/LoadingScreen';

export default function StudentAcademySelectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentApi.myAcademies();
        const list = data.academies || [];
        setAcademies(list);
        if (list.length === 1) {
          selectAcademy(list[0].academy);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const selectAcademy = (academy) => {
    if (!academy) return;
    localStorage.setItem('ce_tenant', JSON.stringify(academy));
    if (academy.slug) sessionStorage.setItem('ce_tenant_slug', academy.slug);
    navigate('/dashboard/student');
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-[var(--ce-primary)]">{t('student.selectAcademyTitle')}</h1>
        <p className="mt-2 text-[var(--ce-muted)]">{t('student.selectAcademyHint')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {academies.map((item) => (
          <button
            key={item.academy._id}
            type="button"
            onClick={() => selectAcademy(item.academy)}
            className="ce-card ce-card-hover p-6 text-start"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.academy.logoUrl || '/images/LOGO.png'}
                alt=""
                className="h-14 w-14 rounded-xl object-contain"
              />
              <div>
                <h2 className="text-lg font-extrabold text-[var(--ce-primary)]">{item.academy.name}</h2>
                <p className="mt-1 text-sm text-[var(--ce-muted)]">
                  {t('student.activeGroups', { count: item.activeCount })}
                  {item.pendingCount > 0 ? ` · ${t('student.pendingGroups', { count: item.pendingCount })}` : ''}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {!academies.length && (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('student.noAcademies')}</div>
      )}
    </div>
  );
}
