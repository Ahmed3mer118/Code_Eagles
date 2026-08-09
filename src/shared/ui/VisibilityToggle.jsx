import { Eye, EyeOff } from 'lucide-react';

export default function VisibilityToggle({
  visible,
  onToggle,
  title,
  className = '',
}) {
  const isVisible = visible !== false;

  return (
    <button
      type="button"
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
        isVisible
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-[var(--ce-border)] bg-white text-[var(--ce-muted)] hover:bg-[var(--ce-bg)]'
      } ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title={title}
      aria-label={title}
    >
      {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  );
}
