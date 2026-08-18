const PLATFORM_DARK = {
  '--ce-bg': '#0b1220',
  '--ce-surface': '#111827',
  '--ce-text': '#f8fafc',
  '--ce-muted': '#94a3b8',
  '--ce-border': '#1f2937',
  '--ce-primary': '#f1f5f9',
  '--ce-primary-soft': '#cbd5e1',
  '--ce-shadow': '0 10px 40px rgba(0, 0, 0, 0.35)',
};

const PLATFORM_LIGHT = {
  '--ce-bg': '#f5f7fa',
  '--ce-surface': '#ffffff',
  '--ce-text': '#0f172a',
  '--ce-muted': '#64748b',
  '--ce-border': '#e2e8f0',
};

/** Merge tenant branding with platform light/dark tokens for public academy pages. */
export function buildAcademyThemeStyle(tenant, isDark) {
  const theme = tenant?.theme || {};
  const brand = theme.primary || '#0B1F33';
  const brandSoft = '#14324f';

  const brandVars = {
    '--ce-brand': brand,
    '--ce-brand-soft': brandSoft,
    '--ce-brand-mid': brand,
    '--ce-brand-deep': brand,
    '--ce-accent': theme.accent || '#E8A317',
    '--ce-accent-soft': '#f6c85a',
  };

  if (isDark) {
    return { ...brandVars, ...PLATFORM_DARK };
  }

  return {
    ...brandVars,
    '--ce-primary': brand,
    '--ce-primary-soft': brandSoft,
    '--ce-bg': theme.background || PLATFORM_LIGHT['--ce-bg'],
    '--ce-surface': theme.surface || PLATFORM_LIGHT['--ce-surface'],
    '--ce-text': theme.text || PLATFORM_LIGHT['--ce-text'],
    '--ce-muted': PLATFORM_LIGHT['--ce-muted'],
    '--ce-border': PLATFORM_LIGHT['--ce-border'],
  };
}
