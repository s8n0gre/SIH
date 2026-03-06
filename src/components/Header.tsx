import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, MapPin, AlertTriangle, FileText, Users, BarChart3, Database, TrendingUp, Phone, Shield, Crown, User, ChevronDown, LogOut, UserCheck, Search, Hash, UserPlus, Moon, Sun, Clock, Bell, Command, } from 'lucide-react';
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
  navItems: { id: string; label: string }[];
  activeTab: string;
}

/* ── Profile Dropdown ────────────────────────────────────── */
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, userRole, setUserRole, setShowElevateModal, onLogout, setActiveTab, navItems, activeTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [impersonateUser, setImpersonateUser] = useState('');
  const [originalUser, setOriginalUser] = useState(() => localStorage.getItem('originalUser'));
  const [users, setUsers] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ isOpen: boolean, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string }>({ isOpen: false, type: 'info', title: '', message: '' });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
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
      setNotification({ isOpen: true, type: 'success', title: 'User Impersonation Active', message: `You are now impersonating ${username}.` });
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

  const handleNavClick = (id: string) => {
    if (id === 'admin-redirect') { window.location.hash = '#/admin'; return; }
    setActiveTab(id);
    setIsOpen(false);
  };

  const initials = (user?.username || user?.name || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] btn-micro"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', willChange: 'transform' }}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0d0f14' }}>
          {initials}
        </div>
        <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--text-secondary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {originalUser ? localStorage.getItem('currentUser') : (user?.username || user?.name)}
        </span>
        <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl z-[9999] dropdown-menu overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)' }}>
          {/* User info */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0d0f14' }}>
                {initials}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.username || user?.name}</div>
                <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  {userRole === 'sys_admin' && <span className="badge badge-amber">Admin</span>}
                  {userRole === 'department_admin' && <span className="badge badge-blue">Dept Admin</span>}
                  {userRole === 'citizen' && <span className="badge badge-gray">Citizen</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {/* Mobile nav items */}
            <div className="md:hidden">
              {navItems.map(item => (
                <MenuButton key={item.id} icon={<span className="w-3.5 h-3.5" />} label={item.label} onClick={() => { handleNavClick(item.id); setIsOpen(false); }} />
              ))}
              <div className="px-4 py-2">
                <LanguageSelector />
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }} className="my-1" />
            </div>
            <MenuButton icon={<User className="w-3.5 h-3.5" />} label="My Profile" onClick={() => { setIsOpen(false); window.location.href = `#/profile/${user?.id || user?._id}`; }} />
            <MenuButton icon={<Shield className="w-3.5 h-3.5" />} label="Settings" onClick={() => setIsOpen(false)} />
            {(userRole === 'sys_admin' || userRole === 'department_admin') && (
              <MenuButton icon={<BarChart3 className="w-3.5 h-3.5" />} label="Admin Dashboard" onClick={() => { setIsOpen(false); setActiveTab('admin'); }} accent="blue" />
            )}
            {userRole === 'sys_admin' && (
              <MenuButton icon={<UserCheck className="w-3.5 h-3.5" />} label="Impersonate User" onClick={() => { fetchUsers(); setShowImpersonateModal(true); setIsOpen(false); }} accent="blue" />
            )}
            {originalUser && (
              <MenuButton icon={<User className="w-3.5 h-3.5" />} label="Stop Impersonation" onClick={handleStopImpersonation} accent="green" />
            )}
            {userRole !== 'sys_admin' && (
              <MenuButton icon={<Shield className="w-3.5 h-3.5" />} label="Elevate Role" onClick={() => { setShowElevateModal(true); setIsOpen(false); }} accent="amber" />
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }} className="py-1">
            <MenuButton icon={<LogOut className="w-3.5 h-3.5" />} label="Sign Out" onClick={() => { onLogout(); setIsOpen(false); }} accent="red" />
          </div>
        </div>
      )}

      {showImpersonateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm backdrop-fade">
          <div className="rounded-2xl p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto modal-enter" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Impersonate User</h3>
            <div className="space-y-2 mb-4">
              {users.map((u) => (
                <button key={u._id} onClick={() => handleImpersonate(u.username)} className="w-full p-3 text-left rounded-xl transition-colors" style={{ border: '1px solid var(--border)', background: 'var(--bg-base)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.username}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email} · {u.role}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowImpersonateModal(false)} className="btn-secondary w-full justify-center">Cancel</button>
          </div>
        </div>
      )}

      <NotificationModal isOpen={notification.isOpen} onClose={() => { if (notification.title === 'Confirm Administrative Exit') { setUserRole('user'); localStorage.setItem('userRole', 'user'); } setNotification({ ...notification, isOpen: false }); }} type={notification.type} title={notification.title} message={notification.message} />
    </div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; accent?: string }> = ({ icon, label, onClick, accent }) => {
  const colors: Record<string, string> = { amber: 'var(--accent)', blue: 'var(--accent-blue)', green: 'var(--accent-green)', red: 'var(--accent-red)' };
  const color = accent ? colors[accent] : 'var(--text-secondary)';
  return (
    <button onClick={onClick} className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left transition-colors" style={{ color }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

/* ── Theme Toggle ─────────────────────────────────────────── */
const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 btn-micro hover-lift" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', willChange: 'transform' }} title={isDark ? 'Light mode' : 'Dark mode'}>
      {isDark ? <Sun className="w-4 h-4 icon-hover" style={{ color: 'var(--accent)' }} /> : <Moon className="w-4 h-4 icon-hover" style={{ color: 'var(--text-muted)' }} />}
    </button>
  );
};

/* ── Command Palette Search ───────────────────────────────── */
const CommandSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useUserLocation();
  const [activeFilter, setActiveFilter] = useState('people');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendActions, setFriendActions] = useState<{ [id: string]: string }>({});
  const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
  const currentUserId = currentUser.id || currentUser._id || '';
  const inputRef = useRef<HTMLInputElement>(null);

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

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(o => !o); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const searchPeople = useCallback(async (q: string) => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/friends/search?userId=${currentUserId}&q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.filter((u: any) => u._id !== currentUserId && u.id !== currentUserId).map((u: any) => ({ ...u, type: 'person' })));
      }
    } catch { setResults([]); } finally { setLoading(false); }
  }, [currentUserId]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeFilter === 'people') { searchPeople(query); return; }
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    setTimeout(() => { setResults(mockResults[activeFilter] || []); setLoading(false); }, 300);
  }, [query, activeFilter, isOpen]);

  const sendRequest = async (recipientId: string) => {
    setFriendActions(p => ({ ...p, [recipientId]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/api/friends/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requesterId: currentUserId, recipientId }) });
      if (res.ok || res.status === 409) {
        const data = res.ok ? await res.json() : null;
        setResults(prev => prev.map(r => r._id === recipientId ? { ...r, friendStatus: 'sent', friendshipId: data?._id || r.friendshipId } : r));
      }
    } catch (e) { console.error(e); } finally { setFriendActions(p => { const n = { ...p }; delete n[recipientId]; return n; }); }
  };

  const acceptRequest = async (friendshipId: string, userId: string) => {
    setFriendActions(p => ({ ...p, [userId]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/api/friends/${friendshipId}/accept`, { method: 'PUT' });
      if (res.ok) setResults(prev => prev.map(r => r._id === userId ? { ...r, friendStatus: 'friends' } : r));
    } catch (e) { console.error(e); } finally { setFriendActions(p => { const n = { ...p }; delete n[userId]; return n; }); }
  };

  const removeConnection = async (friendshipId: string, userId: string) => {
    if (!friendshipId) return;
    setFriendActions(p => ({ ...p, [userId]: 'loading' }));
    try {
      const res = await fetch(`${API_BASE}/api/friends/${friendshipId}`, { method: 'DELETE' });
      if (res.ok || res.status === 404) setResults(prev => prev.map(r => r._id === userId ? { ...r, friendStatus: 'none', friendshipId: null } : r));
    } catch (e) { console.error(e); } finally { setFriendActions(p => { const n = { ...p }; delete n[userId]; return n; }); }
  };

  const FriendButton = ({ person }: { person: any }) => {
    const busy = friendActions[person._id] === 'loading';
    if (person.friendStatus === 'friends') return (<button onClick={() => removeConnection(person.friendshipId, person._id)} disabled={busy} className="badge badge-green">✓ Friends</button>);
    if (person.friendStatus === 'sent') return (<button disabled className="badge badge-gray">Pending</button>);
    if (person.friendStatus === 'received') return (<button onClick={() => acceptRequest(person.friendshipId, person._id)} disabled={busy} className="badge badge-blue">Accept</button>);
    return (<button onClick={() => sendRequest(person._id)} disabled={busy} className="badge badge-amber">+ Add</button>);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 btn-micro hover-lift"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'text', willChange: 'transform' }}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs hidden md:block">Search...</span>
        <kbd className="hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-faint)', fontFamily: 'monospace' }}>
          ⌘K
        </kbd>
      </button>

      {/* Command palette */}
      {isOpen && (
        <>
          <div className="cmd-overlay backdrop-fade" onClick={() => setIsOpen(false)} />
          <div className="cmd-palette modal-enter">
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search people, posts, communities..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              {searchFilters.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveFilter(id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all" style={activeFilter === id ? { background: 'var(--accent-subtle)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}>
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-8" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                  <span className="text-sm">Searching…</span>
                </div>
              ) : results.length > 0 ? (
                <div className="py-1">
                  {results.map((r, i) => (
                    <div key={r._id || `${r.type}-${r.id || i}`} className="px-4 py-2.5 transition-colors cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {r.type === 'person' && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                            {r.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }} onClick={() => { setIsOpen(false); window.location.href = `#/profile/${r._id}`; }}>{r.username}</span>
                              {r.role === 'department_admin' && <span className="badge badge-blue">✓</span>}
                            </div>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.role} · {r.email}</p>
                          </div>
                          <FriendButton person={r} />
                        </div>
                      )}
                      {r.type === 'post' && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />
                          <div><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>by {r.author} · {r.time}</p></div>
                        </div>
                      )}
                      {r.type === 'trending' && (
                        <div className="flex items-center gap-3">
                          <Hash className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />
                          <div><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.count}</p></div>
                          <TrendingUp className="w-4 h-4 ml-auto" style={{ color: 'var(--accent-green)' }} />
                        </div>
                      )}
                      {r.type === 'community' && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-green-subtle)' }}>
                            <Users className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                          </div>
                          <div><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.members} members</p></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Search className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--border-strong)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {query.trim() ? `No results for "${query}"` : activeFilter === 'people' ? 'Search for citizens...' : 'Start typing to search…'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

/* ── Main Header ──────────────────────────────────────────── */
const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useUserLocation();
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'user');
  const [showElevateModal, setShowElevateModal] = useState(false);
  const [elevatePassword, setElevatePassword] = useState('');
  const [notification, setNotification] = useState<{ isOpen: boolean, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string }>({ isOpen: false, type: 'info', title: '', message: '' });

  const handleElevateRole = () => {
    if (elevatePassword === 'admin123' || elevatePassword === 'sysadmin') {
      setUserRole('sys_admin');
      localStorage.setItem('userRole', 'sys_admin');
      setShowElevateModal(false);
      setElevatePassword('');
      setNotification({ isOpen: true, type: 'success', title: 'Administrative Access Granted', message: 'System administrator privileges have been granted.' });
    } else {
      setNotification({ isOpen: true, type: 'error', title: 'Authentication Failed', message: 'Invalid administrative credentials.' });
      setElevatePassword('');
    }
  };

  useEffect(() => { i18n.initializeLanguage(); }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'helpline', label: 'Helpline' },
  ];

  if (userRole === 'sys_admin' || userRole === 'department_admin') {
    navItems.push({ id: 'admin-redirect', label: 'Admin' });
  }

  const handleNavClick = (id: string) => {
    if (id === 'admin-redirect') { window.location.hash = '#/admin'; return; }
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50" style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">

            {/* Logo */}
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 flex-shrink-0 group transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" style={{ willChange: 'transform' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <MapPin className="w-4 h-4" style={{ color: '#0d0f14' }} />
              </div>
              <span className="text-sm font-bold hidden sm:block" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                LokSetu
                <span style={{ color: 'var(--accent)' }}>.</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 ml-2 z-10">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="nav-link nav-underline text-sm transition-all duration-200"
                  style={activeTab === item.id || (item.id === 'admin-redirect' && activeTab === 'admin') ? { color: 'var(--text-primary)', background: 'var(--bg-elevated)' } : {}}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Center Search */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block w-64 lg:w-80 z-20 transition-all duration-300 group">
              <div className="group-focus-within:w-auto min-w-full transition-all duration-300">
                <CommandSearch />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right controls */}
            <div className="flex items-center gap-2 z-10">
              <ThemeToggle />
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>
              <AccessibilityPanel />
              <NotificationBell />
              {user && onLogout && (
                <ProfileDropdown user={user} userRole={userRole} setUserRole={setUserRole} setShowElevateModal={setShowElevateModal} onLogout={onLogout} setActiveTab={setActiveTab} navItems={navItems} activeTab={activeTab} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Elevate Role Modal */}
      {showElevateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm backdrop-fade">
          <div className="rounded-2xl p-6 w-full max-w-md mx-4 modal-enter" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-blue-subtle)' }}>
                <Shield className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Administrative Access</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Enter admin credentials to elevate your privileges.</p>
            <input
              type="password"
              value={elevatePassword}
              onChange={e => setElevatePassword(e.target.value)}
              className="input-field mb-4"
              placeholder="Admin password"
              onKeyPress={e => { if (e.key === 'Enter') handleElevateRole(); }}
            />
            <div className="flex gap-3">
              <button onClick={handleElevateRole} className="btn-primary flex-1 justify-center">Grant Access</button>
              <button onClick={() => { setShowElevateModal(false); setElevatePassword(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} type={notification.type} title={notification.title} message={notification.message} />
    </>
  );
};

export default Header;