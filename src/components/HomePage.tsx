import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

// Local wallpaper imports — Vite bundles these at build time
import imgTajMahal from '../assets/wallpapers/taj_mahal.jpg';
import imgRedFort from '../assets/wallpapers/red_fort.jpg';
import imgIndiaGate from '../assets/wallpapers/india_gate.jpg';
import imgGatewayIndia from '../assets/wallpapers/gateway_india.jpg';
import imgLotusTemple from '../assets/wallpapers/lotus_temple.jpg';

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

const SLIDES = [
  { src: imgTajMahal, caption: 'Taj Mahal, Agra' },
  { src: imgRedFort, caption: 'Red Fort, Delhi' },
  { src: imgIndiaGate, caption: 'India Gate, Delhi' },
  { src: imgGatewayIndia, caption: 'Gateway of India, Mumbai' },
  { src: imgLotusTemple, caption: 'Lotus Temple, Delhi' },
];

const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onReport }) => {
  const [stats, setStats] = useState([
    { label: 'Issues Reported', value: '0', icon: MapPin, color: 'text-blue-600' },
    { label: 'In Progress', value: '0', icon: Clock, color: 'text-yellow-600' },
    { label: 'Citizens Active', value: '0', icon: Users, color: 'text-purple-600' },
    { label: 'Resolved', value: '0', icon: CheckCircle, color: 'text-green-600' },
  ]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, []);

  const fetchGlobalData = useCallback(async () => {
    try {
      const reports = await apiService.getReports();
      const totalReports = reports.length;
      const inProgress = reports.filter((r: any) => r.status === 'in-progress').length;
      const completed = reports.filter((r: any) => r.status === 'completed').length;
      const pending = reports.filter((r: any) => r.status === 'pending').length;

      let statsData = null;
      try {
        const statsResponse = await fetch('http://localhost:5000/api/stats/global');
        if (statsResponse.ok) statsData = await statsResponse.json();
      } catch { /* offline */ }

      const finalStats = statsData || { totalReports, inProgress, completed, pending, activeUsers: Math.max(5, Math.floor(totalReports * 1.3)) };

      setStats([
        { label: 'Issues Reported', value: finalStats.totalReports?.toLocaleString() || '0', icon: MapPin, color: 'text-blue-600' },
        { label: 'In Progress', value: finalStats.inProgress?.toLocaleString() || '0', icon: Clock, color: 'text-yellow-600' },
        { label: 'Citizens Active', value: finalStats.activeUsers?.toLocaleString() || '0', icon: Users, color: 'text-purple-600' },
        { label: 'Resolved', value: finalStats.completed?.toLocaleString() || '0', icon: CheckCircle, color: 'text-green-600' },
      ]);

      setRecentIssues(reports.slice(0, 4).map((report: any) => ({
        id: report._id || report.id,
        title: report.title,
        department: report.category || 'Public Works',
        votes: typeof report.votes === 'object'
          ? (report.votes?.upvotes || 0) + (report.votes?.downvotes || 0)
          : (report.votes || Math.floor(Math.random() * 30)),
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
    const handleReportUpdate = () => fetchGlobalData();
    window.addEventListener('reportStatusUpdated', handleReportUpdate);
    return () => window.removeEventListener('reportStatusUpdated', handleReportUpdate);
  }, [fetchGlobalData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'Completed': return 'text-green-600 bg-green-50';
      case 'in-progress': case 'In Progress': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen relative">

      {/* ── Fixed wallpaper background ── Stays behind ALL content ── */}
      <div className="fixed inset-0" style={{ zIndex: -2 }}>
        {SLIDES.map((slide, idx) => (
          <img
            key={idx}
            src={slide.src}
            alt={slide.caption}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-2000"
            style={{ opacity: idx === currentSlide ? 1 : 0 }}
          />
        ))}
        {/* Semi-transparent dark overlay */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* ── Scrollable page content ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero */}
        <div className="mb-8 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
              🇮🇳 LokSetu
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">
            Report Municipal Issues with Ease
          </h1>
          <p className="text-lg text-white/85 mb-6 max-w-2xl drop-shadow">
            Help improve your community by reporting issues directly to the relevant departments.
            Track progress and see real-time updates on resolution status.
          </p>
          {/* Indian tricolor accent */}
          <div className="flex mb-6 rounded-full overflow-hidden w-48 h-1.5">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-green-600" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onReport ? onReport() : setActiveTab('report')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:scale-105"
            >
              Report an Issue
            </button>
            <button
              onClick={() => {
                setActiveTab('feed');
                setTimeout(() => window.dispatchEvent(new CustomEvent('showMapFromDashboard')), 100);
              }}
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-colors backdrop-blur-sm"
            >
              View Map
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-md p-6 rounded-xl border border-white/30 animate-pulse">
                <div className="h-4 bg-white/30 rounded w-20 mb-2" />
                <div className="h-8 bg-white/30 rounded w-16" />
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/15 backdrop-blur-md p-6 rounded-xl border border-white/30 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, color: 'bg-orange-500/80', title: '1. Report Issue', desc: "Submit photos, location, and description of the issue you've encountered." },
              { icon: Users, color: 'bg-white/30', title: '2. Community Votes', desc: 'Citizens vote on issues to help prioritize them based on urgency and impact.' },
              { icon: CheckCircle, color: 'bg-green-600/80', title: '3. Track Progress', desc: 'Monitor the status of your reports and receive updates when issues are resolved.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="text-center">
                <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4 shadow`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/75">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Issues</h2>
            <button onClick={() => setActiveTab('feed')} className="text-orange-300 hover:text-orange-200 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-white/20 rounded-xl animate-pulse">
                  <div className="h-5 bg-white/20 rounded w-48" />
                  <div className="h-6 bg-white/20 rounded w-20" />
                </div>
              ))
            ) : recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-4 border border-white/20 rounded-xl"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{issue.title}</h3>
                    <p className="text-sm text-white/60 mt-0.5">Dept: {issue.department}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-sm font-medium text-white">{issue.votes}</p>
                      <p className="text-xs text-white/50">votes</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/50">
                <p>No recent issues to display</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
