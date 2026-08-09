const PLACEHOLDERS = new Set(['undefined', 'null']);

/** Query values injected from missing state (`undefined`, `null`, …) must be treated as absent. */
export function cleanParamValue(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || PLACEHOLDERS.has(trimmed.toLowerCase())) return '';
  return trimmed;
}

/** Reads a query param and drops placeholder values. */
export function getCleanParam(params, key) {
  if (!params?.get) return '';
  return cleanParamValue(params.get(key));
}

/** Builds a query string from an object, skipping empty and placeholder values. */
export function buildQueryString(values = {}) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    const clean = cleanParamValue(value);
    if (clean) params.set(key, clean);
  });
  return params.toString();
}
