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
