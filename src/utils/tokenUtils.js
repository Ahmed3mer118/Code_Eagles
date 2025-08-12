import { jwtDecode } from "jwt-decode";

/**
 * Utility functions for token management and debugging
 */

/**
 * Check if a token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - true if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const decodedToken = jwtDecode(token);
    return new Date(decodedToken.exp * 1000);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Get time until token expires
 * @param {string} token - JWT token
 * @returns {number|null} - Time in milliseconds until expiration, or null if invalid
 */
export const getTimeUntilExpiration = (token) => {
  if (!token) return null;
  
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiration = (decodedToken.exp - currentTime) * 1000;
    return Math.max(0, timeUntilExpiration);
  } catch (error) {
    console.error("Error calculating time until expiration:", error);
    return null;
  }
};

/**
 * Format time until expiration for display
 * @param {string} token - JWT token
 * @returns {string} - Formatted string showing time until expiration
 */
export const formatTimeUntilExpiration = (token) => {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  
  if (timeUntilExpiration === null) {
    return "Invalid token";
  }
  
  if (timeUntilExpiration === 0) {
    return "Expired";
  }
  
  const minutes = Math.floor(timeUntilExpiration / (1000 * 60));
  const seconds = Math.floor((timeUntilExpiration % (1000 * 60)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Get token payload without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Token payload or null if invalid
 */
export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token will expire soon (within 5 minutes)
 * @param {string} token - JWT token
 * @param {number} thresholdMinutes - Minutes before expiration to consider "soon" (default: 5)
 * @returns {boolean} - true if expiring soon
 */
export const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  
  if (timeUntilExpiration === null) return true;
  
  const thresholdMs = thresholdMinutes * 60 * 1000;
  return timeUntilExpiration <= thresholdMs;
};

/**
 * Debug function to log token information
 * @param {string} token - JWT token
 * @param {string} label - Label for the log
 */
export const debugToken = (token, label = "Token") => {
  console.group(`${label} Debug Info`);
  
  if (!token) {
    console.log("No token provided");
    console.groupEnd();
    return;
  }
  
  try {
    const payload = jwtDecode(token);
    const expiration = getTokenExpiration(token);
    const timeUntilExpiration = getTimeUntilExpiration(token);
    const isExpired = isTokenExpired(token);
    const isExpiringSoon = isTokenExpiringSoon(token);
    
    console.log("Token exists:", !!token);
    console.log("Token length:", token.length);
    console.log("Payload:", payload);
    console.log("Expiration:", expiration);
    console.log("Time until expiration:", formatTimeUntilExpiration(token));
    console.log("Is expired:", isExpired);
    console.log("Is expiring soon:", isExpiringSoon);
    
    if (payload.role) {
      console.log("User role:", payload.role);
    }
    
    if (payload.email) {
      console.log("User email:", payload.email);
    }
    
  } catch (error) {
    console.error("Error analyzing token:", error);
  }
  
  console.groupEnd();
};

/**
 * Check if cookies are enabled and accessible
 * @returns {boolean} - true if cookies are enabled
 */
export const areCookiesEnabled = () => {
  try {
    // Try to set a test cookie
    document.cookie = "testCookie=1; path=/";
    const hasCookie = document.cookie.indexOf("testCookie=") !== -1;
    
    // Clean up test cookie
    document.cookie = "testCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    
    return hasCookie;
  } catch (error) {
    console.error("Error checking cookies:", error);
    return false;
  }
};

/**
 * Debug function to log cookie information
 */
export const debugCookies = () => {
  console.group("Cookie Debug Info");
  
  console.log("Cookies enabled:", areCookiesEnabled());
  console.log("All cookies:", document.cookie);
  
  // Check for specific cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  console.log("Parsed cookies:", cookies);
  
  // Note: httpOnly cookies won't be visible here
  console.log("Note: httpOnly cookies (like refresh tokens) are not visible in JavaScript");
  
  console.groupEnd();
};

/**
 * Comprehensive authentication debug function
 * @param {string} token - Access token
 */
export const debugAuthentication = (token) => {
  console.group("Authentication Debug");
  
  debugToken(token, "Access Token");
  debugCookies();
  
  // Check localStorage
  const storedToken = localStorage.getItem("token");
  console.log("Stored token in localStorage:", !!storedToken);
  
  if (storedToken && storedToken !== token) {
    console.warn("Stored token differs from provided token");
  }
  
  console.groupEnd();
};

/**
 * Debug refresh token issues specifically
 * @param {string} token - Current access token
 */
export const debugRefreshTokenIssues = (token) => {
  console.group("🔍 Refresh Token Debug");
  
  // Check current token status
  console.log("Current access token exists:", !!token);
  if (token) {
    console.log("Current token expires in:", formatTimeUntilExpiration(token));
  }
  
  // Check cookies
  console.log("Cookies enabled:", areCookiesEnabled());
  console.log("All visible cookies:", document.cookie);
  
  // Check if we're on the right domain
  console.log("Current domain:", window.location.hostname);
  console.log("Current protocol:", window.location.protocol);
  
  // Check if we're in an iframe (which can cause cookie issues)
  console.log("In iframe:", window !== window.top);
  
  // Check browser storage
  console.log("localStorage available:", typeof localStorage !== 'undefined');
  console.log("sessionStorage available:", typeof sessionStorage !== 'undefined');
  
  // Check for common issues
  const issues = [];
  
  if (!areCookiesEnabled()) {
    issues.push("❌ Cookies are disabled");
  }
  
  if (document.cookie.length === 0) {
    issues.push("❌ No cookies found (including httpOnly ones)");
    console.warn("🔍 This usually means:");
    console.warn("1. User never logged in successfully");
    console.warn("2. Login response didn't set refresh token cookie");
    console.warn("3. Cookie settings are too restrictive");
    console.warn("4. Domain/protocol mismatch");
  }
  
  if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    issues.push("⚠️ Using HTTP instead of HTTPS (cookies might not work)");
  }
  
  if (window !== window.top) {
    issues.push("⚠️ Running in iframe (cookies might be blocked)");
  }
  
  // Check if user is logged in
  const storedToken = localStorage.getItem('token');
  if (!storedToken) {
    issues.push("❌ No access token in localStorage - user not logged in");
  }
  
  if (issues.length > 0) {
    console.error("Potential issues found:");
    issues.forEach(issue => console.error(issue));
  } else {
    console.log("✅ No obvious issues detected");
  }
  
  console.groupEnd();
  return issues;
};

/**
 * Test refresh token functionality
 * @param {string} apiUrl - API base URL
 */
export const testRefreshToken = async (apiUrl) => {
  console.group("🧪 Testing Refresh Token");
  
  try {
    console.log("Making test request to refresh token endpoint...");
    
    const response = await fetch(`${apiUrl}/api/users/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Refresh token test successful",);
    } else {
      const errorData = await response.text();
      console.error("❌ Refresh token test failed:", errorData);
    }
    
  } catch (error) {
    console.error("❌ Network error during refresh token test:", error);
  }
  
  console.groupEnd();
};

/**
 * Check if user should be redirected to login
 * @param {string} token - Current access token
 * @returns {boolean} - true if should redirect to login
 */
export const shouldRedirectToLogin = (token) => {
  // No token at all
  if (!token) {
    console.log("No access token found - should redirect to login");
    return true;
  }
  
  // Token is expired
  if (isTokenExpired(token)) {
    console.log("Access token is expired - should redirect to login");
    return true;
  }
  
  // Token is expiring very soon (less than 1 minute)
  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (timeUntilExpiration !== null && timeUntilExpiration < 60000) {
    console.log("Access token expires very soon - should redirect to login");
    return true;
  }
  
  return false;
};

/**
 * Debug login process and cookie settings
 * @param {string} apiUrl - API base URL
 */
export const debugLoginProcess = async (apiUrl) => {
  console.group("🔐 Login Process Debug");
  
  try {
    console.log("Testing login endpoint...");
    
    // Test login endpoint (without credentials)
    const response = await fetch(`${apiUrl}/api/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log("Login endpoint response status:", response.status);
    console.log("Login endpoint response headers:", Object.fromEntries(response.headers.entries()));
    
    // Check if Set-Cookie header is present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log("✅ Set-Cookie header found:", setCookieHeader);
    } else {
      console.error("❌ No Set-Cookie header in login response");
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log("Login response data:", data);
    } else {
      const errorData = await response.text();
      console.log("Login error response:", errorData);
    }
    
  } catch (error) {
    console.error("❌ Network error during login test:", error);
  }
  
  console.groupEnd();
};

/**
 * Check browser cookie settings and capabilities
 */
export const debugCookieSettings = () => {
  console.group("🍪 Cookie Settings Debug");
  
  // Check if we can set cookies
  try {
    // Test setting a regular cookie
    document.cookie = "testCookie=value; path=/";
    const hasTestCookie = document.cookie.indexOf("testCookie=") !== -1;
    console.log("Can set regular cookies:", hasTestCookie);
    
    // Clean up
    document.cookie = "testCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    
    // Test setting a secure cookie (if on HTTPS)
    if (window.location.protocol === 'https:') {
      document.cookie = "secureTestCookie=value; path=/; secure";
      const hasSecureCookie = document.cookie.indexOf("secureTestCookie=") !== -1;
      console.log("Can set secure cookies:", hasSecureCookie);
      
      // Clean up
      document.cookie = "secureTestCookie=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure";
    }
    
  } catch (error) {
    console.error("Error testing cookie capabilities:", error);
  }
  
  // Check browser settings
  console.log("Current URL:", window.location.href);
  console.log("Protocol:", window.location.protocol);
  console.log("Hostname:", window.location.hostname);
  console.log("Port:", window.location.port);
  
  // Check if we're in a secure context
  console.log("Secure context:", window.isSecureContext);
  
  // Check for common cookie blockers
  const userAgent = navigator.userAgent;
  console.log("User Agent:", userAgent);
  
  if (userAgent.includes('Chrome')) {
    console.log("Browser: Chrome");
  } else if (userAgent.includes('Firefox')) {
    console.log("Browser: Firefox");
  } else if (userAgent.includes('Safari')) {
    console.log("Browser: Safari");
  } else if (userAgent.includes('Edge')) {
    console.log("Browser: Edge");
  }
  
  console.groupEnd();
};

/**
 * Comprehensive authentication state check
 */
export const checkAuthenticationState = () => {
  console.group("🔍 Authentication State Check");
  
  // Check localStorage
  const storedToken = localStorage.getItem('token');
  console.log("Access token in localStorage:", !!storedToken);
  
  if (storedToken) {
    console.log("Token expires in:", formatTimeUntilExpiration(storedToken));
    console.log("Token is expired:", isTokenExpired(storedToken));
  }
  
  // Check cookies
  console.log("All cookies:", document.cookie);
  console.log("Cookies enabled:", areCookiesEnabled());
  
  // Check if we have any authentication
  const hasAccessToken = !!storedToken;
  const hasCookies = document.cookie.length > 0;
  const cookiesEnabled = areCookiesEnabled();
  
  console.log("Authentication Summary:");
  console.log("- Has access token:", hasAccessToken);
  console.log("- Has cookies:", hasCookies);
  console.log("- Cookies enabled:", cookiesEnabled);
  
  if (!hasAccessToken && !hasCookies) {
    console.error("❌ No authentication found - user needs to login");
  } else if (hasAccessToken && !hasCookies) {
    console.warn("⚠️ Has access token but no cookies - refresh token missing");
  } else if (!hasAccessToken && hasCookies) {
    console.warn("⚠️ Has cookies but no access token - unusual state");
  } else {
    console.log("✅ Authentication appears to be in order");
  }
  
  console.groupEnd();
  
  return {
    hasAccessToken,
    hasCookies,
    cookiesEnabled,
    needsLogin: !hasAccessToken && !hasCookies
  };
};

export default {
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  formatTimeUntilExpiration,
  getTokenPayload,
  isTokenExpiringSoon,
  debugToken,
  areCookiesEnabled,
  debugCookies,
  debugAuthentication,
  debugRefreshTokenIssues,
  testRefreshToken,
  shouldRedirectToLogin,
  debugLoginProcess,
  debugCookieSettings,
  checkAuthenticationState
};
