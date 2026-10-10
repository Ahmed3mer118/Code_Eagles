import { useState } from 'react';
import { PageHeader } from '../../SuperAdminLayout';
import FaqsTab from './FaqsTab';
import TestimonialsTab from './TestimonialsTab';
import SiteContentTab from './SiteContentTab';
import EmergencyTab from './EmergencyTab';

const TABS = [
  { key: 'faqs',         label: 'FAQs' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'site',         label: 'Site Content' },
  { key: 'emergency',    label: 'Emergency' },
];

export default function ContentManagementPage() {
  const [tab, setTab] = useState('faqs');

  return (
    <div>
      <PageHeader
        title="Content Management"
        subtitle="Manage FAQs, testimonials, landing page content, and emergency settings"
      />

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? 'bg-[#0f2744] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm">
        {tab === 'faqs' && <FaqsTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'site' && <SiteContentTab />}
        {tab === 'emergency' && <EmergencyTab />}
      </div>
    </div>
  );
}