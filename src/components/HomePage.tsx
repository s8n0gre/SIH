import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, Users, CheckCircle, ArrowRight, ChevronRight, Phone, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onReport?: () => void;
}

interface Issue {
  id: string;
  title: string;
  department: string;
  votes: number;
  status: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { cls: string; label: string }> = {
    'completed': { cls: 'badge-green', label: 'Resolved' },
    'Completed': { cls: 'badge-green', label: 'Resolved' },
    'in-progress': { cls: 'badge-amber', label: 'In Progress' },
    'In Progress': { cls: 'badge-amber', label: 'In Progress' },
    'pending': { cls: 'badge-gray', label: 'Pending' },
  };
  const s = map[status] || { cls: 'badge-gray', label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

const AnimatedNumber = ({ value }: { value: string }) => {
  const [displayed, setDisplayed] = useState('0');
  const num = parseInt(value.replace(/,/g, ''), 10) || 0;

  useEffect(() => {
    if (isNaN(num) || num === 0) { setDisplayed(value); return; }
    let start = 0;
    const duration = 900;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * num);
      setDisplayed(current.toLocaleString());
      if (progress < 1) requestAnimationFrame(step);
      else setDisplayed(value);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{displayed}</>;
};

const HELPLINE_NUMBERS = [
  { dept: 'Public Safety', num: '100', icon: AlertCircle, color: '#e5604f' },
  { dept: 'Fire & Rescue', num: '101', icon: AlertCircle, color: '#e5604f' },
  { dept: 'Ambulance', num: '108', icon: AlertCircle, color: '#e5604f' },
  { dept: 'Municipal Services', num: '1800-123-4567', icon: Phone, color: '#2293b5' },
  { dept: 'Water & Electricity', num: '1800-123-4568', icon: Phone, color: '#f2aa4b' },
];

const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onReport }) => {
  const [stats, setStats] = useState([
    { label: 'Issues Reported', value: '0', icon: MapPin, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
    { label: 'In Progress', value: '0', icon: Clock, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
    { label: 'Citizens Active', value: '0', icon: Users, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
    { label: 'Resolved', value: '0', icon: CheckCircle, color: 'var(--accent-green)', bg: 'var(--accent-green-subtle)' },
  ]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = useCallback(async () => {
    try {
      const reports = await apiService.getReports();
      const totalReports = reports.length;
      const inProgress = reports.filter((r: any) => r.status === 'in-progress').length;
      const completed = reports.filter((r: any) => r.status === 'completed').length;

      let statsData = null;
      try {
        const statsResponse = await fetch('/api/stats/global');
        if (statsResponse.ok) statsData = await statsResponse.json();
      } catch { /* offline */ }

      const final = statsData || { totalReports, inProgress, completed, activeUsers: Math.max(5, Math.floor(totalReports * 1.3)) };

      setStats([
        { label: 'Issues Reported', value: (final.totalReports || 0).toLocaleString(), icon: MapPin, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
        { label: 'In Progress', value: (final.inProgress || 0).toLocaleString(), icon: Clock, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
        { label: 'Citizens Active', value: (final.activeUsers || 0).toLocaleString(), icon: Users, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
        { label: 'Resolved', value: (final.completed || 0).toLocaleString(), icon: CheckCircle, color: 'var(--accent-green)', bg: 'var(--accent-green-subtle)' },
      ]);

      setRecentIssues(reports.slice(0, 5).map((report: any) => ({
        id: report._id || report.id,
        title: report.title,
        department: report.category || 'Public Works',
        votes: typeof report.votes === 'object' ? (report.votes?.upvotes || 0) : (report.votes || 0),
        status: report.status
      })));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalData();
    const handler = () => fetchGlobalData();
    window.addEventListener('reportStatusUpdated', handler);
    return () => window.removeEventListener('reportStatusUpdated', handler);
  }, [fetchGlobalData]);

  return (
    <div className="min-h-screen page-enter" style={{ background: 'var(--bg-base)' }}>
      {/* Animated mesh gradient background for hero only */}
      <div className="relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute" style={{
            width: '60vw', height: '60vw', top: '-10%', left: '-10%',
            background: 'radial-gradient(circle, rgba(217,75,56,0.15) 0%, transparent 60%)',
            borderRadius: '50%', filter: 'blur(60px)',
            animation: 'mesh-drift 20s ease-in-out infinite',
          }} />
          <div className="absolute" style={{
            width: '50vw', height: '50vw', top: '10%', right: '-5%',
            background: 'radial-gradient(circle, rgba(19,111,138,0.12) 0%, transparent 60%)',
            borderRadius: '50%', filter: 'blur(70px)',
            animation: 'mesh-drift 25s ease-in-out infinite reverse',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center gap-12">
          {/* Hero Content */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-up">
              <span className="badge px-3 py-1 text-xs" style={{ background: 'rgba(217,75,56,0.15)', color: '#d94b38', border: '1px solid rgba(217,75,56,0.2)' }}>
                🇮🇳 Civic Heritage Platform
              </span>
              <span className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--text-faint)' }} />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-up delay-100" style={{ color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Preserve your city's <br />
              <span style={{ color: 'var(--accent)', textShadow: '0 4px 20px rgba(217, 75, 56, 0.2)' }}>grandeur.</span>
            </h1>

            <p className="text-lg mb-8 max-w-xl animate-fade-up delay-200 font-medium" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Report civic issues seamlessly. Track real-time progress as city officials restore and maintain the infrastructure that connects our communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
              <button
                onClick={() => onReport ? onReport() : setActiveTab('report')}
                className="btn-primary fab-pulse overflow-hidden relative group"
                style={{ padding: '14px 32px', fontSize: '15px' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Report an Issue <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('feed');
                  setTimeout(() => window.dispatchEvent(new CustomEvent('showMapFromDashboard')), 100);
                }}
                className="btn-secondary"
                style={{ padding: '14px 32px', fontSize: '15px', color: 'var(--text-primary)' }}
              >
                <MapPin className="w-4 h-4" /> Live Map
              </button>
            </div>
          </div>

          {/* Artistic Monument Hero Image */}
          <div className="flex-1 w-full max-w-md animate-scale-in delay-200">
            <div className="heritage-frame heritage-pattern aspect-[4/5] w-full transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80"
                alt="Indian Architecture"
                className="w-full h-full object-cover rounded-lg opacity-90 dark:opacity-80 mix-blend-multiply dark:mix-blend-screen"
                style={{ filter: 'contrast(1.1) saturate(1.2)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <p className="text-white/90 text-[10px] font-bold tracking-widest uppercase mb-1 drop-shadow-md">A Digital India Initiative</p>
                <p className="text-white text-xl font-medium drop-shadow-md">Together, building better cities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 -mt-8 relative z-20">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-4 w-20 mb-3" />
                <div className="skeleton h-8 w-16" />
              </div>
            ))
          ) : (
            stats.map((stat, i) => {
              const IconComponent = stat.icon;
              return (
                <div key={i} className="glass-strong p-5 rounded-2xl shadow-xl animate-fade-up border" style={{ animationDelay: `${i * 80}ms`, borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: stat.bg, borderColor: 'var(--border)' }}>
                      <IconComponent className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <p className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                    <AnimatedNumber value={stat.value} />
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Unified Home & Helpline Module */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">

          {/* Recent Issues (Takes up 2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold font-serif" style={{ color: 'var(--text-primary)' }}>Community Pulse</h2>
                <div className="h-px w-12 hidden sm:block" style={{ background: 'var(--border-strong)' }} />
              </div>
              <button onClick={() => setActiveTab('feed')} className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors hover:opacity-80" style={{ color: 'var(--accent)' }}>
                View Feed <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="card overflow-hidden">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="skeleton h-4 flex-1" />
                    <div className="skeleton h-6 w-20" />
                  </div>
                ))
              ) : recentIssues.length > 0 ? (
                recentIssues.map((issue, i) => (
                  <div key={issue.id} className="group flex items-center gap-4 px-6 py-5 transition-all border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold truncate group-hover:text-accent transition-colors" style={{ color: 'var(--text-primary)' }}>{issue.title}</p>
                      <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{issue.department}</p>
                    </div>
                    <div className="flex items-center gap-5 flex-shrink-0">
                      <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-black/5 dark:bg-white/5" style={{ color: 'var(--text-secondary)' }}>{issue.votes} upvotes</span>
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-14 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-primary)' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>All caught up!</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No recent issues reported in your area.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Dial Helpline (Takes up 1/3 width) - Merged from Helpline.tsx */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif" style={{ color: 'var(--text-primary)' }}>Quick Dial</h2>

            <div className="heritage-frame heritage-pattern p-1 hidden sm:block">
              {/* Decorative structural frame */}
              <img
                src="https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80"
                alt="Delhi Architecture"
                className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 mix-blend-luminosity pointer-events-none"
              />
              <div className="relative bg-white/90 dark:bg-[#171413]/90 backdrop-blur-md rounded-xl p-5 border shadow-inner" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: 'var(--text-muted)' }}>Emergency & Services</p>

                <div className="space-y-3">
                  {HELPLINE_NUMBERS.map((line, idx) => (
                    <button
                      key={idx}
                      onClick={() => window.open(`tel:${line.num}`, '_self')}
                      className="w-full text-left group flex items-center gap-3 p-3 rounded-xl border transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--bg-panel)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center border transition-colors group-hover:bg-opacity-20" style={{ backgroundColor: `${line.color}15`, borderColor: `${line.color}30` }}>
                        <line.icon className="w-4 h-4" style={{ color: line.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>{line.dept}</p>
                        <p className="text-[15px] font-bold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>{line.num}</p>
                      </div>
                      <Phone className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" style={{ color: line.color }} />
                    </button>
                  ))}
                </div>

                <div className="mt-5 text-center px-2">
                  <p className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 py-1.5 rounded border border-red-500/20 tracking-wider">
                    For severe emergencies dial 112
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile simplified view */}
            <div className="sm:hidden space-y-3">
              {HELPLINE_NUMBERS.map((line, idx) => (
                <button
                  key={idx}
                  onClick={() => window.open(`tel:${line.num}`, '_self')}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl border bg-white dark:bg-gray-800"
                  style={{ borderColor: 'var(--border-strong)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <line.icon className="w-5 h-5" style={{ color: line.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{line.dept}</p>
                    <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{line.num}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
