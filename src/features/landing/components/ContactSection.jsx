// src/features/landing/components/ContactSection.jsx
import { useState } from 'react';
import contactService from '../../../shared/api/contactService';

const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 6 10 7 10-7" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const AlertIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

export default function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type, text, id }

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({
        type: 'error',
        text: 'من فضلك املأ الاسم والإيميل والرسالة',
        id: Date.now(),
      });
      return;
    }
    if (form.message.trim().length < 10) {
      setStatus({
        type: 'error',
        text: 'الرسالة قصيرة جدًا (10 أحرف على الأقل)',
        id: Date.now(),
      });
      return;
    }

    setLoading(true);
    try {
      await contactService.send({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      });

      // ✅ استخدم setTimeout عشان نتجنب مشكلة الـ removeChild
      //   لو الـ form اتعمله unmount بسبب تغيير dir أو i18n
      setTimeout(() => {
        setStatus({
          type: 'success',
          text: 'تم إرسال رسالتك بنجاح! هنرد عليك في أقرب وقت ✅',
          id: Date.now(),
        });
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      }, 0);
    } catch (err) {
      setStatus({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'حدث خطأ أثناء الإرسال، حاول مرة أخرى',
        id: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 py-20 sm:py-24"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <MailIcon />
            تواصل معنا
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            عندك سؤال؟ إحنا هنا للمساعدة
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            ابعتلنا رسالتك وهنرد عليك في أقرب وقت. سواء كنت طالب، ولي أمر، أو
            صاحب أكاديمية.
          </p>
        </div>

        <div className="grid gap-8 rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/60 backdrop-blur-sm sm:grid-cols-5 sm:p-10">
          <div className="sm:col-span-2 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                خليك على تواصل
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                فريق الدعم متاح للرد على استفساراتك حول المنصة، الأكاديميات،
                والاشتراكات.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <MailIcon />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    البريد الإلكتروني
                  </div>
                  <div className="font-semibold" dir="ltr">
                    support@code-eagles.com
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <PhoneIcon />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    الهاتف
                  </div>
                  <div className="font-semibold" dir="ltr">
                    +20 100 000 0000
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              بنرد عادةً خلال 24 ساعة في أيام العمل.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="sm:col-span-3 space-y-4">
            {/* ✅ key فريد عشان نتجنب removeChild */}
            {status && (
              <div
                key={status.id}
                className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {status.type === 'success' ? <CheckIcon /> : <AlertIcon />}
                </span>
                <span>{status.text}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم الكامل *" icon={<UserIcon />}>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update('name')}
                  placeholder="اسمك الكريم"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </Field>

              <Field label="البريد الإلكتروني *" icon={<MailIcon />}>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="رقم الهاتف (اختياري)" icon={<PhoneIcon />}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+20 1xx xxx xxxx"
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </Field>

              <Field label="الموضوع (اختياري)">
                <input
                  type="text"
                  value={form.subject}
                  onChange={update('subject')}
                  placeholder="عن إيه رسالتك؟"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </Field>
            </div>

            <Field label="الرسالة *">
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={update('message')}
                placeholder="اكتب رسالتك بالتفصيل هنا..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جاري الإرسال...
                </>
              ) : (
                <>📨 إرسال الرسالة</>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        {icon && <span className="text-indigo-500">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  );
}
