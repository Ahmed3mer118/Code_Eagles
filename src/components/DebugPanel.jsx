import React, { useState } from 'react';
import { 
  debugRefreshTokenIssues, 
  testRefreshToken, 
  debugAuthentication,
  debugLoginProcess,
  debugCookieSettings,
  checkAuthenticationState
} from '../utils/tokenUtils';
import serviceFactory from '../utils/serviceFactory';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = async () => {
    setIsLoading(true);
    const token = serviceFactory.getToken();
    
    // Run all debug functions
    const issues = debugRefreshTokenIssues(token);
    debugAuthentication(token);
    
    // Test refresh token
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      await testRefreshToken(apiUrl);
    }
    
    setDebugInfo({
      token: token ? 'Present' : 'Missing',
      issues: issues,
      timestamp: new Date().toLocaleString()
    });
    
    setIsLoading(false);
  };

  const forceLogout = () => {
    serviceFactory.forceLogout();
  };

  const refreshToken = async () => {
    setIsLoading(true);
    const result = await serviceFactory.refreshToken();
    setDebugInfo(prev => ({
      ...prev,
      refreshResult: result ? 'Success' : 'Failed',
      refreshTimestamp: new Date().toLocaleString()
    }));
    setIsLoading(false);
  };

  const checkAuthState = () => {
    const state = checkAuthenticationState();
    setDebugInfo(prev => ({
      ...prev,
      authState: state,
      authCheckTimestamp: new Date().toLocaleString()
    }));
  };

  const debugCookies = () => {
    debugCookieSettings();
    setDebugInfo(prev => ({
      ...prev,
      cookieDebugTimestamp: new Date().toLocaleString()
    }));
  };

  const debugLogin = async () => {
    setIsLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      await debugLoginProcess(apiUrl);
    }
    setIsLoading(false);
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Debug Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        title="Debug Panel"
      >
        🐛
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Debug Actions */}
          <div className="space-y-2 mb-4">
            <button
              onClick={runDebug}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm disabled:opacity-50"
            >
              {isLoading ? 'Running...' : '🔍 Run Debug'}
            </button>
            
            <button
              onClick={refreshToken}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : '🔄 Test Refresh Token'}
            </button>

            <button
              onClick={checkAuthState}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-sm"
            >
              🔐 Check Auth State
            </button>

            <button
              onClick={debugCookies}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded text-sm"
            >
              🍪 Debug Cookies
            </button>

            <button
              onClick={debugLogin}
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded text-sm disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : '🔐 Test Login'}
            </button>
            
            <button
              onClick={forceLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
            >
              🚪 Force Logout
            </button>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Debug Results:</h4>
              <div className="text-xs space-y-1">
                <div><strong>Token:</strong> {debugInfo.token}</div>
                <div><strong>Issues Found:</strong> {debugInfo.issues?.length || 0}</div>
                <div><strong>Last Debug:</strong> {debugInfo.timestamp}</div>
                {debugInfo.refreshResult && (
                  <div><strong>Refresh Test:</strong> {debugInfo.refreshResult}</div>
                )}
                {debugInfo.refreshTimestamp && (
                  <div><strong>Refresh Time:</strong> {debugInfo.refreshTimestamp}</div>
                )}
                {debugInfo.authState && (
                  <div><strong>Auth State:</strong> {debugInfo.authState.needsLogin ? 'Needs Login' : 'OK'}</div>
                )}
                {debugInfo.authCheckTimestamp && (
                  <div><strong>Auth Check:</strong> {debugInfo.authCheckTimestamp}</div>
                )}
                {debugInfo.cookieDebugTimestamp && (
                  <div><strong>Cookie Debug:</strong> {debugInfo.cookieDebugTimestamp}</div>
                )}
              </div>
              
              {debugInfo.issues && debugInfo.issues.length > 0 && (
                <div className="mt-2">
                  <strong className="text-red-600">Issues:</strong>
                  <ul className="text-xs text-red-600 mt-1">
                    {debugInfo.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {debugInfo.authState && (
                <div className="mt-2">
                  <strong className="text-blue-600">Auth State:</strong>
                  <div className="text-xs text-blue-600 mt-1">
                    <div>Access Token: {debugInfo.authState.hasAccessToken ? '✅' : '❌'}</div>
                    <div>Cookies: {debugInfo.authState.hasCookies ? '✅' : '❌'}</div>
                    <div>Cookies Enabled: {debugInfo.authState.cookiesEnabled ? '✅' : '❌'}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Instructions:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>1. "Run Debug" - فحص شامل</div>
              <div>2. "Test Refresh Token" - اختبار الـ refresh</div>
              <div>3. "Check Auth State" - فحص حالة المصادقة</div>
              <div>4. "Debug Cookies" - فحص إعدادات الـ cookies</div>
              <div>5. "Test Login" - اختبار نقطة نهاية الدخول</div>
              <div>6. "Force Logout" - إعادة تعيين كاملة</div>
              <div>7. تحقق من Console للتفاصيل</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
