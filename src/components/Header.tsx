import React, { useState, useEffect } from 'react';
import { Menu, X, MapPin, AlertTriangle, FileText, Users, BarChart3, Database, TrendingUp, Phone, Shield, Crown, User, ChevronDown, LogOut, UserCheck, Search, Hash, UserPlus, Moon, Sun, Clock } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import NotificationModal from './NotificationModal';
import NotificationBell from './NotificationBell';
import AccessibilityPanel from './AccessibilityPanel';
import { i18n } from '../services/i18n';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE } from '../config';
import { useUserLocation } from '../hooks/useUserLocation';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
  onLogout?: () => void;
}

interface ProfileDropdownProps {
  user: any;
  userRole: string;
  setUserRole: (role: string) => void;
  setShowElevateModal: (show: boolean) => void;
  onLogout: () => void;
  setActiveTab: (tab: string) => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, userRole, setUserRole, setShowElevateModal, onLogout, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [impersonateUser, setImpersonateUser] = useState('');
  const [originalUser, setOriginalUser] = useState(() => localStorage.getItem('originalUser'));
  const [users, setUsers] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ isOpen: boolean, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string }>({ isOpen: false, type: 'info', title: '', message: '' });

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleImpersonate = (username: string) => {
    if (username.trim()) {
      if (!originalUser) {
        localStorage.setItem('originalUser', user.name);
        setOriginalUser(user.name);
      }
      localStorage.setItem('currentUser', username.trim());
      setShowImpersonateModal(false);
      setImpersonateUser('');
      setIsOpen(false);
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'User Impersonation Active',
        message: `You are now impersonating ${username}. All actions will be performed as this user.`
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleStopImpersonation = () => {
    if (originalUser) {
      localStorage.setItem('currentUser', originalUser);
      localStorage.removeItem('originalUser');
      setOriginalUser(null);
      setIsOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center ring-2 ring-transparent hover:ring-blue-400 transition-all">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 max-w-[60px] truncate leading-none">
          {originalUser ? localStorage.getItem('currentUser') : user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {userRole === 'sys_admin' && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-semibold">System Administrator</span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              window.location.href = `#/profile/${user.id || user._id}`;
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">My Profile</span>
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>

          {userRole === 'sys_admin' && (
            <>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab('admin');
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Admin Dashboard</span>
              </button>

              <button
                onClick={() => {
                  fetchUsers();
                  setShowImpersonateModal(true);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600"
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-sm">Impersonate User</span>
              </button>

              {originalUser && (
                <button
                  onClick={handleStopImpersonation}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-green-600"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Stop Impersonation</span>
                </button>
              )}


            </>
          )}

          {userRole !== 'sys_admin' && (
            <button
              onClick={() => {
                setShowElevateModal(true);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Elevate Role</span>
            </button>
          )}

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}

      {showImpersonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select User to Impersonate</h3>
            <div className="space-y-2 mb-4">
              {users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleImpersonate(u.username)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">{u.username}</div>
                  <div className="text-sm text-gray-500">{u.email} • {u.role}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowImpersonateModal(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => {
          if (notification.title === 'Confirm Administrative Exit') {
            setUserRole('user');
            localStorage.setItem('userRole', 'user');
          }
          setNotification({ ...notification, isOpen: false });
        }}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
};

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const location = useUserLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('people');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendActions, setFriendActions] = useState<{ [id: string]: string }>({});
  const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
  const currentUserId = currentUser.id || currentUser._id || '';

  const searchFilters = [
    { id: 'people', label: 'People', icon: User },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'communities', label: 'Communities', icon: Users },
  ];

  const mockResults: Record<string, any[]> = {
    posts: [
      { id: 1, type: 'post', title: 'Road repair needed on MG Road', author: 'Rajesh Kumar', time: '2h ago', category: 'Roads' },
      { id: 2, type: 'post', title: 'Street light not working in Sector 5', author: 'Priya Singh', time: '4h ago', category: 'Electricity' }
    ],
    trending: [
      { id: 1, type: 'trending', title: '#RoadSafety', count: '1.2K posts', trend: 'up' },
      { id: 2, type: 'trending', title: `#Clean${location.city.replace(/\s+/g, '')}`, count: '856 posts', trend: 'up' }
    ],
    communities: [
      { id: 1, type: 'community', name: `${location.city} Municipal`, members: '12.5K', category: 'Government' },
      { id: 2, type: 'community', name: 'Public Safety', members: '8.2K', category: 'Safety' }
    ]
  };

  // Fetch real people from the API
  const searchPeople = async (q: string) => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/friends/search?userId=${currentUserId}&q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data
          .filter((u: any) => u._id !== currentUserId && u.id !== currentUserId)
          .map((u: any) => ({ ...u, type: 'person' }))
        );
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    if (activeFilter === 'people') {
      searchPeople(q);
      return;
    }
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setTimeout(() => {
      setResults(mockResults[activeFilter] || []);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (isOpen) {
      handleSearch(query);
    }
  }, [query, activeFilter, isOpen]);

  const sendRequest = async (recipientId: string) => {
    setFriendActions(p => ({ ...p, [recipientId]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: currentUserId, recipientId })
      });

      if (res.ok || res.status === 409) {
        // Find if we got a friendship ID back so we can un-friend later if needed
        const data = res.ok ? await res.json() : null;

        setResults(prev => prev.map(r =>
          r._id === recipientId
            ? { ...r, friendStatus: 'sent', friendshipId: data?._id || r.friendshipId }
            : r
        ));
      } else {
        console.error('Failed to send friend request:', await res.text());
      }
    } catch (e) {
      console.error('Error sending friend request:', e);
    } finally {
      setFriendActions(p => { const n = { ...p }; delete n[recipientId]; return n; });
    }
  };

  const acceptRequest = async (friendshipId: string, userId: string) => {
    setFriendActions(p => ({ ...p, [userId]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/api/friends/${friendshipId}/accept`, { method: 'PUT' });
      if (res.ok) {
        setResults(prev => prev.map(r => r._id === userId ? { ...r, friendStatus: 'friends' } : r));
      } else {
        console.error('Failed to accept friend request:', await res.text());
      }
    } catch (e) {
      console.error('Error accepting friend request:', e);
    } finally {
      setFriendActions(p => { const n = { ...p }; delete n[userId]; return n; });
    }
  };

  const removeConnection = async (friendshipId: string, userId: string) => {
    if (!friendshipId) return; // Cannot remove if we don't know the ID
    setFriendActions(p => ({ ...p, [userId]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/api/friends/${friendshipId}`, { method: 'DELETE' });
      if (res.ok || res.status === 404) {
        setResults(prev => prev.map(r => r._id === userId ? { ...r, friendStatus: 'none', friendshipId: null } : r));
      } else {
        console.error('Failed to remove connection:', await res.text());
      }
    } catch (e) {
      console.error('Error removing connection:', e);
    } finally {
      setFriendActions(p => { const n = { ...p }; delete n[userId]; return n; });
    }
  };

  const FriendButton = ({ person }: { person: any }) => {
    const busy = friendActions[person._id] === 'loading';
    if (person.friendStatus === 'friends') {
      return (
        <button
          onClick={() => removeConnection(person.friendshipId, person._id)}
          disabled={busy}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-red-100 hover:text-red-600 transition-colors"
          title="Remove connection"
        >
          <UserCheck className="w-3 h-3" /> Friends
        </button>
      );
    }
    if (person.friendStatus === 'sent') {
      return (
        <button disabled className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed">
          <Clock className="w-3 h-3" /> Pending
        </button>
      );
    }
    if (person.friendStatus === 'received') {
      return (
        <button
          onClick={() => acceptRequest(person.friendshipId, person._id)}
          disabled={busy}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors"
        >
          <UserCheck className="w-3 h-3" /> Accept
        </button>
      );
    }
    return (
      <button
        onClick={() => sendRequest(person._id)}
        disabled={busy}
        className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition-colors disabled:opacity-50"
      >
        <UserPlus className="w-3 h-3" /> Add
      </button>
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setIsOpen(true); if (activeFilter === 'people') searchPeople(query); }}
          placeholder="Search people, posts, communities..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
        />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 sm:max-h-[90vh] overflow-y-auto flex flex-col transition-colors duration-300" style={{ maxHeight: 'min(90vh, 600px)' }}>

            {/* Filters */}
            <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
              {searchFilters.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Searching…
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((r, i) => (
                    <div key={r._id || `${r.type}-${r.id || i}`} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-b-0 transition-colors">

                      {/* Person (real DB user) */}
                      {r.type === 'person' && (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-300 flex-shrink-0">
                            {r.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <h4
                                className="font-medium text-gray-900 dark:text-white text-sm truncate cursor-pointer hover:underline"
                                onClick={() => { setIsOpen(false); window.location.href = `#/profile/${r._id}`; }}
                              >
                                {r.username}
                              </h4>
                              {r.role === 'department_admin' && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0" title="Verified official">
                                  <span className="text-white text-[9px]">✓</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{r.role || 'citizen'} · {r.email}</p>
                          </div>
                          <FriendButton person={r} />
                        </div>
                      )}

                      {/* Post */}
                      {r.type === 'post' && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{r.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">by {r.author} · {r.time} · {r.category}</p>
                          </div>
                        </div>
                      )}

                      {/* Trending */}
                      {r.type === 'trending' && (
                        <div className="flex items-center gap-3">
                          <Hash className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{r.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{r.count}</p>
                          </div>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                      )}

                      {/* Community */}
                      {r.type === 'community' && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-green-600 dark:text-green-300" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{r.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{r.members} members · {r.category}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400">
                  <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  {query.trim() ? `No results for "${query}"` : activeFilter === 'people' ? 'No users found' : 'Start typing to search…'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};




const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useUserLocation();
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'user';
  });
  const [showElevateModal, setShowElevateModal] = useState(false);
  const [elevatePassword, setElevatePassword] = useState('');

  const [notification, setNotification] = useState<{ isOpen: boolean, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string }>({ isOpen: false, type: 'info', title: '', message: '' });

  const handleElevateRole = () => {
    if (elevatePassword === 'admin123' || elevatePassword === 'sysadmin') {
      setUserRole('sys_admin');
      localStorage.setItem('userRole', 'sys_admin');
      setShowElevateModal(false);
      setElevatePassword('');
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Administrative Access Granted',
        message: 'System administrator privileges have been successfully granted. You now have full system access including record management capabilities.'
      });
    } else {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Authentication Failed',
        message: 'Invalid administrative credentials provided. Please verify your password and try again.'
      });
      setElevatePassword('');
    }
  };

  useEffect(() => {
    i18n.initializeLanguage();
  }, []);

  const navItems = [
    { id: 'home', label: i18n.t('home'), icon: FileText },
    { id: 'report', label: i18n.t('reportIssue'), icon: FileText },
    { id: 'feed', label: 'Community', icon: Users },
    { id: 'helpline', label: 'Helpline', icon: Phone },
  ];

  // Add admin link for elevated users
  if (userRole === 'sys_admin' || userRole === 'department_admin') {
    navItems.push({ id: 'admin-redirect', label: 'Admin Panel', icon: Shield });
  }

  return (
    <header className="bg-gradient-to-r from-orange-600 via-white to-green-600 dark:from-orange-700 dark:via-gray-800 dark:to-green-700 shadow-lg border-b-4 border-orange-500 dark:border-orange-600">
      <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between py-3 sm:py-0 sm:h-20 sm:space-x-6 gap-y-3 sm:gap-y-0">
            {/* Government Logo */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center border-2 border-orange-700 shadow-lg">
                <MapPin className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="border-l-2 border-orange-500 pl-2 sm:pl-4 hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-wide">{i18n.t('appName')}</h1>
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium uppercase tracking-wider">{i18n.t('appSubtitle')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">Government of {location.region}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative z-50 w-full order-last sm:order-none sm:mt-0 sm:flex-1 max-w-2xl sm:mx-8 px-1 sm:px-0">
              <SearchBar />
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-1 sm:space-x-4 ml-auto">
              <ThemeToggle />
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 transition-colors duration-300">
                <LanguageSelector />
              </div>
              <AccessibilityPanel />
              <NotificationBell />
              {user && onLogout && (
                <ProfileDropdown
                  user={user}
                  userRole={userRole}
                  setUserRole={setUserRole}
                  setShowElevateModal={setShowElevateModal}
                  onLogout={onLogout}
                  setActiveTab={setActiveTab}
                />
              )}
            </div>


          </div>
        </div>
      </div>


      {/* Elevate Role Modal */}
      {showElevateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Administrative Access Request</h3>
            </div>
            <p className="text-gray-600 mb-4">
              This action requires administrative credentials. Elevated access grants system-level privileges including record management capabilities.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={elevatePassword}
                onChange={(e) => setElevatePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Administrative Password"
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
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Grant Access
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

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </header>
  );
};

export default Header;