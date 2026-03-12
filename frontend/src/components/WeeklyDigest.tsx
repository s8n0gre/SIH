import React, { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import MapComponent from './MapComponent';

const newsItems = [
  {
    title: "PM Modi launches new digital infrastructure initiative for rural India",
    url: "https://timesofindia.indiatimes.com",
    image: "https://picsum.photos/seed/news1/400/300",
    source: "Times of India",
    time: "Just now"
  },
  {
    title: "India's GDP growth projected at 6.8% for FY25, says Economic Survey",
    url: "https://timesofindia.indiatimes.com",
    image: "https://picsum.photos/seed/news2/400/300",
    source: "Economic Times",
    time: "15 min ago"
  },
  {
    title: "New metro line inaugurated in Mumbai, connecting suburbs to city center",
    url: "https://timesofindia.indiatimes.com",
    image: "https://picsum.photos/seed/news3/400/300",
    source: "Mumbai Mirror",
    time: "1 hour ago"
  }
];

const communities = [
  { name: 'Municipal', members: '12K', color: '#136f8a', bg: '#e6f4f8' },
  { name: 'Citizens', members: '8K', color: '#d94b38', bg: '#fce8e6' },
  { name: 'Safety', members: '3K', color: '#2d9e5f', bg: '#e6f7ee' },
];

const WeeklyDigest: React.FC = () => {
  const [locationTrigger, setLocationTrigger] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentNews = newsItems[currentNewsIndex];

  return (
    <div className="card p-3 lg:p-5 border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* 1. Header & Live Indicator */}
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Weekly Digest</h3>
        </div>
        <div className="px-2 py-0.5 rounded flex items-center gap-1 bg-green-500/10 text-green-600 text-[9px] font-bold lg:text-[10px]">
          <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> LIVE
        </div>
      </div>

      {/* 2. Stats Grid (ALWAYS at top) */}
      <div className="grid grid-cols-3 gap-1.5 py-1 mb-4 border-t lg:border-none" style={{ borderColor: 'var(--border)' }}>
        {[
          { label: 'Alerts', val: '247', color: 'var(--accent-blue)' },
          { label: 'Trending', val: '12', color: 'var(--accent-green)' },
          { label: 'Solved', val: '5', color: 'var(--accent)' },
        ].map(stat => (
          <div key={stat.label} className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl border text-center transition-all hover:bg-[var(--bg-elevated)]" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
            <div className="text-[11px] lg:text-sm font-black" style={{ color: stat.color }}>{stat.val}</div>
            <div className="text-[6px] lg:text-[8px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 3. Horizontal Row (Mobile) / Vertical Stack (Desktop) */}
      <div className="flex flex-row lg:flex-col gap-3 lg:gap-6 items-center lg:items-center">
        
        {/* LEFT: HOT GROUPS (on mobile only) */}
        <div className="flex-1 lg:hidden order-1">
          <h4 className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-2" style={{ color: 'var(--text-primary)' }}>Hot Groups</h4>
          <div className="grid grid-cols-1 gap-1.5">
            {communities.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 p-1 rounded-lg border border-transparent hover:border-[var(--border)] transition-all cursor-pointer bg-[var(--bg-panel)] group">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[8px] flex-shrink-0" style={{ background: c.bg, color: c.color }}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                </div>
                <button className="text-[7px] font-black uppercase px-1 py-0.5 rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] transition-all hover:scale-110 active:scale-95">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: NEWS SECTION (on mobile) / TOP (on desktop) */}
        <div className="flex-[1.5] lg:flex-1 text-center lg:text-left order-2 lg:order-1 w-full lg:w-full">
            <h4 className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2" style={{ color: 'var(--text-primary)' }}>Flash Updates</h4>
            <a href={currentNews.url} target="_blank" rel="noopener noreferrer" className="block group w-full">
              <div className="relative rounded-lg lg:rounded-xl overflow-hidden border shadow-sm mb-1.5 mx-auto lg:mx-0 w-full h-16 lg:h-auto lg:aspect-video" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                <img src={currentNews.image} alt={currentNews.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 lg:bg-gradient-to-t lg:from-black/60 lg:to-transparent" />
              </div>
              <p className="text-[9px] lg:text-[11px] font-bold line-clamp-2 leading-tight" style={{ color: 'var(--text-primary)' }}>{currentNews.title}</p>
            </a>
        </div>

        {/* RIGHT: MAP (on mobile) / BOTTOM (on desktop) */}
        <div className="flex-1 lg:w-full order-3 lg:order-3 lg:mt-6">
          <div className="relative mx-auto w-20 h-20 lg:w-[350px] lg:h-[350px] aspect-square">
              {/* Marching Ants Circle */}
              <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none z-0" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="2.5" pathLength="100" strokeDasharray="1 3.5" strokeLinecap="round" className="opacity-60 text-[var(--accent)]">
                  <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="50s" repeatCount="indefinite" />
                </circle>
              </svg>
              
              <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl z-10 border-2" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <MapComponent height="100%" showReports={true} interactive={true} hideControls={true} centerOnUserTrigger={locationTrigger} />
              </div>

              {/* Controls */}
              <button onClick={() => setLocationTrigger(prev => prev + 1)} className="absolute -top-1 -right-1 lg:top-4 lg:right-4 p-1 lg:p-2 bg-white dark:bg-black lg:bg-white/90 lg:backdrop-blur rounded-full shadow-lg border z-20 transition-all hover:scale-110 active:scale-95" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
                  <User size={12} className="lg:hidden" />
                  <User size={20} className="hidden lg:block" />
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeeklyDigest;
