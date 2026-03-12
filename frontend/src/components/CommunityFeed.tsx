import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle, MapPin, Share2, Send, X } from 'lucide-react';
import { apiService } from '../services/api';
import { useUserLocation } from '../hooks/useUserLocation';
import NotificationModal from './NotificationModal';
import LocalMap from './LocalMap';
import WeeklyDigest from './WeeklyDigest';

interface Report {
  id: string; title: string; description: string; category: string; location: string;
  coordinates: { lat: number; lng: number }; images: string[]; status: string;
  votes: number; upvotes: number; downvotes: number; comments: Comment[];
  submitted: string; department: string; author: string; distance?: number;
}
interface Comment { id: string; text: string; author: string; timestamp: string; replies: any[]; }

interface FeedProps {
  searchTerm: string;
  departmentFilter: string;
  setDepartmentFilter: (val: string) => void;
}

const CommunityFeed: React.FC<FeedProps> = ({ searchTerm, departmentFilter, setDepartmentFilter }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const location = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [seenStories, setSeenStories] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('seenStories') || '[]')); } catch { return new Set(); }
  });
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [statusFilter] = useState('all');
  const [votedIds, setVotedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('votedReports') || '[]')); } catch { return new Set(); }
  });
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<{ isOpen: boolean, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string }>({ isOpen: false, type: 'info', title: '', message: '' });
  const [showMapModal, setShowMapModal] = useState(false);
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});
  const [activeStory, setActiveStory] = useState<any>(null);

  const API_BASE = '';

  const getImageIndex = (reportId: string) => imageIndexes[reportId] || 0;
  const setImageIndex = (reportId: string, index: number) => setImageIndexes(prev => ({ ...prev, [reportId]: index }));

  useEffect(() => {
    const handleShowMap = () => setShowMapModal(true);
    window.addEventListener('showMapFromDashboard', handleShowMap);
    return () => window.removeEventListener('showMapFromDashboard', handleShowMap);
  }, []);

  useEffect(() => {
    const savedReports = localStorage.getItem('communityReports');
    if (savedReports) { try { setReports(JSON.parse(savedReports)); setLoading(false); } catch (e) { } }
    fetchReports();
    const handleReportUpdate = () => fetchReports();
    window.addEventListener('reportStatusUpdated', handleReportUpdate);
    return () => window.removeEventListener('reportStatusUpdated', handleReportUpdate);
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiService.getReports();
      const transformedReports = data.map((report: any) => ({
        id: report._id || report.id || Date.now().toString(),
        title: report.title, description: report.description, category: report.category,
        location: report.location?.address || report.location || 'Unknown location',
        coordinates: { lat: report.location?.coordinates?.latitude || 23.3441, lng: report.location?.coordinates?.longitude || 85.3096 },
        images: report.images || report.imageUrls || report.attachments || [],
        status: (() => {
          const s = report.status?.toLowerCase();
          if (s === 'resolved' || s === 'completed') return 'completed';
          if (s === 'in-progress' || s === 'in_progress' || s === 'assigned') return 'in-progress';
          if (s === 'rejected') return 'rejected'; return 'pending';
        })(),
        votes: (report.votes?.upvotes || 0) - (report.votes?.downvotes || 0),
        upvotes: report.votes?.upvotes || 0, downvotes: report.votes?.downvotes || 0,
        comments: (report.comments || []).map((c: any) => ({
          id: c._id || c.id || Date.now().toString(), text: c.text,
          author: c.user?.username || c.author || 'Anonymous', timestamp: new Date(c.timestamp || c.createdAt).toLocaleTimeString(),
          replies: []
        })),
        submitted: new Date(report.createdAt).toLocaleDateString(),
        department: report.department || 'Public Works',
        author: report.reportedBy?.username || report.author || 'Anonymous'
      }));
      setReports(transformedReports);
    } catch {
      setReports([
        { id: 'demo-1', title: 'Water Leakage', description: 'Major water pipe burst near the station causing severe waterlogging. Immediate action required to prevent structural damage.', category: 'Water Services', location: `Station Road, ${location.city}`, coordinates: { lat: 23.3441, lng: 85.3096 }, images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'], status: 'in-progress', votes: 22, upvotes: 23, downvotes: 1, comments: [], submitted: new Date().toLocaleDateString(), department: 'Water Department', author: 'Concerned Citizen' }
      ]);
    } finally { setLoading(false); }
  };

  const handleVote = async (id: string) => {
    const alreadyVoted = votedIds.has(id);
    // Optimistic update
    setReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      const delta = alreadyVoted ? -1 : 1;
      return { ...r, upvotes: r.upvotes + delta, votes: r.upvotes + delta - r.downvotes };
    }));
    // Persist voted state
    setVotedIds(prev => {
      const next = new Set(prev);
      alreadyVoted ? next.delete(id) : next.add(id);
      localStorage.setItem('votedReports', JSON.stringify([...next]));
      return next;
    });
    try { await apiService.voteOnReport(id, alreadyVoted ? 'down' : 'up'); } catch { }
  };

  // Department → color palette
  const DEPT_COLORS: Record<string, [string, string]> = {
    'Water': ['#136f8a', '#e6f4f8'], 'Traffic': ['#d97706', '#fef3c7'],
    'Municipal': ['#d94b38', '#fce8e6'], 'Fire': ['#7c3aed', '#ede9fe'],
    'Health': ['#2d9e5f', '#e6f7ee'], 'Police': ['#136f8a', '#e6f4f8'],
    'Public': ['#d94b38', '#fce8e6'], 'Infrastructure': ['#7c3aed', '#ede9fe'],
  };
  const getDeptColor = (dept: string): [string, string] => {
    const key = Object.keys(DEPT_COLORS).find(k => dept?.toLowerCase().includes(k.toLowerCase()));
    return key ? DEPT_COLORS[key] : ['#d94b38', '#fce8e6'];
  };

  const handleSeenStory = (story: any) => {
    setSeenStories(prev => {
      const next = new Set(prev);
      next.add(story.id);
      localStorage.setItem('seenStories', JSON.stringify([...next]));
      return next;
    });
    setActiveStory(story);
  };

  const handleAddComment = async (id: string) => {
    const text = commentTexts[id]?.trim(); if (!text) return;
    const newComment: Comment = { id: Date.now().toString(), text, author: localStorage.getItem('currentUser') || 'Anonymous', timestamp: new Date().toLocaleTimeString(), replies: [] };
    setReports(prev => prev.map(r => r.id === id ? { ...r, comments: [...r.comments, newComment] } : r));
    setCommentTexts(prev => ({ ...prev, [id]: '' }));
    try { await fetch(`${API_BASE}/api/reports/${id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken') || 'anonymous'}` }, body: JSON.stringify({ text }) }); } catch { }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="badge badge-green">Resolved</span>;
      case 'in-progress': return <span className="badge badge-amber">In Progress</span>;
      case 'rejected': return <span className="badge badge-gray">Rejected</span>;
      default: return <span className="badge badge-gray">Pending</span>;
    }
  };

  return (
    <div className="relative min-h-screen pt-4 pb-24 page-enter">
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${showMapModal ? 'blur-md' : ''}`}>


        {/* ── 2 Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

          {/* MAIN FEED (Left on desktop, bottom on mobile) */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

            {/* ── Combined Civic Header & Stories ── */}
            <div className="mb-8">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h1 className="text-4xl font-black tracking-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>Civic Feed</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500" />
                    <p className="text-sm font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--text-muted)' }}>
                      {reports.length} reports tracking the pulse of {location.city}
                    </p>
                  </div>
                </div>
              </div>

            <div className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none border-b border-dashed" style={{ borderColor: 'var(--border)' }}>
                {/* YOUR STORY: Redesigned as a glass-action panel */}
                <div className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group">
                  <div className="relative w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-active:scale-95 shadow-lg group-hover:shadow-[var(--accent)]/30 overflow-hidden"
                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)' }}>
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-100 transition-opacity" 
                         style={{ background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)' }} />
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center border-2 border-dashed transition-all group-hover:rotate-90 group-hover:border-solid"
                         style={{ borderColor: 'var(--accent)', background: 'var(--accent-subtle)' }}>
                      <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight w-16 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-primary)' }}>Add Pulse</span>
                </div>

                {/* DYNAMIC STORIES: Redesigned with 'The Pulse Ring' */}
                {(reports.length > 0 ? reports.slice(0, 8) : [
                  { id: 's1', department: 'Water Department', title: 'Pipe Update', author: 'W' },
                  { id: 's2', department: 'Traffic Department', title: 'Route Alert', author: 'T' },
                  { id: 's3', department: 'Municipal', title: 'New Road', author: 'M' },
                  { id: 's4', department: 'Fire Department', title: 'Drill Notice', author: 'F' },
                  { id: 's5', department: 'Health Department', title: 'Camp Today', author: 'H' },
                ]).map((r: any, i: number) => {
                  const isSeen = seenStories.has(r.id);
                  const [fg, bg] = getDeptColor(r.department || '');
                  const initial = (r.author || r.department || '?').charAt(0).toUpperCase();
                  const label = r.title ? (r.title.length > 10 ? r.title.slice(0, 10) + '…' : r.title) : r.department;
                  
                  return (
                    <div key={r.id || i}
                      onClick={() => handleSeenStory(r)}
                      className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group">
                      <div className="relative p-[1.5px] rounded-[24px] transition-all duration-500 group-hover:scale-110 group-active:scale-95 shadow-md shadow-black/5"
                        style={{ background: isSeen ? 'var(--border-strong)' : 'linear-gradient(135deg, var(--accent), var(--accent-blue), var(--accent-green))' }}>
                        <div className="p-[2.5px] rounded-[23px]" style={{ background: 'var(--bg-base)' }}>
                          <div className="w-14 h-14 rounded-[20px] flex items-center justify-center text-xl font-black shadow-inner relative overflow-hidden"
                            style={{ background: bg, color: fg }}>
                            {/* Texture overlay */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, white, transparent)' }} />
                            <span className="relative z-10 transition-transform duration-500 group-hover:scale-110">{initial}</span>
                            
                            {/* Active Indicator */}
                            {!isSeen && (
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-base)] bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-center leading-tight w-16 truncate transition-colors"
                        style={{ color: isSeen ? 'var(--text-faint)' : 'var(--text-primary)' }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
            </div>
            </div>

            {/* ── Fixed Category Filter Row ── */}
            <div className="sticky top-0 z-30 py-2 -mx-4 px-4 mb-4 backdrop-blur-md" style={{ background: 'var(--bg-base-70)' }}>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Fire', 'Police', 'Medical', 'Infrastructure', 'Traffic'].map(dept => (
                  <button key={dept} onClick={() => setDepartmentFilter(dept === 'All' ? 'all' : `${dept} Department`)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${(dept === 'All' && departmentFilter === 'all') || departmentFilter === `${dept} Department`
                      ? 'shadow-lg scale-[1.02]'
                      : 'opacity-80 hover:opacity-100 hover:bg-[var(--bg-elevated)]'
                      }`}
                    style={{
                      background: (dept === 'All' && departmentFilter === 'all') || departmentFilter === `${dept} Department` ? 'var(--accent)' : 'var(--bg-panel)',
                      color: (dept === 'All' && departmentFilter === 'all') || departmentFilter === `${dept} Department` ? '#fff' : 'var(--text-secondary)',
                      borderColor: (dept === 'All' && departmentFilter === 'all') || departmentFilter === `${dept} Department` ? 'transparent' : 'var(--border)'
                    }}>
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed List */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <div className="space-y-8 animate-fade-up">
                {reports.filter(r =>
                  (searchTerm === '' || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
                  (departmentFilter === 'all' || r.department === departmentFilter) &&
                  (statusFilter === 'all' || r.status === statusFilter)
                ).map(report => (
                  <article key={report.id} className="card group overflow-hidden border">
                    <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm border" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                            {report.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{report.author}</p>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>{report.submitted} • {report.department}</p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>

                      <h3 className="text-lg font-bold mb-3 tracking-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>{report.title}</h3>
                      <p className="text-sm mb-5 line-clamp-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.description}</p>

                      <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg inline-flex border shadow-sm" style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
                        <span className="truncate max-w-[200px]">{report.location}</span>
                      </div>
                    </div>

                    {report.images.length > 0 && (
                      <div className="p-4 bg-black/5 dark:bg-white/5">
                        <div className="heritage-frame heritage-pattern relative aspect-video w-full bg-black select-none border-0">
                          <img
                            src={report.images[getImageIndex(report.id)]}
                            alt="Report"
                            className="w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80';
                              e.currentTarget.onerror = null;
                            }}
                            loading="lazy"
                          />
                          {report.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                              {report.images.map((_, i) => (
                                <button key={i} onClick={() => setImageIndex(report.id, i)} className={`h-1.5 rounded-full transition-all duration-300 ${getImageIndex(report.id) === i ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--bg-panel)' }}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleVote(report.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
                          style={{
                            background: votedIds.has(report.id) ? 'rgba(217,75,56,0.12)' : 'transparent',
                          }}
                        >
                          <ArrowUp
                            className="w-5 h-5 transition-colors"
                            style={{ color: votedIds.has(report.id) ? 'var(--accent)' : 'var(--text-faint)' }}
                            strokeWidth={votedIds.has(report.id) ? 2.5 : 2}
                          />
                        </button>
                        <span className="text-sm font-bold min-w-[24px]"
                          style={{ color: votedIds.has(report.id) ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {report.votes}
                        </span>

                        <div className="w-px h-5 mx-2" style={{ background: 'var(--border)' }} />

                        <button onClick={() => setShowComments(p => ({ ...p, [report.id]: !p[report.id] }))} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-500/10 transition-colors group/btn">
                          <MessageCircle className="w-4 h-4 group-hover/btn:text-blue-600 transition-colors" style={{ color: 'var(--text-faint)' }} />
                        </button>
                        <span className="text-sm font-bold min-w-[24px]" style={{ color: 'var(--text-primary)' }}>{report.comments.length}</span>
                      </div>

                      <div className="relative post-menu-container flex items-center gap-1">
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); setNotification({ isOpen: true, type: 'success', title: 'Link Copied', message: 'URL copied!' }) }} className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center">
                          <Share2 className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                        </button>
                      </div>
                    </div>

                    {showComments[report.id] && (
                      <div className="p-6 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                        <div className="flex gap-3 mb-5">
                          <input type="text" value={commentTexts[report.id] || ''} onChange={e => setCommentTexts(p => ({ ...p, [report.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddComment(report.id)} className="input-field text-sm font-medium" placeholder="Add a public update..." />
                          <button onClick={() => handleAddComment(report.id)} className="btn-primary w-12 h-11 flex items-center justify-center p-0 rounded-xl"><Send className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-4">
                          {report.comments.map(c => (
                            <div key={c.id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 mt-1 flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                {c.author.charAt(0).toUpperCase()}
                              </div>
                              <div className="card p-3.5 flex-1 rounded-tl-sm shadow-sm border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors" style={{ background: 'var(--bg-panel)' }}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{c.author}</span>
                                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>{c.timestamp}</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR (Right on desktop, top on mobile) */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-20 self-start order-1 lg:order-2">
            <WeeklyDigest />
            
            {/* Standalone Communities (Desktop Sidebar Only) */}
            <div className="hidden lg:block card p-5 border shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>Communities</h3>
              <div className="space-y-2">
                {[
                  { name: `${location.city} Municipal`, members: '12.5K', color: '#136f8a', bg: '#e6f4f8' },
                  { name: `${location.region} Citizens`, members: '8.2K', color: '#d94b38', bg: '#fce8e6' },
                  { name: 'Public Safety', members: '3.8K', color: '#2d9e5f', bg: '#e6f7ee' },
                  { name: 'Infrastructure', members: '2.1K', color: '#7c3aed', bg: '#ede9fe' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-[var(--border)] transition-all cursor-pointer group"
                    style={{ background: 'var(--bg-panel)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: c.bg, color: c.color }}>
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>{c.members} members</p>
                    </div>
                    <button className="text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>Join</button>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>
      </div>

      {activeStory && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col pt-4 pb-8 animate-fade-in">
          <div className="flex items-center justify-between px-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 text-white">
                {(activeStory.author || activeStory.department || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{activeStory.author || activeStory.department}</p>
                <p className="text-white/70 text-xs">{activeStory.title}</p>
              </div>
            </div>
            <button onClick={() => setActiveStory(null)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 px-4 flex flex-col items-center justify-center relative">
            {activeStory.images && activeStory.images.length > 0 ? (
              <img src={activeStory.images[0]} alt="Story Image" className="w-full max-w-3xl max-h-[85vh] md:max-h-[90vh] rounded-2xl object-contain shadow-2xl animate-scale-in" />
            ) : (
              <div className="w-full max-w-md aspect-[9/16] rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl animate-scale-in" style={{ background: 'linear-gradient(135deg, #f97316, #7c3aed)' }}>
                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{activeStory.title || activeStory.department}</h2>
                <p className="text-white/90 text-lg">{activeStory.description || 'New updates from this department'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(p => ({ ...p, isOpen: false }))} type={notification.type} title={notification.title} message={notification.message} />

      {showMapModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-5xl h-[80vh] card rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Civic Landscape</h3>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Live reporting density</p>
              </div>
              <button onClick={() => setShowMapModal(false)} className="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
              <LocalMap />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CommunityFeed;
