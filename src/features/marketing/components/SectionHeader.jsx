export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignClass =
    align === 'start' ? 'text-start items-start' : 'text-center items-center';

  return (
    <div className={`mb-10 flex max-w-3xl flex-col gap-3 ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="ce-eyebrow">{eyebrow}</span>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-[var(--ce-primary)] sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
