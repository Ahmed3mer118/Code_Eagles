import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizApi } from '../../../shared/api/platformApi';
import StudentWaitingView from '../../student/StudentWaitingView';
import StatusBadge from '../../../shared/ui/StatusBadge';
import { formatDuration } from '../utils/examHelpers';

export default function ExamHistoryPage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await quizApi.myHistory();
        setHistory(data.history || []);
      } catch (err) {
        toast.error(err?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  return (
    <StudentWaitingView>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('exams.historyTitle')}</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/student/join" className="ce-btn ce-btn-ghost text-sm">
              {t('student.myRequests')}
            </Link>
            <Link to="/dashboard/student/quizzes" className="ce-btn ce-btn-ghost text-sm">
              {t('exams.backToExams')}
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('common.loading')}</div>
        ) : history.length === 0 ? (
          <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('exams.noHistory')}</div>
        ) : (
          <div className="ce-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-[var(--ce-bg)] text-start">
                  <tr>
                    <th className="px-4 py-3 font-bold">{t('quizzes.title')}</th>
                    <th className="px-4 py-3 font-bold">{t('quizzes.attempt')}</th>
                    <th className="px-4 py-3 font-bold">{t('requests.requestDate')}</th>
                    <th className="px-4 py-3 font-bold">{t('quizzes.score')}</th>
                    <th className="px-4 py-3 font-bold">{t('exams.timeTaken')}</th>
                    <th className="px-4 py-3 font-bold">{t('exams.resultStatus')}</th>
                    <th className="px-4 py-3 font-bold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ce-border)]">
                  {history.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3 font-semibold">{item.quiz?.title || '—'}</td>
                      <td className="px-4 py-3">#{item.attemptNumber}</td>
                      <td className="px-4 py-3 text-[var(--ce-muted)]">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {item.resultAvailable && item.score != null
                          ? `${item.score}/${item.maxScore} (${item.percentage}%)`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">{formatDuration(item.timeTakenSeconds)}</td>
                      <td className="px-4 py-3">
                        {item.resultAvailable ? (
                          <StatusBadge
                            status={item.passed ? 'approved' : 'pending'}
                            label={item.passed ? t('quizzes.passed') : t('quizzes.failed')}
                          />
                        ) : (
                          <StatusBadge status="pending" label={t('exams.pendingReview')} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.quiz?._id && (
                          <Link
                            to={`/dashboard/student/quizzes/${item.quiz._id}/results/${item._id}`}
                            className="font-semibold text-[var(--ce-primary)]"
                          >
                            {item.resultAvailable ? t('exams.viewAnalysis') : t('exams.viewSubmission')}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </StudentWaitingView>
  );
}
