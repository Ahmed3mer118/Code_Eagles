import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export default function HeroSearchBar({ value, onChange, onSubmit, placeholder }) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
    >
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ce-muted)]" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || t('landing.searchPlaceholder')}
          className="ce-input !rounded-full !py-3.5 !ps-12 !pe-4 shadow-lg"
        />
      </label>
      <button type="submit" className="ce-btn ce-btn-accent shrink-0">
        {t('common.search')}
      </button>
    </form>
  );
}
