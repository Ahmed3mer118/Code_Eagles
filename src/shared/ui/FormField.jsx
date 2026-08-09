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

import getApiErrorMessage from '../utils/apiError';

export function getFriendlyError(err, fallback) {
  return getApiErrorMessage(err, fallback ? undefined : 'common.error');
}
