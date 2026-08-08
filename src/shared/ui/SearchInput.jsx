import { useTranslation } from 'react-i18next';

export default function SearchInput({ value, onChange, placeholder }) {
  const { t } = useTranslation();
  return (
    <input
      type="search"
      className="ce-input max-w-md"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || t('common.search')}
    />
  );
}

export function filterByQuery(items, query, keys = ['name']) {
  if (!query?.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter((item) =>
    keys.some((key) => String(item[key] || '').toLowerCase().includes(q))
  );
}
