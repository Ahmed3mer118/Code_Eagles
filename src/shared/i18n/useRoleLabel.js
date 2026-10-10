import { useI18n } from './index';

export function useRoleLabel() {
  const { t } = useI18n();

  return (role) => {
    if (!role) return t('roles.user');
    const key = `roles.${String(role).toLowerCase()}`;
    const label = t(key);
    return label === key ? role : label;
  };
}