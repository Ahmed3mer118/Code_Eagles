// src/features/auth/LoginPage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../shared/api/authService';
import { extractApiError } from '../../shared/utils/apiError';
import { useI18n } from '../../shared/i18n';
import AuthLayout, { AuthInput, AuthButton, AuthAlert } from './AuthLayout';

/* ——— فك JWT ——— */
function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/* ——— كشف super_admin ——— */
function isSuperAdminResponse(res) {
  if (!res) return false;

  const platformRole = res?.user?.platformRole || res?.platformRole;
  if (
    typeof platformRole === 'string' &&
    platformRole.toLowerCase() === 'super_admin'
  ) {
    return true;
  }

  if (res?.accessToken) {
    const payload = decodeJwtPayload(res.accessToken);
    const jwtRole =
      payload?.platformRole || payload?.role || payload?.platform_role;
    if (
      typeof jwtRole === 'string' &&
      jwtRole.toLowerCase() === 'super_admin'
    ) {
      return true;
    }
  }

  return false;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const tokenRedirectedRef = useRef(false);

  useEffect(() => {
    if (tokenRedirectedRef.current) return;

    const token =
      searchParams.get('token') ||
      searchParams.get('code') ||
      searchParams.get('verificationToken');
    const verified = searchParams.get('verified');

    if (token) {
      tokenRedirectedRef.current = true;
      navigate(`/verify-email?token=${encodeURIComponent(token)}`, {
        replace: true,
      });
      return;
    }

    if (verified === '1' || verified === 'true') {
      setInfo('✅ تم تأكيد بريدك الإلكتروني بنجاح — يمكنك تسجيل الدخول الآن');
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, navigate]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await authService.login(form);

      // 1️⃣ SUPER ADMIN
      if (isSuperAdminResponse(res)) {
        try {
          localStorage.setItem('isSuperAdmin', 'true');
        } catch (e) {}
        window.location.href = '/admin/dashboard';
        return;
      }

      try {
        localStorage.removeItem('isSuperAdmin');
      } catch (_) {}

      // 2️⃣ استخراج الـ Role بشكل ذكي جداً (عشان مشكلة البيرنت)
      let role = 
        res?.currentTenant?.role || 
        res?.user?.role || 
        res?.memberships?.[0]?.role || 
        res?.user?.memberships?.[0]?.role;

      // لو لسه مفيش، نجيبها من التوكن
      if (!role && res.accessToken) {
        const payload = decodeJwtPayload(res.accessToken);
        role = payload?.role || payload?.tenantRole;
      }

      // لو لسه مفيش، نجيبها من الـ LocalStorage
      if (!role) {
        try {
          const storedUser = JSON.parse(localStorage.getItem('ce_user') || '{}');
          role = storedUser?.role || storedUser?.memberships?.[0]?.role;
        } catch (err) {}
      }

      // 3️⃣ التوجيه بناءً على الـ Role
      if (role === 'parent') {
        navigate('/parent/dashboard', { replace: true });
        return;
      }

      if (role === 'student') {
        navigate('/student/dashboard', { replace: true });
        return;
      }

      if (role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
        return;
      }

      if (role === 'assistant') {
        navigate('/assistant/dashboard', { replace: true });
        return;
      }

      // 4️⃣ حالات التوجيه الأخرى (لو مفيش Role)
      if (res.needsOnboarding) {
        navigate('/onboarding', { replace: true });
        return;
      }

      const membershipsCount = res.memberships?.length ?? 0;
      if (res.requiresTenantSelection || membershipsCount > 1) {
        navigate('/select-tenant', { replace: true });
        return;
      }

      if (res.currentTenant?.tenantId) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // 5️⃣ لو لسه مفيش أي حاجة، نوديه لصفحة اختيار الأكاديمية (مش الطالب)
      console.log('🔀 No clear role/tenant found, redirecting to select-tenant');
      navigate('/select-tenant', { replace: true });

    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('auth.login')} subtitle={t('auth.loginSubtitle')}>
      <AuthAlert type="success">{info}</AuthAlert>
      <AuthAlert>{error}</AuthAlert>

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput
          label={t('auth.email')}
          type="email"
          name="email"
          required
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
        />
        <AuthInput
          label={t('auth.password')}
          type="password"
          name="password"
          required
          minLength={8}
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
        />

        <div className="flex justify-end -mt-1">
          <Link
            to="/forgot-password"
            className="text-[13px] text-[#1a3a5c] hover:underline font-semibold"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <AuthButton type="submit" loading={loading}>
          {loading ? t('auth.signingIn') : t('auth.login')}
        </AuthButton>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white/85 text-[11px] text-slate-400 uppercase tracking-wider">
            {t('common.or')}
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">
        {t('auth.noAccount')}{' '}
        <Link
          to="/register"
          className="text-[#1a3a5c] font-bold hover:underline"
        >
          {t('auth.register')}
        </Link>
      </p>
    </AuthLayout>
  );
}
