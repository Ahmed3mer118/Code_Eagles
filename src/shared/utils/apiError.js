import i18n from '../i18n';

const MESSAGE_KEYS = {
  'Invalid credentials': 'errors.invalidCredentials',
  'User already exists and is verified': 'errors.userExists',
  'Invalid or expired verification code': 'errors.invalidVerificationCode',
  'User not found': 'errors.userNotFound',
  'Please verify your email first': 'errors.verifyEmailFirst',
  'Account suspended': 'errors.accountSuspended',
  'Tenant context required': 'errors.tenantRequired',
  'Academy context is missing. Please register through your academy link or contact support.': 'errors.tenantRequired',
  'Students only': 'errors.studentsOnly',
  'Parents only': 'errors.parentsOnly',
  'Invalid registration role': 'errors.invalidRole',
  'You are already enrolled in this group.': 'errors.alreadyEnrolled',
  'Network Error': 'errors.network',
};

function isArabic(text = '') {
  return /[\u0600-\u06FF]/.test(text);
}

export function getApiErrorMessage(err, fallbackKey = 'common.error') {
  const t = i18n.t.bind(i18n);
  const status = err?.response?.status;
  const msg = String(err?.response?.data?.message || err?.message || '').trim();
  const code = err?.response?.data?.code;

  if (status === 401 || code === 'TOKEN_EXPIRED' || /jwt expired|token expired|invalid token|unauthorized/i.test(msg)) {
    return t('errors.sessionExpired');
  }
  if (code === 'FEATURE_DISABLED') {
    const featureKey = err?.response?.data?.feature;
    const featureLabel = featureKey ? t(`features.${featureKey}`) : '';
    return featureLabel ? t('features.lockedHint', { feature: featureLabel }) : t('features.lockedTitle');
  }
  if (status === 403 && /verify your email/i.test(msg)) return t('errors.verifyEmailFirst');
  if (status === 403 && /suspended/i.test(msg)) return t('errors.accountSuspended');
  if (status === 403) return t('errors.forbidden');
  if (status === 404) return msg && MESSAGE_KEYS[msg] ? t(MESSAGE_KEYS[msg]) : t('errors.notFound');
  if (status === 400 && code === 'TENANT_REQUIRED') return t('errors.tenantRequired');
  if (status === 400 && msg && MESSAGE_KEYS[msg]) return t(MESSAGE_KEYS[msg]);
  if (!status && /network error|failed to fetch/i.test(msg)) return t('errors.network');
  if (msg && MESSAGE_KEYS[msg]) return t(MESSAGE_KEYS[msg]);
  if (msg && isArabic(msg)) return msg;

  return msg || t(fallbackKey);
}

export default getApiErrorMessage;
