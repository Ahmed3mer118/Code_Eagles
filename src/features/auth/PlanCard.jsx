export default function PlanCard({ plan, selected, onSelect, lang = 'ar' }) {
  const isSelected = selected === plan.id;

  const name = lang === 'ar' ? plan.nameAr || plan.name : plan.name;
  const description =
    lang === 'ar'
      ? plan.descriptionAr || plan.description
      : plan.description;

  const features = normalizeFeatures(
    lang === 'ar' ? plan.featuresAr || plan.features : plan.features,
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(plan.id)}
      className={`relative w-full text-start p-5 rounded-2xl border-2 transition-all duration-200 overflow-hidden group ${
        isSelected
          ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/50 shadow-md shadow-amber-200/50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute top-0 end-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-bs-2xl shadow-sm">
          ⭐ {lang === 'ar' ? 'الأكثر شهرة' : 'Popular'}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-bold mb-1 truncate ${
              isSelected ? 'text-amber-900' : 'text-slate-800'
            }`}
          >
            {name}
          </h3>
          <p
            className={`text-sm font-semibold ${
              isSelected ? 'text-amber-700' : 'text-slate-500'
            }`}
          >
            {formatPrice(plan.price, plan.currency)}
            {plan.durationMonths ? (
              <span className="text-xs font-normal opacity-70">
                {' '}• {plan.durationMonths} {lang === 'ar' ? 'شهر' : 'mo'}
              </span>
            ) : null}
          </p>
        </div>

        {/* Radio */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
            isSelected
              ? 'border-amber-500 bg-amber-500'
              : 'border-slate-300 group-hover:border-slate-400'
          }`}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p
          className={`text-xs mb-3 leading-relaxed ${
            isSelected ? 'text-amber-900/70' : 'text-slate-500'
          }`}
        >
          {description}
        </p>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {features.map((f, i) => (
            <span
              key={i}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${
                isSelected
                  ? 'bg-amber-100/80 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

/* ——— Helpers ——— */
function normalizeFeatures(features) {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  return Object.entries(features)
    .filter(([, v]) => v === true)
    .map(([k]) => featureLabel(k));
}

function featureLabel(key) {
  const map = {
    quizzes: 'الاختبارات',
    homework: 'الواجبات',
    lessons: 'الدروس والمحاضرات',
    groups: 'المجموعات',
    payments: 'المدفوعات',
    reports: 'التقارير',
    discussions: 'النقاشات',
    certificates: 'الشهادات',
    assistants: 'المساعدون',
  };
  return map[key] || key;
}

function formatPrice(price, currency = 'ج.م') {
  if (price == null) return '';
  return `${price} ${currency}`;
}