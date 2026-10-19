// src/features/teacher/pages/reports/CustomTooltip.jsx
export default function CustomTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2.5 text-xs">
      {label && (
        <p className="font-medium text-gray-900 dark:text-white mb-1">
          {label}
        </p>
      )}
      {payload.map((entry, idx) => (
        <p
          key={idx}
          className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span>{entry.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {entry.value}
            {suffix}
          </span>
        </p>
      ))}
    </div>
  );
}
