import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Trophy, BookOpen, Users } from 'lucide-react';
import { teacherApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import { StatCards, SimpleBarChart } from '../../shared/ui/Charts';

function RankList({ title, icon: Icon, rows, renderRow }) {
  return (
    <div className="ce-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--ce-accent)]" />
        <h3 className="font-extrabold text-[var(--ce-primary)]">{title}</h3>
      </div>
      {!rows?.length ? (
        <p className="text-sm text-[var(--ce-muted)]">—</p>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => (
            <li key={index} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--ce-bg)] px-4 py-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 truncate font-semibold text-[var(--ce-primary)]">{renderRow(row)}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function TeacherReportsPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);

  useEffect(() => {
    teacherApi.reports()
      .then(setData)
      .catch((err) => toast.error(err?.message || t('common.error')));
  }, [t]);

  if (!data) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  const { stats, exams, homework, paymentsByMonth, attemptsByMonth, topStudents, topQuizzes, topSubjects } = data;

  return (
    <div className="space-y-6">
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <StatCards
        items={[
          { label: t('dashboard.students'), value: stats?.students },
          { label: t('reports.passRate'), value: `${exams?.passRate || 0}%` },
          { label: t('reports.avgScore'), value: `${exams?.averageScore || 0}%` },
          { label: t('reports.revenue'), value: `${stats?.studentRevenue || 0} ${t('academy.currency')}` },
          { label: t('reports.examAttempts'), value: exams?.totalAttempts },
          { label: t('dashboard.assignments'), value: homework?.totalAssignments },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <RankList
          title={t('reports.topStudents')}
          icon={Users}
          rows={topStudents}
          renderRow={(row) => (
            <span>
              {row.student?.name}
              <span className="ms-2 text-xs font-normal text-[var(--ce-muted)]">
                {row.attempts} {t('reports.attemptsShort')} · {row.avgScore}%
              </span>
            </span>
          )}
        />
        <RankList
          title={t('reports.topQuizzes')}
          icon={Trophy}
          rows={topQuizzes}
          renderRow={(row) => (
            <span>
              {row.quiz?.title}
              <span className="ms-2 text-xs font-normal text-[var(--ce-muted)]">
                {row.attempts} {t('reports.attemptsShort')}
              </span>
            </span>
          )}
        />
        <RankList
          title={t('reports.topSubjects')}
          icon={BookOpen}
          rows={topSubjects}
          renderRow={(row) => (
            <span>
              {row.subject?.name}
              <span className="ms-2 text-xs font-normal text-[var(--ce-muted)]">
                {row.enrollments} {t('reports.enrollmentsShort')}
              </span>
            </span>
          )}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ce-card p-6">
          <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('reports.paymentsByMonth')}</h3>
          <SimpleBarChart data={paymentsByMonth || []} xKey="_id" yKey="total" />
        </div>
        <div className="ce-card p-6">
          <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('reports.attemptsByMonth')}</h3>
          <SimpleBarChart data={attemptsByMonth || []} xKey="_id" yKey="count" />
        </div>
      </div>

      <div className="ce-card p-6">
        <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('admin.enrollmentsByMonth')}</h3>
        <SimpleBarChart data={stats?.enrollmentsByMonth || []} xKey="_id" yKey="count" />
      </div>
    </div>
  );
}
