// src/features/student/components/PlanSelector.jsx
import { CheckCircle2, CreditCard, Layers } from 'lucide-react';

export default function PlanSelector({
  academy,
  plans,
  groups,
  selectedPlan,
  selectedGroup,
  onSelectPlan,
  onSelectGroup,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          الخطوة 2: اختر الخطة والمجموعة
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          الأكاديمية: <strong>{academy?.name}</strong>
        </p>
      </div>

      {/* Plans */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <CreditCard size={18} className="text-primary-600" />
          خطط الدفع المتاحة
        </h3>

        {plans.length === 0 ? (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
            لا توجد خطط دفع متاحة حالياً لهذه الأكاديمية.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className={`text-start p-4 rounded-xl border-2 transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </p>
                      <p className="text-2xl font-bold text-primary-600 mt-2">
                        {plan.price} <span className="text-sm">ج.م</span>
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2
                        size={20}
                        className="text-primary-600 shrink-0"
                      />
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                  {plan.durationDays && (
                    <p className="text-xs text-gray-400 mt-2">
                      مدة الاشتراك: {plan.durationDays} يوم
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Groups */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Layers size={18} className="text-primary-600" />
          اختر مجموعة
        </h3>

        {groups.length === 0 ? (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
            لا توجد مجموعات متاحة حالياً.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {groups.map((group) => {
              const isSelected = selectedGroup?.id === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => onSelectGroup(group)}
                  className={`text-start p-4 rounded-xl border-2 transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {group.name}
                      </p>
                      {group.gradeLevel && (
                        <p className="text-xs text-gray-500 mt-1">
                          {group.gradeLevel}
                        </p>
                      )}
                      {group.schedule && (
                        <p className="text-xs text-gray-400 mt-1">
                          {group.schedule}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2
                        size={20}
                        className="text-primary-600 shrink-0"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
