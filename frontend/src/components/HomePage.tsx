import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ChevronRight, MapPin, ChevronLeft } from 'lucide-react';
import QuickDialPhone from './QuickDialPhone';
import Footer from './Footer';
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

// ── Custom Civic SVG Icons ─────────────────────────────────────────────────

const IssueReportedIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="3" rx="1" />
    <path d="M6 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="13" y2="15" />
    <circle cx="17" cy="16" r="3" />
    <path d="m19 18 1.5 1.5" />
  </svg>
);

const InProgressIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="4" fill={color} fillOpacity="0.2" />
  </svg>
);

const CitizensActiveIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
  </svg>
);

const ResolvedIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.09 6.26L20 10l-5.91 4.74L16.18 22 12 18.27 7.82 22l2.09-7.26L4 10l5.91-1.74z" fill={color} fillOpacity="0.12" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

// ── Slideshow images — landmarks from across India ─────────────────────────

const SLIDES = [
  {
    // Taj Mahal, Agra — Pexels #30638768
    url: 'https://images.pexels.com/photos/30638768/pexels-photo-30638768.jpeg?auto=compress&cs=tinysrgb&w=900',
    city: 'Agra, Uttar Pradesh',
    caption: 'Taj Mahal — Symbol of Eternal Heritage',
  },
  {
    // India Gate, New Delhi — Pexels #4143959
    url: 'https://images.pexels.com/photos/4143959/pexels-photo-4143959.jpeg?auto=compress&cs=tinysrgb&w=900',
    city: 'New Delhi',
    caption: 'India Gate — A Tribute to the Nation\'s Heroes',
  },
  {
    // Gateway of India, Mumbai — Pexels #15347824
    url: 'https://images.pexels.com/photos/15347824/pexels-photo-15347824.jpeg?auto=compress&cs=tinysrgb&w=900',
    city: 'Mumbai, Maharashtra',
    caption: 'Gateway of India — Gateway to Dreams',
  },
  {
    // Golden Temple, Amritsar — Pexels #18275863
    url: 'https://images.pexels.com/photos/18275863/pexels-photo-18275863.jpeg?auto=compress&cs=tinysrgb&w=900',
    city: 'Amritsar, Punjab',
    caption: 'Golden Temple — Beacon of Faith and Unity',
  },
  {
    // Charminar, Hyderabad — Pexels #12354645
    url: 'https://images.pexels.com/photos/12354645/pexels-photo-12354645.jpeg?auto=compress&cs=tinysrgb&w=900',
    city: 'Hyderabad, Telangana',
    caption: 'Charminar — Pride of the Deccan',
  },
];

// ── Status Badge ────────────────────────────────────────────────────────────

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

// ── Animated number counter ─────────────────────────────────────────────────

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

// ── Helpline numbers ────────────────────────────────────────────────────────



const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 350);
  }, []);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCurrent(prev => {
        const next = (prev + 1) % SLIDES.length;
        setFading(true);
        setTimeout(() => setFading(false), 350);
        return next;
      });
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const prev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  };
  const next = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    goTo((current + 1) % SLIDES.length);
  };

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
      style={{
        aspectRatio: '4/5',
        animation: 'float-bob 6s ease-in-out infinite',
        border: '1px solid rgba(217,75,56,0.18)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        background: '#1a1514',
      }}
    >
      {/* Decorative inner border */}
      <div className="absolute inset-[6px] rounded-xl pointer-events-none z-10"
        style={{ border: '1px solid rgba(229,154,47,0.22)' }} />

      {/* Slide image */}
      <img
        key={current}
        src={slide.url}
        alt={slide.city}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(1.04)' : 'scale(1)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          filter: 'contrast(1.08) saturate(1.15)',
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)' }} />

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'rgba(229,154,47,0.9)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.14em' }}
        >
          {slide.city}
        </p>
        <p
          className="text-white text-base font-medium leading-snug"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '16px' }}
        >
          {slide.caption}
        </p>
        <p
          className="text-[10px] font-semibold mt-2"
          style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.06em' }}
        >
          A Digital India Initiative
        </p>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); goTo(idx); }}
            aria-label={`Go to slide ${idx + 1}`}
            className="rounded-full transition-all"
            style={{
              width: idx === current ? '18px' : '6px',
              height: '6px',
              background: idx === current ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ── How It Works strip ──────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="12" y1="7" x2="12" y2="13" />
      </svg>
    ),
    title: 'Report an Issue',
    desc: 'Submit civic problems — potholes, broken lights, garbage — with photos and your location in under 60 seconds.',
  },
  {
    step: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Track in Real-Time',
    desc: 'Follow your report through each stage — acknowledged, assigned, in-progress — with live status updates.',
  },
  {
    step: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'See It Resolved',
    desc: 'Get notified when your city takes action. Rate the resolution and earn community recognition.',
  },
];

// ── Community Pulse Sub-components ─────────────────────────────────────────

const TRENDING = [
  { label: 'Road & Pothole', count: 214, pct: 87, color: 'var(--accent)' },
  { label: 'Water Supply', count: 178, pct: 72, color: 'var(--accent-blue)' },
  { label: 'Garbage & Waste', count: 143, pct: 58, color: 'var(--accent-green)' },
  { label: 'Streetlight Fault', count: 96, pct: 39, color: 'var(--accent-yellow)' },
];

const TrendingIssues: React.FC = () => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>🔥 Trending This Week</h3>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--text-faint)', fontWeight: 500 }}>City-wide</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {TRENDING.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{item.count}</span>
          </div>
          <div style={{ height: '5px', borderRadius: '100px', background: 'var(--bg-subtle)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${item.pct}%`, borderRadius: '100px', background: item.color, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MILESTONES = [
  { title: 'Pothole repaired on MG Road', where: 'Central District', when: '2h ago', icon: '🛣️', dept: 'Roads Dept.' },
  { title: 'Water tanker deployed — Sector 12', where: 'East Zone', when: '5h ago', icon: '💧', dept: 'Water Supply' },
  { title: 'Broken streetlight fixed', where: 'South Market', when: '1d ago', icon: '💡', dept: 'Electricity' },
];

const RecentMilestones: React.FC = () => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', margin: 0 }}>🏆 Recent Milestones</h3>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--text-faint)', fontWeight: 500 }}>Just resolved</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {MILESTONES.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 6px', borderRadius: '10px', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent-green-subtle)', border: '1px solid rgba(41,141,108,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>{m.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--text-faint)', margin: 0 }}>{m.where} · {m.dept}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
            <span style={{ padding: '2px 7px', borderRadius: '100px', background: 'var(--accent-green-subtle)', fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, color: 'var(--accent-green)' }}>✓ Done</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: 'var(--text-faint)' }}>{m.when}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Main Component ──────────────────────────────────────────────────────────

const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onReport }) => {
  const [stats, setStats] = useState([
    { label: 'Issues Reported', value: '0', Icon: IssueReportedIcon, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
    { label: 'In Progress', value: '0', Icon: InProgressIcon, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
    { label: 'Citizens Active', value: '0', Icon: CitizensActiveIcon, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
    { label: 'Resolved', value: '0', Icon: ResolvedIcon, color: 'var(--accent-green)', bg: 'var(--accent-green-subtle)' },
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
        { label: 'Issues Reported', value: (final.totalReports || 0).toLocaleString(), Icon: IssueReportedIcon, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
        { label: 'In Progress', value: (final.inProgress || 0).toLocaleString(), Icon: InProgressIcon, color: 'var(--accent)', bg: 'var(--accent-subtle)' },
        { label: 'Citizens Active', value: (final.activeUsers || 0).toLocaleString(), Icon: CitizensActiveIcon, color: 'var(--accent-blue)', bg: 'var(--accent-blue-subtle)' },
        { label: 'Resolved', value: (final.completed || 0).toLocaleString(), Icon: ResolvedIcon, color: 'var(--accent-green)', bg: 'var(--accent-green-subtle)' },
      ]);

      setRecentIssues(reports.slice(0, 5).map((report: any) => ({
        id: report._id || report.id,
        title: report.title,
        department: report.category || 'Public Works',
        votes: typeof report.votes === 'object' ? (report.votes?.upvotes || 0) : (report.votes || 0),
        status: report.status,
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
    <div className="page-enter" style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--bg-base)', paddingBottom: '0' }}
      >
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute" style={{
            width: '60vw', height: '60vw', top: '-10%', left: '-10%',
            background: 'radial-gradient(circle, rgba(217,75,56,0.13) 0%, transparent 60%)',
            borderRadius: '50%', filter: 'blur(70px)',
            animation: 'mesh-drift 22s ease-in-out infinite',
          }} />
          <div className="absolute" style={{
            width: '50vw', height: '50vw', top: '5%', right: '-5%',
            background: 'radial-gradient(circle, rgba(19,111,138,0.11) 0%, transparent 60%)',
            borderRadius: '50%', filter: 'blur(80px)',
            animation: 'mesh-drift 28s ease-in-out infinite reverse',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center gap-14">

          {/* ── Left: Hero content ─────────────────────────────────────── */}
          <div className="flex-1 max-w-2xl">
            {/* Pre-badge */}
            <div className="flex items-center gap-3 mb-7 animate-fade-up">
              <span className="badge px-3 py-1.5 text-xs font-semibold tracking-wide"
                style={{ background: 'rgba(217,75,56,0.12)', color: '#d94b38', border: '1px solid rgba(217,75,56,0.22)', borderRadius: '100px' }}>
                🇮🇳 Civic Heritage Platform
              </span>
              <span className="h-px flex-1 max-w-[80px]" style={{ background: 'var(--text-faint)' }} />
            </div>

            {/* Headline — DM Serif Display */}
            <h1
              className="mb-6 animate-fade-up delay-100"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
                fontWeight: 400,
                lineHeight: 1.12,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
              }}
            >
              Preserve your city's <br />
              <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>grandeur.</span>
            </h1>

            {/* Sub-headline — DM Sans */}
            <p
              className="mb-9 animate-fade-up delay-200"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '1.05rem',
                fontWeight: 400,
                color: 'var(--text-muted)',
                lineHeight: 1.75,
                maxWidth: '500px',
              }}
            >
              Report civic issues seamlessly. Track real-time progress as city
              officials restore and maintain the infrastructure that connects
              our communities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
              <button
                onClick={() => onReport ? onReport() : setActiveTab('report')}
                className="btn-primary fab-pulse overflow-hidden relative group"
                style={{
                  padding: '13px 30px',
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}
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
                style={{
                  padding: '13px 30px',
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                <MapPin className="w-4 h-4" /> Live Map
              </button>
            </div>

            {/* Trust signal strip */}
            <div className="flex items-center gap-6 mt-10 animate-fade-up delay-400">
              {[
                { label: 'Verified Reports', icon: '🛡️' },
                { label: 'Government Backed', icon: '🏛️' },
                { label: 'ISO 27001 Secure', icon: '🔒' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="text-sm">{item.icon}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.04em' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Animated Image Carousel ───────────────────────── */}
          <div className="flex-1 w-full max-w-[380px] animate-scale-in delay-200">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-6 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-4 w-20 mb-3" />
                <div className="skeleton h-8 w-16" />
              </div>
            ))
          ) : (
            stats.map((stat, i) => (
              <div
                key={i}
                className="glass-strong p-5 rounded-2xl shadow-xl animate-fade-up border"
                style={{ animationDelay: `${i * 80}ms`, borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </p>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border"
                    style={{ background: stat.bg, borderColor: 'var(--border)' }}
                  >
                    <stat.Icon color={stat.color} />
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: 'var(--text-primary)',
                  }}
                >
                  <AnimatedNumber value={stat.value} />
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── How It Works strip ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.14em' }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            Three steps to a better city.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div
              key={i}
              className="card p-7 flex flex-col gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  {item.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '3rem',
                    fontWeight: 400,
                    color: 'var(--border-strong)',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {item.step}
                </span>
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'var(--text-muted)',
                    lineHeight: 1.65,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Community Pulse + Quick Dial ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Recent Issues — 2/3 width */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                  }}
                >
                  Community Pulse
                </h2>
                <div className="h-px w-12 hidden sm:block" style={{ background: 'var(--border-strong)' }} />
              </div>
              <button
                onClick={() => setActiveTab('feed')}
                className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)', fontFamily: "'DM Sans', sans-serif", fontSize: '11px' }}
              >
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
                recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="group flex items-center gap-4 px-6 py-5 transition-all border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate group-hover:text-accent transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {issue.title}
                      </p>
                      <p
                        className="mt-0.5"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}
                      >
                        {issue.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {issue.votes} upvotes
                      </span>
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--accent-subtle)', border: '1px solid rgba(217,75,56,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📋</div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>No issues reported yet</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-faint)', margin: 0 }}>Be the first to report a civic issue in your area.</p>
                  </div>
                  <button
                    onClick={() => onReport ? onReport() : setActiveTab('report')}
                    className="btn-primary"
                    style={{ padding: '9px 20px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                  >
                    Report Now →
                  </button>
                </div>
              )}
            </div>

            {/* ── Two insight cards inside the left column, side by side ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, gridAutoRows: '1fr' }}>
              <div className="card p-5" style={{ borderColor: 'var(--border)', height: '100%' }}>
                <TrendingIssues />
              </div>
              <div className="card p-5" style={{ borderColor: 'var(--border)', height: '100%' }}>
                <RecentMilestones />
              </div>
            </div>

          </div>{/* end lg:col-span-2 */}

          {/* Quick Dial — 1/3 width */}
          <QuickDialPhone />

        </div>{/* end lg:grid-cols-3 */}
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default HomePage;
