import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDuration, getRemainingSeconds } from '../utils/examHelpers';

export default function ExamTimer({ expiresAt, onExpire, warningAt = 300 }) {
  const { t } = useTranslation();
  const [seconds, setSeconds] = useState(() => getRemainingSeconds(expiresAt));

  useEffect(() => {
    const tick = () => {
      const remaining = getRemainingSeconds(expiresAt);
      setSeconds(remaining);
      if (remaining <= 0) onExpire?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const urgent = seconds <= warningAt;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${
        urgent
          ? 'bg-[var(--ce-danger)] text-white animate-pulse'
          : 'bg-[var(--ce-primary)] text-white'
      }`}
    >
      <Clock className="h-6 w-6 shrink-0" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{t('exams.duration')}</p>
        <p className="text-2xl font-extrabold tabular-nums">{formatDuration(seconds)}</p>
      </div>
    </div>
  );
}
