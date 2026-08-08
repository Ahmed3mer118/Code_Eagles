import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../api/platformApi';

export default function TeacherGlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await teacherApi.search(q.trim());
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const go = (item) => {
    setOpen(false);
    setQ('');
    const map = {
      student: '/dashboard/teacher/results',
      group: '/dashboard/teacher/groups',
      subject: '/dashboard/teacher/subjects',
      lesson: '/dashboard/teacher/subjects',
      quiz: '/dashboard/teacher/quizzes',
      assistant: '/dashboard/teacher/assistants',
    };
    navigate(map[item.type] || '/dashboard/teacher');
  };

  return (
    <div className="relative hidden max-w-md flex-1 md:block">
      <input
        className="ce-input w-full py-2 text-sm"
        placeholder={t('search.placeholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-40 mt-1 max-h-72 overflow-auto rounded-xl border border-[var(--ce-border)] bg-white shadow-lg">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              type="button"
              className="flex w-full flex-col px-4 py-3 text-start hover:bg-[var(--ce-bg)]"
              onMouseDown={() => go(r)}
            >
              <span className="text-xs font-bold uppercase text-[var(--ce-muted)]">{t(`search.types.${r.type}`)}</span>
              <span className="font-semibold">{r.label}</span>
              {r.meta && <span className="text-xs text-[var(--ce-muted)]">{r.meta}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
