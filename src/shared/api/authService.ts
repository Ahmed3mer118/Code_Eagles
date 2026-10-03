import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import getApiErrorMessage from "../utils/apiError";
import { getApiUrl } from "../config/apiBase";

// ============================================================
// Types
// ============================================================

/**
 * ✅ الباك بيبعت في الـ JWT:
 *   - sub (user id)
 *   - email
 *   - platformRole (مش role)
 *   - jti
 */
type DecodedToken = {
  sub?: string;
  userId?: string;      // للتوافق مع tokens قديمة
  email?: string;
  platformRole?: string; // ✅ ده اللي الباك بيبعته
  role?: string;         // للتوافق مع tokens قديمة
  tenantId?: string | null;
  exp?: number;
  name?: string;
};

export type SignupAccountType = "teacher" | "student" | "parent";
export type SignupPreferredLanguage = "ar" | "en";
export type GradeLevel = "grade_10" | "grade_11" | "grade_12";

export interface RegisterPayload {
  accountType: SignupAccountType;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  preferredLanguage?: SignupPreferredLanguage;
  // teacher only
  academyName?: string;
  requestedPlanId?: string;
  // student only
  gradeLevel?: GradeLevel;
  parentContact?: string;
  // parent only
  childContact?: string;
}

// ============================================================
// Constants
// ============================================================

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/dashboard/super-admin",
  teacher: "/dashboard/teacher",
  assistant: "/dashboard/assistant",
  parent: "/dashboard/parent",
  student: "/dashboard/student",
};

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

const REFRESH_ENDPOINT = "/auth/refresh";
const NO_REFRESH_ENDPOINTS = [
  REFRESH_ENDPOINT,
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// ============================================================
// Helpers
// ============================================================

const normalizeRole = (role?: string | null): string | null => {
  if (!role) return null;
  if (role === "admin") return "super_admin";
  if (role === "instructor") return "teacher";
  if (role === "user") return "student";
  return role;
};

const readToken = (): string => {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

const readRefreshToken = (): string => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

// ============================================================
// Axios instance
// ============================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;
let mePromise: Promise<unknown> | null = null;
let sessionExpiredNotified = false;

const clearSession = (notifySessionExpired = false) => {
  if (
    notifySessionExpired &&
    !sessionExpiredNotified &&
    typeof window !== "undefined"
  ) {
    sessionExpiredNotified = true;
    import("react-hot-toast").then(({ default: toast }) => {
      toast.error(getApiErrorMessage({ response: { status: 401 } }));
    });
    window.setTimeout(() => {
      sessionExpiredNotified = false;
    }, 4000);
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("ce_user_name");
  localStorage.removeItem("ce_tenant");
  sessionStorage.removeItem("ce_tenant_slug");
};

// ============================================================
// Request interceptor
// ============================================================

apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const fromSession = sessionStorage.getItem("ce_tenant_slug");
    const raw = localStorage.getItem("ce_tenant");
    const slug = fromSession || (raw ? JSON.parse(raw)?.slug : null);
    if (slug) {
      config.headers = config.headers || {};
      config.headers["X-Tenant-Slug"] = slug;
    }
  } catch {
    /* optional */
  }

  return config;
});

// ============================================================
// Refresh token
// ============================================================

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    const refreshToken = readRefreshToken();
    refreshPromise = apiClient
      .post(
        REFRESH_ENDPOINT,
        refreshToken ? { refreshToken } : {},
        { withCredentials: true }
      )
      .then((response) => {
        const token =
          response.data?.accessToken || response.data?.token || null;
        const newRefresh = response.data?.refreshToken || null;
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (newRefresh) localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        return token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// ============================================================
// Response interceptor — auto refresh on 401
// ============================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = originalRequest?.url || "";
    const isRetryable =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint)) &&
      readToken();

    if (isRetryable) {
      originalRequest._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return apiClient(originalRequest);
      }
      clearSession(true);
    }

    return Promise.reject(error);
  }
);

// ============================================================
// AuthServices
// ============================================================

class AuthServices {
  private axiosInstance: AxiosInstance = apiClient;

  // ------------------------------------------------------------
  // EMAIL / PASSWORD AUTH
  // ------------------------------------------------------------

  async register(payload: RegisterPayload) {
    const response = await this.axiosInstance.post(`/auth/register`, payload);
    return response.data;
  }

  /**
   * ✅ الباك بيرجع { message: 'Email verified successfully' } بس
   * (مفيش tokens — المستخدم لازم يسجل دخول بعد كده)
   */
  async verifyEmail(token: string) {
    const response = await this.axiosInstance.post(`/auth/verify-email`, {
      token,
    });
    return response.data;
  }

  async resendVerification(email: string) {
    const response = await this.axiosInstance.post(
      `/auth/resend-verification`,
      { email }
    );
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.axiosInstance.post(
      `/auth/login`,
      { email, password },
      { withCredentials: true }
    );

    if (response.data?.accessToken) {
      this.setToken(response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      }
    }

    // ✅ الباك بيبعت user: { id, email, name, platformRole, preferredLanguage }
    if (response.data.user?.name) {
      localStorage.setItem("ce_user_name", response.data.user.name);
    }
    if (response.data.user?.preferredLanguage) {
      localStorage.setItem("ce_lang", response.data.user.preferredLanguage);
    }
    this.storeTenant(response.data.tenant);

    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.axiosInstance.post(`/auth/forgot-password`, {
      email,
    });
    return response.data;
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ) {
    const response = await this.axiosInstance.post(`/auth/reset-password`, {
      token,
      password,
      confirmPassword,
    });
    return response.data;
  }

  async logout() {
    try {
      const refreshToken = readRefreshToken();
      const response = await this.axiosInstance.post(
        `/auth/logout`,
        refreshToken ? { refreshToken } : {},
        { withCredentials: true }
      );
      this.handleLogout();
      return response.data;
    } catch (error) {
      this.handleLogout();
      throw error;
    }
  }

  async logoutAll() {
    try {
      const response = await this.axiosInstance.post(`/auth/logout-all`, {});
      this.handleLogout();
      return response.data;
    } catch (error) {
      this.handleLogout();
      throw error;
    }
  }

  // ------------------------------------------------------------
  // GOOGLE OAUTH
  // ------------------------------------------------------------

  /**
   * ✅ URL بيتوجه المستخدم ليه عشان يبدأ Google OAuth flow
   *
   * ⚠️ في dev، getApiUrl() بترجع "" (relative)
   *     → عشان نستفيد من proxy بتاع Vite ونتفادى CORS
   * ⚠️ في prod، بترجع absolute URL
   *
   * ملاحظة: مبنستخدش new URL() عشان الـ relative URLs
   *         بتكسرها. بنبني الـ query يدويًا.
   */
  getGoogleAuthUrl(returnTo?: string): string {
    const base = getApiUrl();
    const path = `${base}/auth/google`;

    if (!returnTo) return path;

    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}state=${encodeURIComponent(returnTo)}`;
  }

  /**
   * ✅ بيعالج callback الـ Google
   * الفرونت بيستدعى الدالة دي في صفحة /auth/google/callback
   * بعد ما الباك يرجّع accessToken في الـ query params
   */
  handleGoogleCallback(params: URLSearchParams) {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const name = params.get("name");
    const role = params.get("role");

    if (!accessToken) {
      throw new Error("Missing accessToken from Google callback");
    }

    this.setToken(accessToken);
    if (refreshToken) this.setRefreshToken(refreshToken);
    if (name) localStorage.setItem("ce_user_name", name);

    return { accessToken, refreshToken, name, role };
  }

  async oauthLink(provider: string, code: string) {
    const response = await this.axiosInstance.post(
      `/auth/oauth/${provider}/link`,
      { code }
    );
    return response.data;
  }

  async oauthUnlink(provider: string) {
    const response = await this.axiosInstance.delete(
      `/auth/oauth/${provider}/unlink`
    );
    return response.data;
  }

  // ------------------------------------------------------------
  // PROFILE
  // ------------------------------------------------------------

  async me() {
    if (!mePromise) {
      mePromise = this.axiosInstance
        .get(`/auth/me`)
        .then((response) => response.data)
        .finally(() => {
          mePromise = null;
        });
    }
    return mePromise;
  }

  async updateProfile(payload: {
    name?: string;
    phoneNumber?: string;
    gradeLevel?: string;
  }) {
    const response = await this.axiosInstance.patch("/auth/profile", payload);
    return response.data;
  }

  // ------------------------------------------------------------
  // TOKEN / SESSION HELPERS
  // ------------------------------------------------------------

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getToken(): string {
    return readToken();
  }

  getRefreshToken(): string {
    return readRefreshToken();
  }

  decoded(token: string): DecodedToken {
    return jwtDecode(token);
  }

  /**
   * ✅ الباك بيبعت platformRole مش role
   * فبندور على الاتنين للتوافق
   */
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const d = this.decoded(token);
      const raw = d?.platformRole || d?.role || null;
      return normalizeRole(raw);
    } catch {
      return null;
    }
  }

  getDashboardPath(role?: string | null): string {
    const r = normalizeRole(role || this.getRole());
    return (r && ROLE_DASHBOARD[r]) || "/dashboard/student";
  }

  getUserName(): string {
    return localStorage.getItem("ce_user_name") || "User";
  }

  /** ✅ الباك بيستخدم sub للـ user id */
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const d = this.decoded(token);
      return d?.sub || d?.userId || null;
    } catch {
      return null;
    }
  }

  getTenantId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return this.decoded(token)?.tenantId || null;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decodedToken = this.decoded(token);
      return !decodedToken.exp || decodedToken.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  async refreshToken() {
    if (!this.getToken()) return null;
    return refreshAccessToken();
  }

  handleLogout(notifySessionExpired = false) {
    clearSession(notifySessionExpired);
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // ------------------------------------------------------------
  // PRIVATE
  // ------------------------------------------------------------

  private storeTenant(tenant?: { slug?: string | null } | null) {
    if (tenant) {
      localStorage.setItem("ce_tenant", JSON.stringify(tenant));
      if (tenant.slug) sessionStorage.setItem("ce_tenant_slug", tenant.slug);
      else sessionStorage.removeItem("ce_tenant_slug");
      return;
    }
    localStorage.removeItem("ce_tenant");
    sessionStorage.removeItem("ce_tenant_slug");
  }
}

export default AuthServices;
export { ROLE_DASHBOARD, normalizeRole, apiClient };