import React, { useState, useEffect } from 'react';
import { Menu, X, MapPin, AlertTriangle, FileText, Users, BarChart3, Database, TrendingUp, Phone, Shield, Crown } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { i18n } from '../services/i18n';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'user';
  });
  const [showElevateModal, setShowElevateModal] = useState(false);
  const [elevatePassword, setElevatePassword] = useState('');

  const handleElevateRole = () => {
    if (elevatePassword === 'admin123' || elevatePassword === 'sysadmin') {
      setUserRole('sys_admin');
      localStorage.setItem('userRole', 'sys_admin');
      setShowElevateModal(false);
      setElevatePassword('');
      alert('Role elevated to System Administrator! You can now delete community posts.');
    } else {
      alert('Invalid password. Access denied.');
      setElevatePassword('');
    }
  };
  
  useEffect(() => {
    i18n.initializeLanguage();
  }, []);

  const navItems = [
    { id: 'home', label: i18n.t('home'), icon: FileText },
    { id: 'report', label: i18n.t('reportIssue'), icon: FileText },
    { id: 'map', label: i18n.t('mapView'), icon: MapPin },
    { id: 'feed', label: 'Community', icon: Users },
    { id: 'helpline', label: 'Helpline', icon: Phone },

    { id: 'dashboard', label: i18n.t('myReports'), icon: Users },
    { id: 'admin', label: i18n.t('adminDashboard'), icon: BarChart3 },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{i18n.t('appName')}</h1>
              <p className="text-xs text-gray-500">{i18n.t('appSubtitle')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            {user && (
              <div className="flex items-center space-x-3">
                {userRole === 'sys_admin' && (
                  <button
                    onClick={() => {
                      if (confirm('Exit system administrator mode?')) {
                        setUserRole('user');
                        localStorage.setItem('userRole', 'user');
                        alert('Exited admin mode. You are now a regular user.');
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors cursor-pointer"
                    title="Click to exit admin mode"
                  >
                    <Crown className="w-3 h-3" />
                    SYS ADMIN (Click to Exit)
                  </button>
                )}
                {userRole !== 'sys_admin' && (
                  <button
                    onClick={() => setShowElevateModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors"
                  >
                    <Shield className="w-3 h-3" />
                    Elevate Role
                  </button>
                )}
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={onLogout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Elevate Role Modal */}
      {showElevateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Elevate to System Administrator</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Enter the system administrator password to gain elevated privileges including the ability to delete community posts.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={elevatePassword}
                onChange={(e) => setElevatePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter admin password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleElevateRole();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleElevateRole}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Elevate Role
              </button>
              <button
                onClick={() => {
                  setShowElevateModal(false);
                  setElevatePassword('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;