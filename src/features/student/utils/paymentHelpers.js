// src/features/student/utils/paymentHelpers.js

/**
 * استخراج رابط صورة التحويل من أي شكل للبيانات
 */
export function getProofImageUrl(payment) {
  if (!payment) return null;
  return (
    payment?.metadata?.proofImageUrl ||
    payment?.metadata?.receiptImageUrl ||
    payment?.proofImageUrl ||
    null
  );
}

/**
 * معلومات الحالة (label + colors)
 */
export const PAYMENT_STATUS = {
  pending: {
    label: 'قيد المراجعة',
    color: 'amber',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  under_review: {
    label: 'تحت المراجعة',
    color: 'blue',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  approved: {
    label: 'مقبول',
    color: 'green',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'مرفوض',
    color: 'red',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'ملغي',
    color: 'gray',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
};

export const ENROLLMENT_STATUS = {
  pending: {
    label: 'قيد المراجعة',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  active: {
    label: 'نشط',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  expired: {
    label: 'منتهي',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
  cancelled: {
    label: 'ملغي',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  left: {
    label: 'غادر',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
};

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return Number(amount).toLocaleString('ar-EG') + ' ج.م';
}

export function formatDate(date, withTime = false) {
  if (!date) return '—';
  try {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit' }),
    };
    return new Date(date).toLocaleString('ar-EG', options);
  } catch {
    return '—';
  }
}
