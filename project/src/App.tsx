import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ReportIssue from './components/ReportIssue';
import MapView from './components/MapView';
import CommunityFeed from './components/CommunityFeed';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import LiveFeed from './components/LiveFeed';
import Auth from './components/Auth';
import ConnectionStatus from './components/ConnectionStatus';
import DatabaseViewer from './components/DatabaseViewer';
import DataStats from './components/DataStats';
import Helpline from './components/Helpline';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('civicUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const handleLogin = (userData: any) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('civicUser');
    setUser(null);
    setActiveTab('home');
  };
  
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'report':
        return <ReportIssue />;
      case 'map':
        return <MapView />;

      case 'dashboard':
        return <Dashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'feed':
        return <CommunityFeed />;
      case 'live':
        return <LiveFeed />;
      case 'database':
        return <DatabaseViewer />;
      case 'stats':
        return <DataStats />;
      case 'helpline':
        return <Helpline />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;