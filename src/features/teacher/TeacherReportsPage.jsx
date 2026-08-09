import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  BadgeDollarSign,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { teacherApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import ContentLoader from '../../shared/ui/ContentLoader';
import { StatCards, SimpleBarChart } from '../../shared/ui/Charts';

/** Top three keep the accent highlight so the ranking reads at a glance. */
const rankStyle = (index) =>
  index === 0
    ? 'bg-[var(--ce-accent)] text-white'
    : index < 3
      ? 'bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]'
      : 'bg-[var(--ce-bg)] text-[var(--ce-muted)]';

function RankList({ title, icon: Icon, rows, renderRow, emptyLabel }) {
  return (
    <div className="ce-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <h3 className="font-extrabold text-[var(--ce-primary)]">{title}</h3>
      </div>
      {!rows?.length ? (
        <p className="rounded-xl border border-dashed border-[var(--ce-border)] px-4 py-8 text-center text-sm text-[var(--ce-muted)]">
          {emptyLabel}
        </p>
      ) : (
        <ol className="divide-y divide-[var(--ce-border)]">
          {rows.map((row, index) => (
            <li key={index} className="flex items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums ${rankStyle(index)}`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 truncate font-semibold text-[var(--ce-primary)]">{renderRow(row)}</div>
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

  if (!data) return <ContentLoader cards={6} rows={4} />;

  const { stats, exams, homework, paymentsByMonth, attemptsByMonth, topStudents, topQuizzes, topSubjects } = data;

  return (
    <div className="space-y-6">
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <StatCards
        items={[
          { label: t('dashboard.students'), value: stats?.students, icon: GraduationCap, tone: 'accent' },
          { label: t('reports.passRate'), value: `${exams?.passRate || 0}%`, icon: Target, tone: 'success' },
          { label: t('reports.avgScore'), value: `${exams?.averageScore || 0}%`, icon: ChartNoAxesColumnIncreasing },
          {
            label: t('reports.revenue'),
            value: `${stats?.studentRevenue || 0} ${t('academy.currency')}`,
            icon: BadgeDollarSign,
            tone: 'success',
          },
          { label: t('reports.examAttempts'), value: exams?.totalAttempts, icon: ClipboardCheck },
          { label: t('dashboard.assignments'), value: homework?.totalAssignments, icon: ClipboardList },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <RankList
          title={t('reports.topStudents')}
          icon={Users}
          emptyLabel={t('common.noData')}
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
          emptyLabel={t('common.noData')}
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
          emptyLabel={t('common.noData')}
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
