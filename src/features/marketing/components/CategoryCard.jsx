import { useTranslation } from 'react-i18next';

export default function CategoryCard({ category, icon: Icon, onClick, active = false }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`ce-card ce-card-hover flex flex-col items-start gap-3 p-5 text-start transition ${
        active ? 'ring-2 ring-[var(--ce-accent)]' : ''
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h3 className="font-extrabold text-[var(--ce-primary)]">
          {t(`landing.categories.${category.key}`, category.label)}
        </h3>
        <p className="mt-1 text-sm text-[var(--ce-muted)]">
          {t(`landing.categoryDesc.${category.key}`, category.desc)}
        </p>
      </div>
    </button>
  );
}
