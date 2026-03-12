import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ThumbsUp, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import ServerStatus from './ServerStatus';

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  department?: string;
  status: string;
  priority: string;
  location: {
    address: string;
    coordinates: { latitude: number; longitude: number };
  };
  votes: {
    upvotes: number;
    downvotes: number;
  };
  aiAnalysis?: {
    detectedIssues?: string[];
    confidence?: number;
  };
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserReports();
      setReports(response.reports || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
      console.error('Error fetching reports:', err);
      
      // Show a more helpful error message
      if (errorMessage.includes('fetch')) {
        setError('Unable to connect to server. Please ensure the backend is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'assigned': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'assigned': return 'text-blue-600 bg-blue-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case 'resolved': return 100;
      case 'in_progress': return 65;
      case 'assigned': return 35;
      case 'rejected': return 0;
      default: return 10;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStats = () => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'resolved').length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;
    const totalVotes = reports.reduce((sum, r) => sum + r.votes.upvotes, 0);
    return { total, completed, inProgress, totalVotes };
  };

  const stats = getStats();

  const tabs = [
    { id: 'my-reports', label: 'My Reports' },
    { id: 'voted', label: 'Voted On' },
    { id: 'following', label: 'Following' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
              <p className="text-gray-600">Track your reports and community engagement</p>
            </div>
            <ServerStatus />
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Reports Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalVotes}</div>
              <div className="text-sm text-gray-600">Total Votes Received</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'my-reports' && (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your reports...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchUserReports}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                  <p className="text-gray-600">You haven't submitted any reports yet. Start by reporting an issue in your community.</p>
                </div>
              ) : (
                reports.map((report) => {
                  const progress = getProgress(report.status);
                  return (
                    <div key={report._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(report.status)}
                            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span>Department: {report.department || report.category}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <p className="text-xs text-gray-500">📍 {report.location.address}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>

                      {/* AI Analysis */}
                      {report.aiAnalysis?.detectedIssues && report.aiAnalysis.detectedIssues.length > 0 && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                          <h4 className="text-sm font-medium text-purple-900 mb-2">AI Detected Issues:</h4>
                          <div className="flex flex-wrap gap-2">
                            {report.aiAnalysis.detectedIssues.map((issue, index) => (
                              <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {issue}
                              </span>
                            ))}
                          </div>
                          {report.aiAnalysis.confidence && (
                            <p className="text-xs text-purple-600 mt-2">
                              Confidence: {Math.round(report.aiAnalysis.confidence * 100)}%
                            </p>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              report.status === 'resolved' ? 'bg-green-600' :
                              report.status === 'in_progress' ? 'bg-yellow-600' :
                              report.status === 'assigned' ? 'bg-blue-600' :
                              report.status === 'rejected' ? 'bg-red-600' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{report.votes.upvotes} votes</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            Priority: {report.priority}
                          </span>
                        </div>
                        {report.status !== 'resolved' && report.status !== 'rejected' && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Follow Up
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'voted' && (
            <div className="text-center py-12">
              <ThumbsUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Voted Issues</h3>
              <p className="text-gray-600">You haven't voted on any community issues yet.</p>
            </div>
          )}

          {activeTab === 'following' && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Followed Issues</h3>
              <p className="text-gray-600">You aren't following any issues yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;