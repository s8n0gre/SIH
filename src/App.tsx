import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ReportIssue from './components/ReportIssue';
import CommunityFeed from './components/CommunityFeed';
import Auth from './components/Auth';
import Helpline from './components/Helpline';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';

import { ThemeProvider } from './contexts/ThemeContext';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';

// Icons for bottom nav
const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
  const notification = document.createElement('div');
  const colors = { success: '#10b981', info: '#6366f1', warning: '#f59e0b' };
  notification.style.cssText = `
    position: fixed; top: 16px; right: 16px; z-index: 99999;
    display: flex; align-items: center; gap: 10px;
    background: var(--bg-panel); border: 1px solid var(--border-strong);
    padding: 12px 16px; border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transform: translateX(0); transition: transform 0.3s ease, opacity 0.3s ease;
    font-family: Inter, sans-serif; font-size: 14px; font-weight: 500;
    color: var(--text-primary);
  `;
  notification.innerHTML = `
    <div style="width:8px;height:8px;border-radius:50%;background:${colors[type]};flex-shrink:0"></div>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.transform = 'translateX(120%)';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
};

function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [user, setUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem('civicUser');
      const savedToken = localStorage.getItem('authToken');
      if (savedUser && savedToken) return JSON.parse(savedUser);
    } catch { /* invalid */ }
    return null;
  });
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('introSeen'));
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
  const currentUserId = currentUser.id || currentUser._id;
  const userRole = localStorage.getItem('userRole') || currentUser.role || 'user';

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('home-bg', activeTab === 'home');
  }, [activeTab]);

  // Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token');
    const userJson = params.get('user');
    const oauthError = params.get('error');
    if (oauthError) {
      const msgs: Record<string, string> = {
        google_not_configured: 'Google login is not yet configured. Please sign in with email.',
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
        window.history.replaceState({}, '', window.location.pathname);
        setUser(userData);
        showNotification(`Welcome, ${userData.username}! 🇮🇳`, 'success');
      } catch { window.history.replaceState({}, '', window.location.pathname); }
    }
  }, []);

  const tabs = ['home', 'feed'];
  const navigateToTab = (direction: 'left' | 'right') => {
    const idx = tabs.indexOf(activeTab);
    setActiveTab(direction === 'left' ? (tabs[idx > 0 ? idx - 1 : tabs.length - 1]) : (tabs[idx < tabs.length - 1 ? idx + 1 : 0]));
  };

  useSwipeNavigation({ onSwipeLeft: () => navigateToTab('left'), onSwipeRight: () => navigateToTab('right'), threshold: 100 });

  useEffect(() => {
    if (!showIntro && !user) {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('civicUser');
      if (token && savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem('civicUser'); localStorage.removeItem('authToken'); }
      }
    }
  }, [showIntro]);

  const handleLogin = (userData: any) => { setUser(userData); showNotification(`Welcome back, ${userData.username}`, 'success'); };
  const handleIntroComplete = () => { localStorage.setItem('introSeen', 'true'); setShowIntro(false); };
  const handleLogout = () => {
    localStorage.removeItem('civicUser'); localStorage.removeItem('authToken'); localStorage.removeItem('currentUser');
    setUser(null); setActiveTab('feed'); showNotification('Session ended', 'info');
  };

  if (showIntro) return (
    <ThemeProvider>
      <HomePage
        setActiveTab={handleIntroComplete}
        onReport={handleIntroComplete}
      />
    </ThemeProvider>
  );
  if (!user) return <Auth onLogin={handleLogin} />;



  const isProfileRoute = currentHash.startsWith('#/profile/');
  const profileId = isProfileRoute ? currentHash.replace('#/profile/', '') : null;

  if (isProfileRoute && profileId) {
    return (
      <ThemeProvider>
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
          <ProfilePage userId={profileId} onBack={() => { window.location.hash = ''; }} currentUser={user} onLogout={handleLogout} />
        </div>
      </ThemeProvider>
    );
  }

  const isAdminRoute = currentHash.startsWith('#/admin');
  if (isAdminRoute) {
    if (userRole === 'sys_admin' || userRole === 'department_admin') {
      return (
        <ThemeProvider>
          <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
            <header className="sticky top-0 z-50" style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(24px)' }}>
              <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-blue-subtle)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-blue)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Admin Control Panel</span>
                </div>
                <button onClick={() => { window.location.hash = ''; }} className="btn-secondary text-xs" style={{ padding: '6px 14px' }}>← Back to App</button>
              </div>
            </header>
            <main><AdminDashboard /></main>
          </div>
        </ThemeProvider>
      );
    } else { window.location.hash = ''; return null; }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'report': return <ReportIssue />;
      case 'feed': return <CommunityFeed />;
      case 'helpline': return <Helpline />;
      case 'admin': return <AdminDashboard />;
      default: return <CommunityFeed />;
    }
  };


  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300" style={{ background: activeTab === 'home' ? 'var(--bg-base)' : 'var(--bg-base)' }}>
        <div className={`${showReportModal ? 'blur-sm pointer-events-none' : ''} transition-all duration-300`}>
          <Header activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

          {/* Report FAB */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={() => setShowReportModal(true)}
              className="btn-primary fab-pulse"
              style={{ padding: '11px 22px', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Report Issue
            </button>
          </div>




          <main className="pb-6">{renderContent()}</main>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
            <div className="rounded-2xl sm:rounded-2xl rounded-t-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-fade-up" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <div className="sticky top-0 flex items-center justify-between px-5 py-4" style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Report an Issue</h2>
                <button onClick={() => setShowReportModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4"><ReportIssue /></div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;