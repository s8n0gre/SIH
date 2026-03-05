import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ReportIssue from './components/ReportIssue';
import CommunityFeed from './components/CommunityFeed';
import Messages from './components/Messages';
import Auth from './components/Auth';
import IntroPage from './components/IntroPage';
import ConnectionStatus from './components/ConnectionStatus';
import Helpline from './components/Helpline';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';

import { ThemeProvider } from './contexts/ThemeContext';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';

// Add notification system
const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${type === 'success' ? 'bg-green-600 text-white border-l-4 border-green-400' :
    type === 'warning' ? 'bg-orange-600 text-white border-l-4 border-orange-400' :
      'bg-blue-600 text-white border-l-4 border-blue-400'
    }`;
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-300' :
      type === 'warning' ? 'bg-orange-300' : 'bg-blue-300'
    }"></div>
      <span class="font-medium">${message}</span>
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(() => {
    // Restore session from localStorage on first render
    try {
      const savedUser = localStorage.getItem('civicUser');
      const savedToken = localStorage.getItem('authToken');
      if (savedUser && savedToken) {
        return JSON.parse(savedUser);
      }
    } catch {
      // Invalid JSON, treat as logged out
    }
    return null;
  });
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('introSeen'));
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
  const currentUserId = currentUser.id || currentUser._id;
  const userRole = localStorage.getItem('userRole') || currentUser.role || 'user';
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Toggle body class so CSS can clear all blocking backgrounds when on home
  useEffect(() => {
    if (activeTab === 'home') {
      document.body.classList.add('home-bg');
    } else {
      document.body.classList.remove('home-bg');
    }
  }, [activeTab]);

  // Handle Google OAuth callback params: ?auth_token=...&user=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token');
    const userJson = params.get('user');
    const oauthError = params.get('error');

    if (oauthError) {
      const msgs: Record<string, string> = {
        google_not_configured: 'Google login is not yet configured on this server. Please sign in with email.',
        google_denied: 'Google sign-in was cancelled.',
        google_failed: 'Google sign-in failed. Please try again.',
      };
      alert(msgs[oauthError] || 'Sign-in error: ' + oauthError);
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (authToken && userJson) {
      try {
        const userData = JSON.parse(decodeURIComponent(userJson));
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('civicUser', JSON.stringify(userData));
        localStorage.setItem('currentUser', userData.username);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        setUser(userData);
        showNotification(`Welcome, ${userData.username}! 🇮🇳`, 'success');
      } catch {
        // Bad token, ignore
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const tabs = ['home', 'feed'];

  const navigateToTab = (direction: 'left' | 'right') => {
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex;

    if (direction === 'left') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    } else {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    }

    setActiveTab(tabs[newIndex]);
  };

  useSwipeNavigation({
    onSwipeLeft: () => navigateToTab('left'),
    onSwipeRight: () => navigateToTab('right'),
    threshold: 100
  });

  useEffect(() => {
    // If intro just finished and no session exists, stay on login screen
    if (!showIntro && !user) {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('civicUser');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('civicUser');
          localStorage.removeItem('authToken');
        }
      }
    }
  }, [showIntro]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    showNotification(`Welcome back, ${userData.username}`, 'success');
  };

  const handleIntroComplete = () => {
    localStorage.setItem('introSeen', 'true');
    setShowIntro(false);
    // Do NOT clear auth tokens here — preserve any existing session
  };

  const handleLogout = () => {
    localStorage.removeItem('civicUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setActiveTab('home');
    showNotification('Session ended successfully', 'info');
  };

  if (showIntro) {
    return <IntroPage onContinue={handleIntroComplete} />;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Poll for unread chat messages
  useEffect(() => {
    if (!currentUserId || showChat) {
      if (showChat) setUnreadChatCount(0);
      return;
    }

    const checkUnread = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/unread/${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          setUnreadChatCount(data.count || 0);
        }
      } catch (e) {
        // ignore offline
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [currentUserId, showChat]);

  const isProfileRoute = currentHash.startsWith('#/profile/');
  const profileId = isProfileRoute ? currentHash.replace('#/profile/', '') : null;

  if (isProfileRoute && profileId) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-6 sm:pb-0">
          <ProfilePage
            userId={profileId}
            onBack={() => { window.location.hash = ''; }}
            currentUser={user}
            onLogout={handleLogout}
          />
        </div>
      </ThemeProvider>
    );
  }

  // Admin Route Protection
  const isAdminRoute = currentHash.startsWith('#/admin');

  if (isAdminRoute) {
    if (userRole === 'sys_admin' || userRole === 'department_admin') {
      return (
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Minimal Header for Admin */}
            <header className="bg-gradient-to-r from-orange-600 via-white to-green-600 dark:from-orange-700 dark:via-gray-800 dark:to-green-700 shadow-lg border-b-4 border-orange-500 dark:border-orange-600">
              <div className="bg-white dark:bg-gray-800 bg-opacity-95 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-800 dark:text-white font-bold text-xl">
                  Admin Control Panel
                </div>
                <button
                  onClick={() => { window.location.hash = ''; }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Back to App
                </button>
              </div>
            </header>
            <main>
              <AdminDashboard />
            </main>
          </div>
        </ThemeProvider>
      );
    } else {
      // Redirect non-admins to home
      window.location.hash = '';
      return null;
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} onReport={() => setShowReportModal(true)} />;
      case 'report':
        return <ReportIssue />;
      case 'feed':
        return <CommunityFeed />;
      case 'helpline':
        return <Helpline />;
      default:
        return <HomePage setActiveTab={setActiveTab} onReport={() => setShowReportModal(true)} />;
    }
  };

  return (
    <ThemeProvider>
      <div className={`min-h-screen transition-colors duration-300 ${activeTab === 'home' ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-900'}`}>
        <div className={`${showReportModal ? 'blur-sm pointer-events-none' : ''} transition-all duration-300`}>
          <Header activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

          {/* Quick Report Button */}
          <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold">Report</span>
            </button>
          </div>

          {/* Floating Chat Button — LinkedIn style */}
          <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">

            {/* Chat popup panel */}
            {showChat && (
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                style={{ width: 'min(420px, calc(100vw - 2rem))', height: '80vh', maxHeight: '680px' }}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                    </svg>
                    <span className="font-semibold">Community Chat</span>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {/* Messages panel body — fills remaining height */}
                <div className="flex-1 overflow-hidden">
                  <Messages />
                </div>
              </div>
            )}

            {/* Floating trigger button */}
            <button
              onClick={() => setShowChat(prev => !prev)}
              className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
              </svg>
              {/* Unread dot */}
              {unreadChatCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-40 transition-colors duration-300 safe-area-inset-bottom">
            <div className="flex justify-around py-2 px-2">

              {/* Combined Home + Help toggle */}
              <button
                onClick={() =>
                  setActiveTab(activeTab === 'helpline' ? 'home' : activeTab === 'home' ? 'helpline' : 'home')
                }
                className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${activeTab === 'home'
                  ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 transform scale-105'
                  : activeTab === 'helpline' ? 'text-purple-600 bg-gray-100 dark:bg-gray-700 transform scale-105'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {/* Indicator circle with dual-color dots to hint at two views */}
                <div className={`relative w-5 h-5 rounded-full border-2 mb-1 ${activeTab === 'home' || activeTab === 'helpline'
                  ? 'border-current bg-current bg-opacity-20'
                  : 'border-gray-300 dark:border-gray-600'
                  }`}>
                  {/* Two tiny dots inside hinting at dual content */}
                  <span className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full bg-blue-500 opacity-80" />
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-purple-500 opacity-80" />
                </div>

                {/* Primary label */}
                <span className="text-xs font-medium leading-none">
                  {activeTab === 'helpline' ? 'Help' : 'Home'}
                </span>

                {/* Hint at the hidden view */}
                <span className={`text-[9px] leading-none mt-0.5 ${activeTab === 'helpline' ? 'text-blue-400' : 'text-purple-400'
                  }`}>
                  {activeTab === 'helpline' ? '↑ Home' : '↑ Help'}
                </span>

                {(activeTab === 'home' || activeTab === 'helpline') && (
                  <div className="w-2 h-0.5 bg-current rounded-full mt-0.5" />
                )}
              </button>

              {/* Feed only — Chat moved to floating button */}
              {[{ id: 'feed', label: 'Feed', color: 'text-green-600' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${activeTab === tab.id
                    ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 transform scale-105'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mb-1 ${activeTab === tab.id ? 'border-current bg-current bg-opacity-20' : 'border-gray-300 dark:border-gray-600'}`} />
                  <span className="text-xs font-medium truncate">{tab.label}</span>
                  {activeTab === tab.id && <div className="w-2 h-0.5 bg-current rounded-full mt-1" />}
                </button>
              ))}

            </div>
          </div>

          <main className="pb-16 sm:pb-20">
            {renderContent()}
          </main>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto modal-mobile">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Report an Issue</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-2 sm:p-4">
                <ReportIssue />
              </div>
            </div>
          </div>
        )}


      </div>
    </ThemeProvider>
  );
}

export default App;