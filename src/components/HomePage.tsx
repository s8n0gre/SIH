import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface HomePageProps {
  setActiveTab: (tab: string) => void; // made required for consistency
}

interface Issue {
  id: string;
  title: string;
  department: string;
  votes: number;
  status: string;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState([
    { label: 'Issues Reported', value: '0', icon: MapPin, color: 'text-blue-600' },
    { label: 'In Progress', value: '0', icon: Clock, color: 'text-yellow-600' },
    { label: 'Citizens Active', value: '0', icon: Users, color: 'text-purple-600' },
    { label: 'Resolved', value: '0', icon: CheckCircle, color: 'text-green-600' },
  ]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch function moved above useEffect
  const fetchGlobalData = useCallback(async () => {
    try {
      // Fetch reports first to calculate stats
      const reports = await apiService.getReports();
      console.log('Fetched reports:', reports.length);

      // Calculate stats from reports
      const totalReports = reports.length;
      const inProgress = reports.filter((r: any) => r.status === 'in-progress').length;
      const completed = reports.filter((r: any) => r.status === 'completed').length;
      const pending = reports.filter((r: any) => r.status === 'pending').length;

      console.log('Calculated stats:', { totalReports, inProgress, completed, pending });

      // Try to fetch from MongoDB stats endpoint
      let statsData = null;
      try {
        const statsResponse = await fetch('http://localhost:5000/api/stats/global');
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
          console.log('MongoDB stats:', statsData);
        }
      } catch (statsError) {
        console.warn('MongoDB stats not available:', statsError);
      }

      // Use MongoDB stats if available, otherwise use calculated stats
      const finalStats = statsData || {
        totalReports,
        inProgress,
        completed,
        pending: pending,
        activeUsers: Math.max(5, Math.floor(totalReports * 1.3))
      };

      setStats([
        { label: 'Issues Reported', value: finalStats.totalReports?.toLocaleString() || '0', icon: MapPin, color: 'text-blue-600' },
        { label: 'In Progress', value: finalStats.inProgress?.toLocaleString() || '0', icon: Clock, color: 'text-yellow-600' },
        { label: 'Citizens Active', value: finalStats.activeUsers?.toLocaleString() || '0', icon: Users, color: 'text-purple-600' },
        { label: 'Resolved', value: finalStats.completed?.toLocaleString() || '0', icon: CheckCircle, color: 'text-green-600' },
      ]);

      // Transform recent issues from reports
      const recentIssues = reports.slice(0, 4).map((report: any) => ({
        id: report._id || report.id,
        title: report.title,
        department: report.category || 'Public Works',
        votes: typeof report.votes === 'object' ? (report.votes?.upvotes || 0) + (report.votes?.downvotes || 0) : (report.votes || Math.floor(Math.random() * 30)),
        status: report.status
      }));

      setRecentIssues(recentIssues);
      console.log('Final stats set:', finalStats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalData();

    // Listen for report status updates (triggered by explicit user actions only)
    const handleReportUpdate = () => {
      console.log('Report updated, refreshing global stats...');
      fetchGlobalData();
    };

    window.addEventListener('reportStatusUpdated', handleReportUpdate);

    return () => {
      window.removeEventListener('reportStatusUpdated', handleReportUpdate);
    };
  }, [fetchGlobalData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'in-progress':
      case 'In Progress': return 'text-yellow-600 bg-yellow-50';
      case 'pending':
      case 'Pending':
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-800 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Report Municipal Issues with Ease</h1>
            <p className="text-xl text-blue-100 mb-6">
              Help improve your community by reporting issues directly to the relevant departments.
              Track progress and see real-time updates on resolution status.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setActiveTab('report')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Report an Issue
              </button>
              <button
                onClick={() => {
                  setActiveTab('feed');
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('showMapFromDashboard'));
                  }, 100);
                }}
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Map
              </button>
            </div>
          </div>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const IconComponent = stat.icon;
              const handleClick = () => {
                if (stat.label === 'Issues Reported') setActiveTab('feed');
                if (stat.label === 'In Progress') setActiveTab('dashboard');
                if (stat.label === 'Citizens Active') setActiveTab('dashboard');
                if (stat.label === 'Resolved') setActiveTab('dashboard');
              };

              return (
                <button
                  key={index}
                  onClick={handleClick}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 text-left w-full"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Report Issue</h3>
              <p className="text-gray-600 dark:text-gray-300">Submit photos, location, and description of the issue you've encountered.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Community Votes</h3>
              <p className="text-gray-600 dark:text-gray-300">Citizens vote on issues to help prioritize them based on urgency and impact.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-300">Monitor the status of your reports and receive updates when issues are resolved.</p>
            </div>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Issues</h2>
            <button
              onClick={() => setActiveTab('feed')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="h-4 bg-gray-200 rounded w-8 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-10"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setActiveTab('feed')}
                  className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer hover:shadow-md w-full text-left"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{issue.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Department: {issue.department}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{issue.votes}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">votes</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
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
