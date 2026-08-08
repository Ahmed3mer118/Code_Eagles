import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export function StatCards({ items = [] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="ce-card p-5">
          <div className="text-sm text-[var(--ce-muted)]">{item.label}</div>
          <div className="mt-2 text-3xl font-extrabold text-[var(--ce-primary)]">{item.value ?? '—'}</div>
        </div>
      ))}
    </div>
  );
}

export function SimpleBarChart({ data, xKey = 'name', yKey = 'count', color = '#E8A317' }) {
  if (!data?.length) return <p className="text-sm text-[var(--ce-muted)]">—</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleLineChart({ data, xKey = '_id', yKey = 'total', color = '#0B1F33' }) {
  if (!data?.length) return <p className="text-sm text-[var(--ce-muted)]">—</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
