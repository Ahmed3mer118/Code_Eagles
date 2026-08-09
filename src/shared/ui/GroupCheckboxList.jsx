import { useTranslation } from 'react-i18next';

export default function GroupCheckboxList({ groups = [], value = [], onChange, emptyMessage }) {
  const { t } = useTranslation();

  const toggle = (groupId) => {
    if (value.includes(groupId)) {
      onChange(value.filter((id) => id !== groupId));
      return;
    }
    onChange([...value, groupId]);
  };

  if (!groups.length) {
    return <p className="text-sm text-[var(--ce-muted)]">{emptyMessage || t('groups.empty')}</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {groups.map((group) => {
        const checked = value.includes(group._id);
        return (
          <label
            key={group._id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
              checked
                ? 'border-[var(--ce-accent)] bg-[var(--ce-accent)]/10'
                : 'border-[var(--ce-border)] bg-[var(--ce-bg)] hover:border-[var(--ce-primary)]/30'
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--ce-accent)]"
              checked={checked}
              onChange={() => toggle(group._id)}
            />
            <span className="min-w-0">
              <span className="block font-semibold text-[var(--ce-primary)]">{group.name}</span>
              {group.subjectId?.name && (
                <span className="mt-0.5 block text-xs text-[var(--ce-muted)]">{group.subjectId.name}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
