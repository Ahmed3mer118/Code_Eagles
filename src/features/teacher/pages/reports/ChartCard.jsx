// src/features/teacher/pages/reports/ChartCard.jsx
export default function ChartCard({ title, subtitle, icon: Icon, children, action }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Icon size={16} className="text-primary-600" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
