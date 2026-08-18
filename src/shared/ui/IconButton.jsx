import { Link } from 'react-router-dom';

/** Compact icon-only control with accessible label via title + aria-label */
export default function IconButton({
  icon: Icon,
  label,
  to,
  href,
  onClick,
  type = 'button',
  className = '',
  variant = 'ghost',
  disabled = false,
}) {
  const base = 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-50';
  const variants = {
    ghost: 'text-[var(--ce-primary)] hover:bg-[var(--ce-bg)]',
    primary: 'bg-[var(--ce-primary)] text-white hover:opacity-90',
    accent: 'bg-[var(--ce-accent)] text-[#1a1200] hover:opacity-90',
    danger: 'text-red-700 hover:bg-red-50',
  };
  const cls = `${base} ${variants[variant] || variants.ghost} ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} title={label} aria-label={label}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={cls} title={label} aria-label={label}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
