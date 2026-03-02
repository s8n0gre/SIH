import React, { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, Eye, MessageCircle, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import FloatingButton from './FloatingButton';
import ReportModal from './ReportModal';
import { i18n } from '../services/i18n';

interface Issue {
  id: string;
  title: string;
  category: string;
  location: string;
  timestamp: Date;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  image?: string;
  description: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  author: string;
  coordinates?: { lat: number; lng: number };
  images?: string[];
  department?: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

const LiveFeed: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports');
      if (response.ok) {
        const reports = await response.json();
        const formattedIssues = reports.map((report: any) => ({
          id: report._id,
          title: report.title,
          category: report.category,
          location: report.location.address,
          timestamp: new Date(report.createdAt),
          status: report.status,
          priority: report.priority,
          description: report.description,
          votes: report.votes.upvotes - report.votes.downvotes,
          upvotes: report.votes.upvotes,
          downvotes: report.votes.downvotes,
          comments: [],
          author: report.reportedBy?.username || 'Anonymous',
          coordinates: report.location.coordinates,
          department: report.department
        }));
        setIssues(formattedIssues);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      // Fallback to demo data if API fails
      const mockIssues: Issue[] = [
        {
          id: '1',
          title: 'Demo: Pothole on Main Street',
          category: 'Roads & Infrastructure',
          location: 'Main Street, Ranchi, Jharkhand',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'pending',
          priority: 'high',
          description: 'Large pothole causing traffic issues',
          votes: 15,
          upvotes: 18,
          downvotes: 3,
          comments: [],
          author: 'Demo User'
        }
      ];
      setIssues(mockIssues);
    }
  };

  const filteredIssues = issues.filter(issue => 
    filter === 'all' || issue.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleVote = (issueId: string, type: 'up' | 'down') => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const newUpvotes = type === 'up' ? issue.upvotes + 1 : issue.upvotes;
        const newDownvotes = type === 'down' ? issue.downvotes + 1 : issue.downvotes;
        return {
          ...issue,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          votes: newUpvotes - newDownvotes
        };
      }
      return issue;
    }));
  };

  const handleComment = (issueId: string, comment: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text: comment,
      author: 'Current User',
      timestamp: 'Just now'
    };
    
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, comments: [...issue.comments, newComment] }
        : issue
    ));
  };



  const handleAddReport = (reportData: any) => {
    const newReport: Issue = {
      ...reportData,
      id: Date.now().toString(),
      votes: 0,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      timestamp: new Date(),
      priority: 'medium' as const,
      status: 'pending' as const,
      author: 'Current User'
    };
    setIssues(prev => [newReport, ...prev]);
  };

  const handleCommentSubmit = (issueId: string) => {
    const comment = commentText[issueId];
    if (comment?.trim()) {
      handleComment(issueId, comment);
      setCommentText(prev => ({ ...prev, [issueId]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Feed</h1>
            <p className="text-gray-600">Real-time municipal issues and updates</p>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'pending', 'in-progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(issue.status)}
                    <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{issue.location}</span>
                    <span className="mx-2">•</span>
                    <span>{issue.category}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTimeAgo(issue.timestamp)}</span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{issue.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button 
                        onClick={() => handleVote(issue.id, 'up')}
                        className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{issue.upvotes}</span>
                      </button>
                      <button 
                        onClick={() => handleVote(issue.id, 'down')}
                        className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{issue.downvotes}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{issue.comments.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{issue.author}</span>
                    </div>
                  </div>
                  
                  {/* Comment Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={commentText[issue.id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [issue.id]: e.target.value }))}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(issue.id)}
                    />
                    <button
                      onClick={() => handleCommentSubmit(issue.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post
                    </button>
                  </div>
                  
                  {/* Comments */}
                  {issue.comments.length > 0 && (
                    <div className="space-y-2">
                      {issue.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No issues found for the selected filter.</p>
          </div>
        )}
      </div>
      
      <FloatingButton onClick={() => setShowReportModal(true)} />
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleAddReport}
      />
      </div>
    </div>
  );
};

export default LiveFeed;