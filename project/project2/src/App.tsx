import React, { useState } from 'react';
import { AppProvider } from './store/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Auth from './components/Auth';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ReportIssue from './components/ReportIssue';
import MapView from './components/MapView';
import Emergency from './components/Emergency';
import Dashboard from './components/Dashboard';
import ReportModal from './components/ReportModal';
import ProfileModal from './components/ProfileModal';
import FloatingButton from './components/FloatingButton';
import MiniMap from './components/MiniMap';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') !== null;
  });
  const [activeTab, setActiveTab] = useState('home');

  const handleViewOnMap = (reportId: string) => {
    setActiveTab('map');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <HomePage onViewOnMap={handleViewOnMap} />
            <MiniMap />
          </>
        );
      case 'report':
        return <ReportIssue />;
      case 'map':
        return <MapView />;
      case 'emergency':
        return <Emergency />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <>
            <HomePage onViewOnMap={handleViewOnMap} />
            <MiniMap />
          </>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Auth onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
          <main>
            {renderContent()}
          </main>
          <FloatingButton />
          <ReportModal />
          <ProfileModal />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;