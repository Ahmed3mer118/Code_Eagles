import AuthServices from '../classes/Auth';
import InstructorService from '../classes/InstructorService';
import UserService from '../classes/UserService';
import AdminService from '../classes/AdminService';

/**
 * Factory for creating services with proper token management
 * This ensures all services use the same enhanced axios instance
 */

class ServiceFactory {
  constructor() {
    this.authService = new AuthServices();
    this.token = this.authService.getToken();
  }

  /**
   * Get the auth service instance
   * @returns {AuthServices}
   */
  getAuthService() {
    return this.authService;
  }

  /**
   * Get the instructor service instance
   * @returns {InstructorService}
   */
  getInstructorService() {
    return new InstructorService(this.token);
  }

  /**
   * Get the user service instance
   * @returns {UserService}
   */
  getUserService() {
    return new UserService(this.token);
  }

  /**
   * Get the admin service instance
   * @returns {AdminService}
   */
  getAdminService() {
    return new AdminService(this.token);
  }

  /**
   * Update token across all services
   * @param {string} newToken - New access token
   */
  updateToken(newToken) {
    this.token = newToken;
    this.authService.setToken(newToken);
  }

  /**
   * Get current token
   * @returns {string|null}
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if token is expired
   * @returns {boolean}
   */
  isTokenExpired() {
    return this.authService.isTokenExpired();
  }

  /**
   * Refresh token and update all services
   * @returns {Promise<string|null>}
   */
  async refreshToken() {
    // تحقق من وجود token قبل محاولة التجديد
    if (!this.getToken()) {
      console.log("⚠️ لا يوجد token للتجديد في ServiceFactory");
      return null;
    }

    const newToken = await this.authService.refreshToken();
    if (newToken) {
      this.updateToken(newToken);
    }
    return newToken;
  }

  /**
   * Logout and clear all tokens
   */
  logout() {
    this.authService.handleLogout();
    this.token = null;
  }

  /**
   * Get user role from token
   * @returns {string|null}
   */
  getUserRole() {
    return this.authService.getRole();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    return token && !this.isTokenExpired();
  }

  /**
   * Force logout and redirect to login
   * @param {string} redirectUrl - URL to redirect to (default: /auth/login)
   */
  forceLogout(redirectUrl = '/auth/login') {
    console.log("🚪 تسجيل الخروج...");
    this.logout();
    
    // Clear any remaining data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  }
}

// Create singleton instance
const serviceFactory = new ServiceFactory();

export default serviceFactory;

// Export individual factory methods for convenience
export const {
  getAuthService,
  getInstructorService,
  getUserService,
  getAdminService,
  updateToken,
  getToken,
  isTokenExpired,
  refreshToken,
  logout,
  getUserRole,
  isAuthenticated,
  forceLogout
} = serviceFactory;
