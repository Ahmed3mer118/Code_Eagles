import { PageHeader } from '../SuperAdminLayout';
import { useI18n } from '../../../shared/i18n';
import { IconPlus } from '../icons';

export default function PlaceholderPage({ sectionKey, Icon }) {
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        title={t(`admin.pages.${sectionKey}.title`)}
        subtitle={t(`admin.pages.${sectionKey}.subtitle`)}
        action={
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#0f2744] text-white text-sm font-semibold shadow-lg shadow-[#1a3a5c]/25 hover:shadow-xl hover:-translate-y-0.5 transition">
            <IconPlus className="w-4 h-4" />
            {t('admin.actions.add')}
          </button>
        }
      />

      <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 backdrop-blur-sm p-12 sm:p-20 text-center">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 mb-5 shadow-inner">
          {Icon ? <Icon className="w-8 h-8" /> : null}
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          {t(`admin.pages.${sectionKey}.title`)}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {t('admin.pages.placeholder')}
        </p>
      </div>
    </>
  );
}