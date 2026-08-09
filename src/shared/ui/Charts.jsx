import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useTranslation } from 'react-i18next';

/** Single palette for every chart and stat tone, mirroring the CSS design tokens. */
export const CHART_COLORS = {
  accent: '#e8a317',
  primary: '#0b1f33',
  success: '#0f9f6e',
  info: '#2563eb',
  danger: '#dc2626',
  grid: '#e2e8f0',
  muted: '#64748b',
};

const TONES = {
  default: 'bg-[var(--ce-bg)] text-[var(--ce-primary)]',
  accent: 'bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]',
  success: 'bg-emerald-500/12 text-emerald-600',
  info: 'bg-blue-500/12 text-blue-600',
  danger: 'bg-red-500/12 text-red-600',
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return typeof value === 'number' ? value.toLocaleString() : value;
};

/**
 * Compact metric card: label, value and an optional icon chip.
 * Accepts `{ label, value, icon, hint, tone }` so callers stay declarative.
 */
export function StatCards({ items = [], columns = 4 }) {
  const gridCols = columns === 3 ? 'xl:grid-cols-3' : columns === 2 ? 'xl:grid-cols-2' : 'xl:grid-cols-4';

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${gridCols}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="ce-card ce-card-hover flex items-start gap-4 p-5"
          >
            {Icon && (
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[item.tone] || TONES.default}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--ce-muted)]">{item.label}</div>
              <div className="mt-1 text-3xl font-extrabold tabular-nums text-[var(--ce-primary)]">
                {formatValue(item.value)}
              </div>
              {item.hint && <div className="mt-1 text-xs text-[var(--ce-muted)]">{item.hint}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartEmpty() {
  const { t } = useTranslation();
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[var(--ce-border)] text-sm text-[var(--ce-muted)]">
      {t('common.noData')}
    </div>
  );
}

const axisProps = {
  tick: { fontSize: 12, fill: CHART_COLORS.muted },
  tickLine: false,
  axisLine: false,
};

const tooltipProps = {
  cursor: { fill: 'rgba(11, 31, 51, 0.04)' },
  contentStyle: {
    borderRadius: 12,
    border: `1px solid ${CHART_COLORS.grid}`,
    boxShadow: '0 10px 30px rgba(11, 31, 51, 0.12)',
    fontSize: 12,
  },
};

export function SimpleBarChart({ data, xKey = 'name', yKey = 'count', color = CHART_COLORS.accent }) {
  if (!data?.length) return <ChartEmpty />;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} strokeDasharray="4 4" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis allowDecimals={false} width={44} {...axisProps} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey={yKey} fill={color} radius={[8, 8, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleLineChart({ data, xKey = '_id', yKey = 'total', color = CHART_COLORS.primary }) {
  if (!data?.length) return <ChartEmpty />;
  const gradientId = `ce-area-${yKey}`;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} strokeDasharray="4 4" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis width={44} {...axisProps} />
          <Tooltip {...tooltipProps} />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}