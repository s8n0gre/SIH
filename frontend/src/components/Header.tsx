import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, BarChart3, Shield, User, LogOut, UserCheck, Search, Moon, Sun, X, FileText, TrendingUp, Users, Hash, Command } from 'lucide-react';
import NotificationModal from './NotificationModal';
import NotificationBell from './NotificationBell';
import { i18n } from '../services/i18n';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE } from '../config';
import { useUserLocation } from '../hooks/useUserLocation';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: any;
  onLogout?: () => void;
  setSearchTerm: (val: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
}

interface ProfileDropdownProps {
  user: any;
  userRole: string;
  setUserRole: (role: string) => void;
  setShowElevateModal: (show: boolean) => void;
  onLogout: () => void;
  setActiveTab: (tab: string) => void;
}

/* ── Profile Dropdown ────────────────────────────────────── */
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, userRole, setUserRole, setShowElevateModal, onLogout, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [originalUser, setOriginalUser] = useState(() => localStorage.getItem('originalUser'));
  const [users, setUsers] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ isOpen: boolean, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string }>({ isOpen: false, type: 'info', title: '', message: '' });
  const { isDark, toggleTheme } = useTheme();
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

  const initials = (user?.username || user?.name || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0d0f14', border: '2px solid var(--border)', willChange: 'transform' }}
      >
        {initials}
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
            <MenuButton icon={<User className="w-3.5 h-3.5" />} label="My Profile" onClick={() => { setIsOpen(false); window.location.href = `#/profile/${user?.id || user?._id}`; }} />
            <MenuButton icon={isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />} label={isDark ? 'Light Mode' : 'Dark Mode'} onClick={() => { toggleTheme(); }} />
            <MenuButton icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>} label="Settings" onClick={() => { setShowSettingsModal(true); setIsOpen(false); }} />
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
      
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm backdrop-fade">
          <div className="rounded-2xl p-6 w-full max-w-md mx-4 modal-enter" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h3>
              <button onClick={() => { setShowSettingsModal(false); }} className="p-1 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <button onClick={() => { toggleTheme(); }} className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left transition-colors rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Language</label>
                <select onChange={(e) => { i18n.setLanguage(e.target.value); window.location.reload(); }} value={i18n.getCurrentLanguage()} className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  {i18n.getLanguages().map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Accessibility</label>
                <div className="space-y-2">
                  <button onClick={() => { document.body.classList.toggle('high-contrast'); }} className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                    High Contrast
                  </button>
                  <button onClick={() => { const size = parseInt(document.documentElement.style.fontSize || '100'); document.documentElement.style.fontSize = `${Math.min(size + 10, 150)}%`; }} className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                    Increase Text Size
                  </button>
                  <button onClick={() => { document.body.classList.toggle('big-cursor'); }} className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                    Big Cursor
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => { setShowSettingsModal(false); }} className="btn-secondary w-full justify-center mt-4">Close</button>
          </div>
        </div>
      )}
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

/* ── Command Palette Search (Restored) ─────────────────────── */
const CommandSearch: React.FC<{ setSearchTerm: (val: string) => void; isOpen: boolean; setIsOpen: (val: boolean) => void }> = ({ setSearchTerm, isOpen, setIsOpen }) => {
  const [query, setQuery] = useState('');
  const location = useUserLocation();
  const [activeFilter, setActiveFilter] = useState('posts');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchFilters = [
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);


  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    setSearchTerm(query);
    const timer = setTimeout(() => {
      setResults(mockResults[activeFilter] || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeFilter, isOpen, setSearchTerm, location.city]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-[400px] flex items-center justify-between gap-2 px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-300 group hover:shadow-lg hover:shadow-[var(--accent)]/10 mx-auto"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'text' }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-faint)' }} />
          <span className="text-[var(--text-muted)] font-medium truncate">
            Search clusters...
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border text-[10px] font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border)', color: 'var(--text-faint)', background: 'var(--bg-panel)' }}>
          <Command className="w-2.5 h-2.5" /> K
        </div>
      </button>

      {isOpen && createPortal(
        <>
          <div className="cmd-overlay backdrop-fade" onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }} />
          <div className="cmd-palette modal-enter" style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 'min(600px, calc(100vw - 32px))', zIndex: 9999, background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-strong)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search people, posts, communities..."
                className="flex-1 bg-transparent text-base outline-none font-medium"
                style={{ color: 'var(--text-primary)' }}
              />
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl transition-colors hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              {searchFilters.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveFilter(id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all" style={activeFilter === id ? { background: 'var(--accent-subtle)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-12" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold uppercase tracking-widest">Infiltrating Database...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((r, i) => (
                    <div key={r._id || `${r.type}-${r.id || i}`} className="px-5 py-3.5 transition-all cursor-pointer group/item hover:pl-7" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {r.type === 'post' && (
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110" style={{ background: 'var(--accent-blue-subtle)' }}>
                            <FileText className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold mb-0.5 transition-colors group-hover/item:text-[var(--accent-blue)]" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>by {r.author} • {r.time}</p>
                          </div>
                        </div>
                      )}
                      {r.type === 'trending' && (
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110" style={{ background: 'var(--accent-green-subtle)' }}>
                            <Hash className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold mb-0.5 group-hover/item:text-[var(--accent-green)]" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{r.count}</p>
                          </div>
                          <TrendingUp className="w-4 h-4 ml-auto opacity-40 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-1" style={{ color: 'var(--accent-green)' }} />
                        </div>
                      )}
                      {r.type === 'community' && (
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110" style={{ background: 'var(--accent-green-subtle)' }}>
                            <Users className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-bold mb-0.5 group-hover/item:text-[var(--accent-green)]" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{r.members} members • {r.category}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="relative inline-block mb-6">
                    <Search className="w-12 h-12 mx-auto opacity-10" style={{ color: 'var(--text-primary)' }} />
                    <Command className="absolute -bottom-2 -right-2 w-6 h-6 opacity-20" style={{ color: 'var(--accent)' }} />
                  </div>
                  <p className="text-base font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {query.trim() ? `No matches for "${query}"` : 'Enter Command Query'}
                  </p>
                  <p className="text-xs font-medium opacity-40 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {query.trim() ? 'Check spelling or try different filters' : 'Search people, reports, or data clusters'}
                  </p>
                </div>
              )}
            </div>
            <div className="px-4 py-3 bg-black/5 dark:bg-white/5 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-bold" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-faint)' }}>ESC</kbd>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Close</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-bold" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-faint)' }}>↵</kbd>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Select</span>
                  </div>
               </div>
               <div className="text-[10px] font-bold uppercase tracking-widest opacity-30">LokSetu Engine v2.4</div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

/* ── Main Header ──────────────────────────────────────────── */
const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onLogout, setSearchTerm, isSearchOpen, setIsSearchOpen }) => {
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
    { id: 'helpline', label: 'Helpline' },
  ];

  if (userRole === 'sys_admin' || userRole === 'department_admin') {
    navItems.push({ id: 'admin-redirect', label: 'Admin' });
  }

  const handleNavClick = (id: string) => {
    if (id === 'admin-redirect') { window.location.hash = '#/admin'; return; }
    setActiveTab(id);
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
            <nav className="flex items-center gap-1 ml-2 z-10">
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

            {/* Center Search - Best Position with Command Functionality */}
            <div className="flex-1 max-w-2xl px-4 z-20">
              <CommandSearch setSearchTerm={setSearchTerm} isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
            </div>

            {/* Spacer (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1" />

            {/* Right controls */}
            <div className="flex items-center gap-2 z-10">
              <NotificationBell />
              {user && onLogout && (
                <ProfileDropdown user={user} userRole={userRole} setUserRole={setUserRole} setShowElevateModal={setShowElevateModal} onLogout={onLogout} setActiveTab={setActiveTab} />
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