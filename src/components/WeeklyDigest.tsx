import React, { useEffect, useRef } from 'react';
import { TrendingUp, Calendar, ExternalLink, MapPin } from 'lucide-react';
import { apiService } from '../services/api';

declare global {
  interface Window {
    L: any;
  }
}

const WeeklyDigest: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Load Leaflet and initialize map
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initGtaMap;
      document.head.appendChild(script);
    } else {
      initGtaMap();
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const initGtaMap = async () => {
    if (!mapRef.current || mapInstance.current) return;

    // GTA Style Map initialization
    const map = window.L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([23.3441, 85.3096], 13); // Zoomed out slightly to see the region

    // Fix a common issue where Leaflet renders grey tiles if container size isn't computed 
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    mapInstance.current = map;

    // The magic GTA standard dark-mode radar filter on CartoDB Dark Matter
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Center "Player" Blip (User location or region center)
    const playerIcon = window.L.divIcon({
      html: `
        <div style="position: relative; flex: 1; display: flex; align-items: center; justify-content: center;">
          <div style="width: 14px; height: 14px; background: white; border-radius: 50%; border: 3px solid #3b82f6; box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6; z-index: 10;"></div>
          <div style="position: absolute; width: 40px; height: 40px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        </div>
      `,
      className: 'gta-player-blip',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    window.L.marker([23.3441, 85.3096], { icon: playerIcon }).addTo(map);

    // Fetch and plot real ServiceNow incidents
    try {
      const reports = await apiService.getReports();
      reports.forEach((report: any) => {
        const lat = report.location?.coordinates?.latitude || report.lat || 23.3441 + (Math.random() - 0.5) * 0.05;
        const lng = report.location?.coordinates?.longitude || report.lng || 85.3096 + (Math.random() - 0.5) * 0.05;
        const status = report.status?.toLowerCase() || 'pending';

        // Color coding based on status
        let color = '#ef4444'; // Red for pending/new
        if (status === 'resolved' || status === 'completed' || status === 'closed') {
          color = '#10b981'; // Green for resolved
        } else if (status === 'in-progress' || status === 'in_progress' || status === 'active' || status === 'assigned') {
          color = '#f59e0b'; // Amber for in-progress
        }

        const blipIcon = window.L.divIcon({
          html: `<div style="width: 10px; height: 10px; background: ${color}; border-radius: 50%; box-shadow: 0 0 8px ${color}, inset 0 0 4px #000;"></div>`,
          className: 'gta-issue-blip',
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });

        window.L.marker([lat, lng], { icon: blipIcon }).addTo(map);
      });
    } catch (err) {
      console.error('Failed to load incidents for radar map:', err);
    }
  };

  return (
    <div className="card p-5 border shadow-sm" style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
          <Calendar className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Weekly Digest</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="text-center p-2 rounded-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--accent-blue)' }}>247</div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Messages</div>
        </div>
        <div className="text-center p-2 rounded-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>12</div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Viral</div>
        </div>
        <div className="text-center p-2 rounded-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>5</div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Resolved</div>
        </div>
      </div>

      {/* Live India News */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Live India News</h4>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden relative group border" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
          <a href="https://timesofindia.indiatimes.com/india/amit-shah-unveils-mascots-pragati-and-vikas-for-indias-first-digital-census/articleshow/129127254.cms" target="_blank" rel="noopener noreferrer" className="block relative h-40">
            <img src="https://static.toiimg.com/photo/msid-129127288,imgsize-45142.cms" alt="Amit Shah unveils mascots" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">Amit Shah unveils mascots ‘Pragati’ and ‘Vikas’ for India’s first digital Census</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-300">Times of India · 02:38 AM</p>
                <ExternalLink className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Trending This Week */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
          Trending This Week
        </h4>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors cursor-pointer" style={{ background: 'var(--bg-elevated)' }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent-green)' }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold line-clamp-2 leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>Road repair completed on MG Road</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-green)' }}>156 votes</span>
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border-strong)' }}></span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Infrastructure</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors cursor-pointer" style={{ background: 'var(--bg-elevated)' }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent-green)' }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold line-clamp-2 leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>New traffic signal installed</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-green)' }}>89 votes</span>
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border-strong)' }}></span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Safety</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors cursor-pointer" style={{ background: 'var(--bg-elevated)' }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent-green)' }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold line-clamp-2 leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>Water supply restored in Sector 5</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-green)' }}>67 votes</span>
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border-strong)' }}></span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Utilities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GTA Radar Mini Map (Moved to Bottom) ── */}
      <div className="relative group cursor-pointer pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3 mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text- primary)' }}>
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
            Local Radar
          </h4>
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)' }}>Live Service DB</span>
        </div>
        <div className="rounded-xl overflow-hidden relative border-2"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {/* Subtle radar sweep animation overlay */}
          <div className="absolute inset-x-0 h-1/2 top-0 origin-bottom bg-gradient-to-t from-[rgba(59,130,246,0.1)] to-transparent opacity-30 z-20 pointer-events-none animate-[spin_4s_linear_infinite]" style={{ borderBottom: '1px solid rgba(59,130,246,0.3)' }} />

          <div ref={mapRef} className="w-full h-64 rounded-xl" />
        </div>

      </div>
    </div>
  );
};

export default WeeklyDigest;