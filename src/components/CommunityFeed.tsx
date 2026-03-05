import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle, MapPin, User, Plus, X, Camera, Trash2, Search, Filter, ChevronDown, Share2, Download, Repeat, Flag, MoreHorizontal } from 'lucide-react';
import { apiService } from '../services/api';
import { i18n } from '../services/i18n';
import { useUserLocation } from '../hooks/useUserLocation';
import NotificationModal from './NotificationModal';
import LocalMap from './LocalMap';
import QuickHelpline from './QuickHelpline';
import WeeklyDigest from './WeeklyDigest';
import WeatherBanner from './WeatherBanner';
import ashokaChakra from '../assets/ashoka_chakra.svg';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  votes: number;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  submitted: string;
  department: string;
  author: string;
  distance?: number;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

const CommunityFeed: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const location = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    images: [] as File[]
  });
  const [friends, setFriends] = useState<any[]>([]);
  const currentUser = JSON.parse(localStorage.getItem('civicUser') || '{}');
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  const userRole = 'user';
  const [, forceUpdate] = useState({});
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<{ isOpen: boolean, type: 'success' | 'error' | 'warning' | 'info', title: string, message: string }>({ isOpen: false, type: 'info', title: '', message: '' });
  const [showCommunityList, setShowCommunityList] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState<{ [key: string]: boolean }>({});
  const [showMapModal, setShowMapModal] = useState(false);
  const [hasActiveModal, setHasActiveModal] = useState(false);
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});

  const getImageIndex = (reportId: string) => imageIndexes[reportId] || 0;
  const setImageIndex = (reportId: string, index: number) =>
    setImageIndexes(prev => ({ ...prev, [reportId]: index }));

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showCommunityList && !target.closest('.community-dropdown')) {
        setShowCommunityList(false);
      }
      // Close post menus
      if (Object.values(showPostMenu).some(Boolean) && !target.closest('.post-menu-container')) {
        setShowPostMenu({});
      }
    };

    const handleShowMap = () => {
      setShowMapModal(true);
      setHasActiveModal(true);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('showMapFromDashboard', handleShowMap);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('showMapFromDashboard', handleShowMap);
    };
  }, [showCommunityList, showPostMenu]);

  const handleShare = async (report: Report) => {
    if (navigator.share) {
      await navigator.share({
        title: report.title,
        text: report.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${report.title}\n${report.description}\n${window.location.href}`);
      setNotification({ isOpen: true, type: 'success', title: 'Copied', message: 'Post link copied to clipboard' });
    }
  };

  const handleDownload = (report: Report) => {
    const content = `Title: ${report.title}\nDescription: ${report.description}\nLocation: ${report.location}\nStatus: ${report.status}\nDepartment: ${report.department}\nSubmitted: ${report.submitted}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRepost = (report: Report) => {
    const repost: Report = {
      ...report,
      id: Date.now().toString(),
      author: 'You',
      submitted: new Date().toLocaleDateString(),
      title: `Repost: ${report.title}`,
      votes: 0,
      upvotes: 0,
      downvotes: 0,
      comments: []
    };
    setReports(prev => [repost, ...prev]);
    setNotification({ isOpen: true, type: 'success', title: 'Reposted', message: 'Post has been shared to your timeline' });
  };

  const handleReport = (report: Report) => {
    setNotification({ isOpen: true, type: 'warning', title: 'Report Submitted', message: 'This post has been reported for review by moderators' });
  };

  const togglePostMenu = (reportId: string) => {
    setShowPostMenu(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const currentCommunities = [
    { name: `${location.city} Municipal`, icon: '🏛️', active: true },
    { name: 'Local Residents', icon: '🏠', active: true },
    { name: 'Public Safety', icon: '🚨', active: true }
  ];

  const availableCommunities = [
    { name: `${location.region} Citizens`, icon: '🌍', members: '8.2K' },
    { name: 'Environment Watch', icon: '🌱', members: '2.9K' },
    { name: 'Transport Hub', icon: '🚌', members: '4.1K' },
    { name: 'Healthcare Alert', icon: '🏥', members: '3.5K' },
    { name: 'Education Forum', icon: '📚', members: '2.1K' }
  ];

  // Simulated activity removed — updates are now manual (pull-to-refresh)

  // Role is hardcoded in this component; no need to listen for role changes.

  const categories = ['all', 'Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety', 'Other'];

  useEffect(() => {
    // Load from localStorage first, then fetch from API
    const savedReports = localStorage.getItem('communityReports');
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
        setLoading(false);
      } catch (e) {
        console.error('Error parsing saved reports:', e);
      }
    }

    fetchReports();

    // Listen for admin status updates (triggered by explicit actions only)
    const handleReportUpdate = () => {
      console.log('Admin updated report status, refreshing community feed...');
      fetchReports();
    };

    window.addEventListener('reportStatusUpdated', handleReportUpdate);

    return () => {
      window.removeEventListener('reportStatusUpdated', handleReportUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      const id = currentUser?.id || currentUser?._id;
      if (!id) return;
      try {
        const res = await fetch(`${API_BASE}/api/friends/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFriends(data);
        }
      } catch (err) {
        // silently ignore offline mode
      }
    };
    fetchFriends();
  }, [currentUser?.id, currentUser?._id, API_BASE]);

  // (duplicate role listener removed)

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await apiService.getReports();

      // Transform API data to match our interface
      const transformedReports = data.map((report: any) => ({
        id: report._id || report.id || Date.now().toString(),
        title: report.title,
        description: report.description,
        category: report.category,
        location: report.location?.address || report.location || 'Unknown location',
        coordinates: {
          lat: report.location?.coordinates?.latitude || 23.3441,
          lng: report.location?.coordinates?.longitude || 85.3096
        },
        images: report.images || report.imageUrls || report.attachments || [],
        status: (() => {
          const s = report.status?.toLowerCase();
          if (s === 'resolved' || s === 'completed') return 'completed';
          if (s === 'in-progress' || s === 'in_progress' || s === 'assigned') return 'in-progress';
          if (s === 'rejected') return 'rejected';
          if (s === 'open' || s === 'pending') return 'pending';
          return 'pending';
        })(),
        votes: (report.votes?.upvotes || 0) - (report.votes?.downvotes || 0),
        upvotes: report.votes?.upvotes || 0,
        downvotes: report.votes?.downvotes || 0,
        comments: (report.comments || []).map((c: any) => ({
          id: c._id || c.id || Date.now().toString(),
          text: c.text,
          author: c.user?.username || c.author || 'Anonymous',
          timestamp: new Date(c.timestamp || c.createdAt).toLocaleTimeString(),
          replies: []
        })),
        submitted: new Date(report.createdAt).toLocaleDateString(),
        department: report.department || 'Public Works',
        author: report.reportedBy?.username || report.author || 'Anonymous'
      }));

      setReports(transformedReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      // Fallback to demo data if API fails
      setReports([
        {
          id: 'demo-1',
          title: 'Water Leakage on Station Road',
          description: 'Major water pipe burst causing flooding on the main road',
          category: 'Water Services',
          location: `Station Road, ${location.city}, ${location.region}`,
          coordinates: { lat: 23.3441, lng: 85.3096 },
          images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'],
          status: 'in-progress',
          votes: 22,
          upvotes: 23,
          downvotes: 1,
          comments: [],
          submitted: new Date(Date.now() - 3600000).toLocaleDateString(),
          department: 'Water Department',
          author: `${location.city.replace(/\s+/g, '')}Resident`
        },
        {
          id: 'demo-2',
          title: 'Broken Traffic Signal',
          description: 'Traffic signal at busy intersection has been malfunctioning for 2 days',
          category: 'Public Safety',
          location: `Albert Ekka Chowk, ${location.city}, ${location.region}`,
          coordinates: { lat: 23.3629, lng: 85.3346 },
          images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'],
          status: 'pending',
          votes: 18,
          upvotes: 18,
          downvotes: 0,
          comments: [],
          submitted: new Date(Date.now() - 7200000).toLocaleDateString(),
          department: 'Traffic Department',
          author: 'SafetyFirst'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId: string, isSimulated = false) => {
    // Update UI immediately
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        const newUpvotes = report.upvotes + 1;
        return {
          ...report,
          upvotes: newUpvotes,
          votes: newUpvotes - report.downvotes
        };
      }
      return report;
    }));

    // Save to database
    try {
      await apiService.voteOnReport(reportId, 'up');
    } catch (error) {
      console.error('Failed to save vote to database:', error);
    }
  };

  const addComment = async (reportId: string, comment: Comment) => {
    // Update UI immediately
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          comments: [...report.comments, comment]
        };
      }
      return report;
    }));

    // Save to database
    try {
      // For API compatibility, we'll store comment text
      const response = await fetch('http://localhost:5000/api/reports/' + reportId + '/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'anonymous'}`
        },
        body: JSON.stringify({ text: comment.text })
      });

      if (!response.ok) {
        console.error('Failed to save comment to database');
      }
    } catch (error) {
      console.error('Failed to save comment to database:', error);
    }
  };

  const handleAddComment = async (reportId: string) => {
    const text = commentTexts[reportId]?.trim();
    if (!text) return;

    const currentUser = localStorage.getItem('currentUser') || 'Anonymous';
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author: currentUser,
      timestamp: new Date().toLocaleTimeString(),
      replies: []
    };

    await addComment(reportId, newComment);
    setCommentTexts(prev => ({ ...prev, [reportId]: '' }));
  };

  const toggleComments = (reportId: string) => {
    setShowComments(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };



  const confirmDelete = async (reportId: string) => {
    try {
      localStorage.setItem('authToken', 'sys_admin_token');
      await apiService.deleteReport(reportId);
      setReports(prev => prev.filter(report => report.id !== reportId));
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Record Deleted',
        message: 'The record has been successfully removed from the database.'
      });
    } catch (error) {
      console.error('Failed to delete from database:', error);

      if (reportId.startsWith('demo-')) {
        setReports(prev => prev.filter(report => report.id !== reportId));
        setNotification({
          isOpen: true,
          type: 'info',
          title: 'Demo Record Removed',
          message: 'Demo record removed locally. Demo records are not stored in the database.'
        });
      } else {
        setReports(prev => prev.filter(report => report.id !== reportId));
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'Deletion Warning',
          message: 'Record removed locally. Database deletion may have failed - please verify in system records.'
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-orange-600 bg-orange-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* ── Ashoka Chakra Watermark ── */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
        <svg viewBox="0 0 200 200" className="w-[420px] h-[420px] opacity-[0.07] dark:opacity-[0.04]" fill="none">
          {/* Outer ring */}
          <circle cx="100" cy="100" r="96" stroke="#00008B" strokeWidth="5" fill="none" />
          <circle cx="100" cy="100" r="84" stroke="#00008B" strokeWidth="1.5" fill="none" />
          {/* Hub */}
          <circle cx="100" cy="100" r="10" fill="#00008B" />
          <circle cx="100" cy="100" r="5" fill="white" />
          {/* 24 spokes */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 10 * Math.cos(rad);
            const y1 = 100 + 10 * Math.sin(rad);
            const x2 = 100 + 84 * Math.cos(rad);
            const y2 = 100 + 84 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00008B" strokeWidth="2" strokeLinecap="round" />;
          })}
          {/* Spoke tips — small circles at outer ring */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x = 100 + 84 * Math.cos(rad);
            const y = 100 + 84 * Math.sin(rad);
            return <circle key={`tip-${i}`} cx={x} cy={y} r="2.5" fill="#00008B" />;
          })}
        </svg>
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24 dark:bg-transparent ${(hasActiveModal || showReportModal) && !showMapModal ? 'blur-sm' : ''} transition-all duration-300`}>
        {/* Weather Banner */}
        <div className="mb-6">
          <WeatherBanner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Other Communities */}
          <div className={`hidden lg:block transition-all duration-300 ${hasActiveModal || showReportModal || showMapModal ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100'}`}>
            <WeeklyDigest />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Other Communities</h3>
              <div className="space-y-3">
                {[
                  { name: `${location.city} Municipal`, members: '12.5K' },
                  { name: `${location.region} Citizens`, members: '8.2K' },
                  { name: 'Local Residents', members: '5.1K' },
                  { name: 'Public Safety', members: '3.8K' },
                  { name: 'Environment Watch', members: '2.9K' }
                ].map((community, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">{community.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{community.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{community.members} members</p>
                      </div>
                    </div>
                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Map */}
            <LocalMap />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">


            {/* Header */}
            <div className="mb-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      Community Reports
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">ACTIVE</span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stay informed about local issues • {reports.length} active reports</p>
                  </div>

                  {/* Community Icons */}
                  <div className="relative community-dropdown">
                    <div className="flex items-center gap-1">
                      {currentCommunities.map((community, index) => (
                        <div key={index} className="w-8 h-8 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center text-sm hover:border-blue-400 transition-colors cursor-pointer" title={community.name}>
                          {community.icon}
                        </div>
                      ))}
                      <button
                        onClick={() => setShowCommunityList(!showCommunityList)}
                        className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors ml-1"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showCommunityList ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Community Dropdown */}
                    {showCommunityList && (
                      <div className="absolute right-0 top-10 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Communities</h3>
                          <div className="space-y-2 mb-4">
                            {currentCommunities.map((community, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{community.icon}</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{community.name}</span>
                                </div>
                                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Active</span>
                              </div>
                            ))}
                          </div>

                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Discover More</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableCommunities.map((community, index) => (
                              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{community.icon}</span>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{community.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{community.members} members</p>
                                  </div>
                                </div>
                                <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700">
                                  Join
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
                  {[
                    { name: 'All', color: 'from-blue-500 to-blue-600' },
                    { name: 'Fire', color: 'from-red-500 to-red-600' },
                    { name: 'Police', color: 'from-blue-600 to-indigo-700' },
                    { name: 'Medical', color: 'from-green-500 to-green-600' },
                    { name: 'Environmental', color: 'from-green-400 to-teal-500' },
                    { name: 'Infrastructure', color: 'from-gray-500 to-gray-600' },
                    { name: 'Water', color: 'from-cyan-500 to-blue-600' },
                    { name: 'Traffic', color: 'from-orange-500 to-orange-600' }
                  ].map((dept) => (
                    <button
                      key={dept.name}
                      onClick={() => setDepartmentFilter(dept.name === 'All' ? 'all' : `${dept.name} Department`)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${(dept.name === 'All' && departmentFilter === 'all') || departmentFilter === `${dept.name} Department`
                        ? `bg-gradient-to-r ${dept.color} text-white shadow-lg`
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-md'
                        }`}
                    >
                      <span>{dept.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
                  {['All Status', 'Pending', 'In Progress', 'Completed', 'Rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status === 'All Status' ? 'all' : status.toLowerCase().replace(' ', '-'))}
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${(status === 'All Status' && statusFilter === 'all') || statusFilter === status.toLowerCase().replace(' ', '-')
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feed */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.filter(report => {
                  const matchesSearch = searchTerm === '' ||
                    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.location.toLowerCase().includes(searchTerm.toLowerCase());

                  const matchesDepartment = departmentFilter === 'all' || report.department === departmentFilter;
                  const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

                  return matchesSearch && matchesDepartment && matchesStatus;
                }).map((report) => (
                  <div key={report.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
                    {/* Post Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{report.author}</p>
                              <p className="text-xs text-gray-500">{report.submitted}</p>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{report.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{report.department}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Post Images — Instagram style */}
                    {report.images && report.images.length > 0 && (() => {
                      const idx = getImageIndex(report.id);
                      const total = report.images.length;
                      const imageSrc = report.images[idx].startsWith('data:') ? report.images[idx]
                        : report.images[idx].startsWith('http') ? report.images[idx]
                          : `data:image/jpeg;base64,${report.images[idx]}`;
                      return (
                        <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <img
                            src={imageSrc}
                            alt={`${report.title} - Image ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />

                          {/* Prev button */}
                          {idx > 0 && (
                            <button
                              onClick={() => setImageIndex(report.id, idx - 1)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                          )}

                          {/* Next button */}
                          {idx < total - 1 && (
                            <button
                              onClick={() => setImageIndex(report.id, idx + 1)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                          )}

                          {/* Dot indicators */}
                          {total > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {report.images.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setImageIndex(report.id, i)}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
                                    }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Counter badge */}
                          {total > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full">
                              {idx + 1}/{total}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Post Content */}
                    <div className="p-4">
                      <p className="text-gray-800 dark:text-gray-200 mb-3">{report.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{report.location}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => handleVote(report.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4" />
                            <span className="text-sm">{report.votes}</span>
                          </button>
                          <button
                            onClick={() => toggleComments(report.id)}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-700 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{report.comments.length}</span>
                          </button>
                          <button
                            onClick={() => handleShare(report)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{report.category}</span>
                          <div className="relative post-menu-container">
                            <button
                              onClick={() => togglePostMenu(report.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </button>
                            {showPostMenu[report.id] && (
                              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                <button
                                  onClick={() => { handleDownload(report); setShowPostMenu(prev => ({ ...prev, [report.id]: false })); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                                <button
                                  onClick={() => { handleRepost(report); setShowPostMenu(prev => ({ ...prev, [report.id]: false })); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Repeat className="w-4 h-4" />
                                  Repost
                                </button>
                                {report.author === (localStorage.getItem('currentUser') || 'You') && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this report?')) {
                                        confirmDelete(report.id);
                                      }
                                      setShowPostMenu(prev => ({ ...prev, [report.id]: false }));
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                )}
                                <button
                                  onClick={() => { handleReport(report); setShowPostMenu(prev => ({ ...prev, [report.id]: false })); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                                >
                                  <Flag className="w-4 h-4" />
                                  Report Post
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {showComments[report.id] && (
                        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                          {/* Existing Comments */}
                          <div className="space-y-3 mb-4">
                            {report.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</span>
                                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{comment.text}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Comment */}
                          <div className="flex gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={commentTexts[report.id] || ''}
                                onChange={(e) => setCommentTexts(prev => ({ ...prev, [report.id]: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(report.id)}
                                placeholder={i18n.t('addComment')}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                onClick={() => handleAddComment(report.id)}
                                disabled={!commentTexts[report.id]?.trim()}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {i18n.t('post')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}


            {/* Report Modal */}
            {showReportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[9999]">
                <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report Issue</h2>
                    <button onClick={() => {
                      setShowReportModal(false);
                      setHasActiveModal(false);
                    }} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const imageUrls = await Promise.all(
                      reportForm.images.map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.readAsDataURL(file);
                        });
                      })
                    );
                    const newReport: Report = {
                      id: Date.now().toString(),
                      title: reportForm.title,
                      description: reportForm.description,
                      category: reportForm.category,
                      location: reportForm.location,
                      coordinates: { lat: 23.3441, lng: 85.3096 },
                      images: imageUrls,
                      status: 'pending',
                      votes: 0,
                      upvotes: 0,
                      downvotes: 0,
                      comments: [],
                      submitted: new Date().toLocaleDateString(),
                      department: 'Public Works',
                      author: 'You'
                    };
                    setReports(prev => [newReport, ...prev]);
                    setShowReportModal(false);
                    setReportForm({ title: '', description: '', category: '', location: '', images: [] });
                    // Also save to database
                    try {
                      await apiService.createReport({
                        title: reportForm.title,
                        description: reportForm.description,
                        category: reportForm.category,
                        location: {
                          address: reportForm.location,
                          latitude: 23.3441,
                          longitude: 85.3096
                        },
                        images: imageUrls
                      });
                      // Refresh reports from database
                      fetchReports();
                    } catch (error) {
                      console.error('Failed to save to database:', error);
                    }
                  }} className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Title</label>
                      <input
                        type="text"
                        value={reportForm.title}
                        onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of the issue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <select
                        value={reportForm.category}
                        onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.filter(c => c !== 'all').map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea
                        value={reportForm.description}
                        onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Detailed description"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={reportForm.location}
                        onChange={(e) => setReportForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Address or landmark"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photos (Max 5)</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const remainingSlots = 5 - reportForm.images.length;
                            const filesToAdd = files.slice(0, remainingSlots);
                            setReportForm(prev => ({ ...prev, images: [...prev.images, ...filesToAdd] }));
                          }}
                          className="hidden"
                          id="image-upload"
                          disabled={reportForm.images.length >= 5}
                        />
                        <label htmlFor="image-upload" className={`cursor-pointer ${reportForm.images.length >= 5 ? 'opacity-50' : ''}`}>
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reportForm.images.length >= 5 ? 'Maximum 5 photos reached' : 'Tap to add photos'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{reportForm.images.length}/5 photos</p>
                        </label>
                      </div>
                      {reportForm.images.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {reportForm.images.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => setReportForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Submit Report
                    </button>
                  </form>
                </div>
              </div>
            )}

            <NotificationModal
              isOpen={notification.isOpen}
              onClose={() => {
                if (notification.title === 'Confirm Record Deletion') {
                  const reportId = reports.find(r => true)?.id; // Get the report ID being deleted
                  if (reportId) confirmDelete(reportId);
                }
                setNotification({ ...notification, isOpen: false });
              }}
              type={notification.type}
              title={notification.title}
              message={notification.message}
            />

            {/* Map Modal */}
            {showMapModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-6">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl h-[70vh] overflow-hidden">
                  <div className="flex items-center justify-between p-2 border-b border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-900">Local Issues Map</h2>
                    <button
                      onClick={() => {
                        setShowMapModal(false);
                        setHasActiveModal(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="h-[calc(100%-40px)]">
                    <LocalMap />
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Right Sidebar - Friends & Stories */}
          <div className="hidden lg:block">
            {/* Emergency Helpline */}
            <QuickHelpline />

            {/* Friends */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Friends</h3>
              <div className="space-y-3">
                {friends.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                    No friends yet.<br />Search for people to add them!
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend._id || friend.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer" onClick={() => { window.location.href = `#/profile/${friend._id || friend.id}`; }}>
                      <div className="relative">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{friend.username?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 bg-green-500"></div>
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{friend.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{friend.role || 'citizen'} · {friend.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Followed Pages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Following</h3>
              <div className="space-y-3">
                {[
                  { name: `${location.city} Municipal Corp`, type: 'Official', verified: true },
                  { name: `${location.region} Govt`, type: 'Government', verified: true },
                  { name: 'Public Works Dept', type: 'Department', verified: true },
                  { name: 'Traffic Police', type: 'Safety', verified: true }
                ].map((page, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{page.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{page.name}</p>
                        {page.verified && <span className="text-blue-500 text-xs">✓</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{page.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Stories</h3>
              <div className="space-y-3">
                {[
                  { title: 'Road Repair Update', author: 'Municipal Corp', time: '2h ago' },
                  { title: 'Water Supply Notice', author: 'Water Dept', time: '4h ago' },
                  { title: 'Traffic Advisory', author: 'Traffic Police', time: '6h ago' }
                ].map((story, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{story.title}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{story.author}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{story.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
    </div>
  );
};

export default CommunityFeed;
