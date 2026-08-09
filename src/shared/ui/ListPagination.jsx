import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ListPagination({ page, pages, total, onPageChange, className = '' }) {
  const { t } = useTranslation();
  if (!pages || pages <= 1) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <p className="text-sm text-[var(--ce-muted)]">
        {t('common.paginationSummary', { page, pages, total })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="ce-btn ce-btn-ghost text-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          {t('common.prev')}
        </button>
        <span className="min-w-[4rem] text-center text-sm font-bold text-[var(--ce-primary)]">
          {page} / {pages}
        </span>
        <button
          type="button"
          className="ce-btn ce-btn-ghost text-sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('common.next')}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
