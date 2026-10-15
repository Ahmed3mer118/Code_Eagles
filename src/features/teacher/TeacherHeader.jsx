// src/features/teacher/TeacherHeader.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useI18n } from '../../shared/i18n';
import teacherApi from '../../shared/api/teacherApi';
import {
  Menu, Bell, LogOut, User, Settings, Globe, X,
} from 'lucide-react';

export default function TeacherHeader({ onMenuClick }) {
  const { user, activeTenant, logout } = useAuth();
  const { t, lang, toggleLang, dir } = useI18n();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch unread count every 60s
  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        const res = await teacherApi.getUnreadCount();
        if (mounted) setUnreadCount(res?.data?.count ?? res?.data ?? 0);
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const openNotifications = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen) {
      setLoadingNotifs(true);
      try {
        const res = await teacherApi.getNotifications({ limit: 10 });
        setNotifications(res?.data?.items ?? res?.data ?? []);
      } catch { /* silent */ }
      setLoadingNotifs(false);
    }
  };

  const markAllRead = async () => {
    try {
      await teacherApi.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h1 className="font-semibold text-gray-800 dark:text-white">
            {activeTenant?.tenantName || activeTenant?.name || t('teacher.layout.title')}
          </h1>
        </div>
      </div>

      {/* Right: Language, Notifications, User */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <button
          onClick={toggleLang}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
          title={lang === 'ar' ? 'English' : 'العربية'}
        >
          <Globe size={18} />
          <span className="text-xs font-medium uppercase">{lang}</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={openNotifications}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 end-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50`}>
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
                <span className="font-semibold text-sm">{t('teacher.notifications.title')}</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">
                    {t('teacher.notifications.markAllRead')}
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loadingNotifs ? (
                  <div className="p-4 text-center text-sm text-gray-400">...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">
                    {t('teacher.notifications.empty')}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        teacherApi.markNotificationRead(n.id);
                        setUnreadCount((c) => Math.max(0, c - 1));
                      }}
                      className={`w-full text-start p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {typeof n.title === 'object' ? (n.title?.[lang] || n.title?.ar || n.title?.en) : n.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {typeof n.body === 'object' ? (n.body?.[lang] || n.body?.ar || n.body?.en) : n.body}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen((v) => !v)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || 'T'}
              </div>
            )}
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
              {user?.name}
            </span>
          </button>

          {userOpen && (
            <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50`}>
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/teacher/settings'); setUserOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <User size={16} /> {t('teacher.user.profile')}
                </button>
                <button
                  onClick={() => { navigate('/teacher/settings'); setUserOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Settings size={16} /> {t('teacher.user.settings')}
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} /> {t('teacher.user.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
