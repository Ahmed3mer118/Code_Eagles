// src/features/superadmin/pages/content/ContentManagementPage.jsx
import { useState } from 'react';
import { FileQuestion, MessageSquareQuote, LayoutTemplate, Siren } from 'lucide-react';
import { PageHeader } from '../../SuperAdminLayout';
import { useI18n } from '../../../../shared/i18n';
import FaqsTab from './FaqsTab';
import TestimonialsTab from './TestimonialsTab';
import SiteContentTab from './SiteContentTab';
import EmergencyTab from './EmergencyTab';

const TABS = [
  { key: 'faqs',         icon: FileQuestion,        ar: 'الأسئلة الشائعة',   en: 'FAQs' },
  { key: 'testimonials', icon: MessageSquareQuote,  ar: 'آراء العملاء',       en: 'Testimonials' },
  { key: 'site',         icon: LayoutTemplate,      ar: 'محتوى الموقع',      en: 'Site Content' },
  { key: 'emergency',    icon: Siren,               ar: 'وضع الطوارئ',       en: 'Emergency' },
];

export default function ContentManagementPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const [tab, setTab] = useState('faqs');

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'إدارة المحتوى' : 'Content Management'}
        subtitle={
          isAr
            ? 'تحكم كامل في الأسئلة الشائعة، آراء العملاء، محتوى اللاندنج بيدج، وحالة الطوارئ.'
            : 'Full control over FAQs, testimonials, landing page content, and emergency settings.'
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {TABS.map(({ key, icon: Icon, ar, en }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-[#0f2744] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {isAr ? ar : en}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        {tab === 'faqs' && <FaqsTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'site' && <SiteContentTab />}
        {tab === 'emergency' && <EmergencyTab />}
      </div>
    </div>
  );
}
