import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import getApiErrorMessage from "../utils/apiError";

type DecodedToken = {
  userId?: string;
  role?: string;
  tenantId?: string | null;
  exp?: number;
  name?: string;
};

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/dashboard/super-admin",
  teacher: "/dashboard/teacher",
  assistant: "/dashboard/assistant",
  parent: "/dashboard/parent",
  student: "/dashboard/student",
  admin: "/dashboard/super-admin",
  instructor: "/dashboard/teacher",
  user: "/dashboard/student",
};

const TOKEN_KEY = "token";
const REFRESH_ENDPOINT = "/api/auth/refresh";
/** Endpoints that answer 401 for wrong credentials, not for an expired session. */
const NO_REFRESH_ENDPOINTS = [REFRESH_ENDPOINT, "/api/auth/login", "/api/auth/register", "/api/auth/verify-email"];

const normalizeRole = (role?: string | null) => {
  if (!role) return null;
  if (role === "admin") return "super_admin";
  if (role === "instructor") return "teacher";
  if (role === "user") return "student";
  return role;
};

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

/**
 * One axios instance for the whole app: every `new AuthServices()` shares the same
 * token, the same tenant header and the same refresh cycle, so parallel requests
 * can never race each other into a false "session expired".
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;
let mePromise: Promise<unknown> | null = null;
let sessionExpiredNotified = false;

const clearSession = (notifySessionExpired = false) => {
  if (notifySessionExpired && !sessionExpiredNotified && typeof window !== "undefined") {
    sessionExpiredNotified = true;
    import("react-hot-toast").then(({ default: toast }) => {
      toast.error(getApiErrorMessage({ response: { status: 401 } }));
    });
    window.setTimeout(() => {
      sessionExpiredNotified = false;
    }, 4000);
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("ce_user_name");
  localStorage.removeItem("ce_tenant");
  sessionStorage.removeItem("ce_tenant_slug");
};

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
    /* tenant header is optional */
  }

  return config;
});

/** Concurrent 401s wait on a single refresh call instead of triggering one each. */
const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post(REFRESH_ENDPOINT, {}, { withCredentials: true })
      .then((response) => {
        const token = response.data?.accessToken || null;
        if (token) localStorage.setItem(TOKEN_KEY, token);
        return token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
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

class AuthServices {
  private axiosInstance: AxiosInstance = apiClient;

  async register(userData: Record<string, unknown> | string) {
    const response = await this.axiosInstance.post(`/api/auth/register`, userData);
    return response.data;
  }

  async verifyEmail(email: string, code: string) {
    const response = await this.axiosInstance.post(`/api/auth/verify-email`, { email, code });
    if (response.data.accessToken) {
      this.setToken(response.data.accessToken);
      if (response.data.user?.name) localStorage.setItem("ce_user_name", response.data.user.name);
      this.storeTenant(response.data.tenant);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.axiosInstance.post(
      `/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    if (response.data.accessToken) this.setToken(response.data.accessToken);
    if (response.data.user?.name) localStorage.setItem("ce_user_name", response.data.user.name);
    if (response.data.user?.preferredLanguage) localStorage.setItem("ce_lang", response.data.user.preferredLanguage);
    this.storeTenant(response.data.tenant);
    return response.data;
  }

  /** A signed-in account must never inherit the academy left behind by a previous session. */
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

  async forgotPassword(email: string) {
    const response = await this.axiosInstance.post(`/api/auth/forgot-password`, { email });
    return response.data;
  }

  async resetPassword(email: string, newPassword: string, resetCode: string) {
    const response = await this.axiosInstance.post(`/api/auth/reset-password`, { email, newPassword, resetCode });
    return response.data;
  }

  async logout() {
    try {
      const response = await this.axiosInstance.post(`/api/auth/logout`, {}, { withCredentials: true });
      this.handleLogout();
      return response.data;
    } catch (error) {
      this.handleLogout();
      throw error;
    }
  }

  /**
   * The shell, the feature flags hook and the landing page all need the profile on
   * mount; sharing the in-flight request turns three round trips into one.
   */
  async me() {
    if (!mePromise) {
      mePromise = this.axiosInstance
        .get(`/api/auth/me`)
        .then((response) => response.data)
        .finally(() => {
          mePromise = null;
        });
    }
    return mePromise;
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string {
    return readToken();
  }

  decoded(token: string): DecodedToken {
    return jwtDecode(token);
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return normalizeRole(this.decoded(token)?.role || null);
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

  async updateProfile(payload: { name?: string; phone_number?: string; gradeLevel?: string }) {
    const response = await this.axiosInstance.patch("/api/auth/profile", payload);
    return response.data;
  }

  handleLogout(notifySessionExpired = false) {
    clearSession(notifySessionExpired);
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default AuthServices;
export { ROLE_DASHBOARD, normalizeRole, apiClient };
