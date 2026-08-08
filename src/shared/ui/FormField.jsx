export default function FormField({
  label,
  required,
  helper,
  error,
  children,
  htmlFor,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="ce-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="text-[var(--ce-danger)]"> *</span>}
        </label>
      )}
      {children}
      {helper && !error && <p className="mt-1 text-xs text-[var(--ce-muted)]">{helper}</p>}
      {error && <p className="mt-1 text-xs font-semibold text-[var(--ce-danger)]">{error}</p>}
    </div>
  );
}

export function getFriendlyError(err, fallback = 'Something went wrong. Please try again.') {
  const msg = err?.response?.data?.message || err?.message;
  if (!msg) return fallback;
  if (msg === 'Tenant context required') return 'Please log in again or contact support — academy context is missing.';
  if (msg === 'Invalid credentials') return 'Email or password is incorrect. Please check and try again.';
  return msg;
}
