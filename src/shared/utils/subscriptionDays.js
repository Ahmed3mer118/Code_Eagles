export function getDaysRemaining(expiresAt) {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt) - Date.now()) / 86400000);
}

export function formatSubscriptionExpiry(expiresAt, t) {
  const days = getDaysRemaining(expiresAt);
  if (days === null) return t('admin.noActiveSubscription');
  if (days < 0) return t('admin.subscriptionExpired');
  if (days === 0) return t('admin.subscriptionExpiresToday');
  return t('admin.subscriptionDaysLeft', { days });
}

export function normalizePlanPeriod(plan = {}) {
  const periodUnit = plan.periodUnit === 'days' ? 'days' : 'months';
  const periodValue = Math.max(1, Number(plan.periodValue ?? plan.periodMonths ?? 1) || 1);
  return { periodUnit, periodValue };
}

export function formatPlanPeriod(plan = {}, t) {
  const { periodUnit, periodValue } = normalizePlanPeriod(plan);
  if (periodUnit === 'days') {
    return t('platformSub.periodDays', { count: periodValue });
  }
  return t('platformSub.periodMonths', { count: periodValue });
}
