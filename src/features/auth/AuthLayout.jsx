import { useState } from 'react';
import LanguageSwitcher from '../../shared/ui/LanguageSwitcher';

/* ——— Icons ——— */
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ——— Layout ——— */
export default function AuthLayout({
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  showLangSwitcher = true,
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden bg-gradient-to-br from-slate-50 via-[#eef2f8] to-[#e3eaf5]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-[#1a3a5c]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-1/3 w-72 h-72 rounded-full bg-[#1a3a5c]/5 blur-3xl" />

      <div className={`relative w-full ${maxWidth}`}>
        <div className="relative bg-white/85 backdrop-blur-2xl rounded-[28px] p-8 sm:p-10 shadow-[0_25px_70px_-20px_rgba(15,39,68,0.30)] ring-1 ring-white/70">
          {showLangSwitcher && (
            <div className="absolute top-5 start-5">
              <LanguageSwitcher />
            </div>
          )}

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1a3a5c] to-[#0f2744] blur-lg opacity-30" />
              <div className="relative w-20 h-20 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center shadow-sm">
                <img
                  src="/images/LOGO.png"
                  alt="Code Eagles"
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[26px] leading-tight font-extrabold text-slate-900 text-center tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500 text-center mb-8 leading-relaxed">
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {/* Footer hint */}
        <p className="mt-5 text-center text-[11px] text-slate-400 tracking-wide">
          © {new Date().getFullYear()} Code Eagles — All rights reserved
        </p>
      </div>
    </div>
  );
}

/* ——— Input ——— */
export function AuthInput({ label, type, className, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && show ? 'text' : type;

  return (
    <div>
      {label && (
        <label className="block text-[13px] font-semibold text-slate-700 mb-2 text-start">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={actualType}
          {...props}
          className={`w-full bg-slate-100/70 hover:bg-slate-100 border border-slate-200/70 rounded-2xl ${
            isPassword ? 'ps-4 pe-12' : 'px-4'
          } py-3.5 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-[#1a3a5c]/15 focus:border-[#1a3a5c] focus:bg-white outline-none transition-all duration-200 ${className || ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-[#1a3a5c] transition p-1"
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ——— Select ——— */
export function AuthSelect({ label, children, className, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-[13px] font-semibold text-slate-700 mb-2 text-start">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`w-full appearance-none bg-slate-100/70 hover:bg-slate-100 border border-slate-200/70 rounded-2xl px-4 py-3.5 pe-12 text-slate-900 font-medium focus:ring-4 focus:ring-[#1a3a5c]/15 focus:border-[#1a3a5c] focus:bg-white outline-none transition-all duration-200 cursor-pointer ${className || ''}`}
        >
          {children}
        </select>
        <span className="absolute top-1/2 -translate-y-1/2 end-4 text-slate-400 pointer-events-none">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}

/* ——— Button ——— */
export function AuthButton({ children, loading, className, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative w-full bg-gradient-to-r from-[#1a3a5c] to-[#0f2744] text-white rounded-2xl py-3.5 font-semibold shadow-lg shadow-[#1a3a5c]/25 hover:shadow-xl hover:shadow-[#1a3a5c]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg ${className || ''}`}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </span>
    </button>
  );
}

/* ——— Alert ——— */
export function AuthAlert({ type = 'error', children }) {
  if (!children) return null;
  const isSuccess = type === 'success';
  return (
    <div
      className={`mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl border text-sm leading-relaxed ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}
    >
      <span className="shrink-0 mt-0.5">
        {isSuccess ? <CheckCircleIcon /> : <AlertCircleIcon />}
      </span>
      <span className="flex-1">{children}</span>
    </div>
  );
}