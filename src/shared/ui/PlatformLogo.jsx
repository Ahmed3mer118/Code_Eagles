import { useTranslation } from 'react-i18next';

export default function PlatformLogo({ className = 'h-11 w-11', imgClassName = 'rounded-2xl object-contain' }) {
  const { t } = useTranslation();

  return (
    <img
      src="/images/LOGO.png"
      alt={t('brand.name')}
      className={`shrink-0 ${className} ${imgClassName}`}
      width={44}
      height={44}
      loading="eager"
      decoding="async"
    />
  );
}
