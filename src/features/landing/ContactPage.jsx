// src/features/landing/ContactPage.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LandingHeader from './components/LandingHeader';
import LandingFooter from './components/LandingFooter';
import ContactSection from './components/ContactSection';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--ce-bg)]">
      <LandingHeader />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ce-muted)] transition hover:text-[var(--ce-accent)]"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </div>
      <ContactSection />
      <LandingFooter />
    </div>
  );
}
