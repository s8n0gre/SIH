import React, { useState } from 'react';
import { ArrowUp, MessageCircle, MapPin, User, Filter, TrendingUp, Clock, CheckCircle, AlertCircle, Send, Reply, Map } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface HomePageProps {
  onViewOnMap?: (reportId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onViewOnMap }) => {
  const { reports, voteReport, addComment, addReply, selectedCategory, setSelectedCategory, setShowProfileModal, getNearbyReports, setSelectedReportId } = useApp();
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
  const [activeFilter, setActiveFilter] = useState('all');

  // Safety checks
  if (!reports) return <div>Loading...</div>;

  const categories = ['all', 'Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety', 'Other'];
  const filters = ['all', 'nearby', 'trending', 'recent'];

  const nearbyReports = getNearbyReports() || [];
  
  const getFilteredReports = () => {
    try {
      let filtered = reports || [];
      
      switch (activeFilter) {
        case 'nearby':
          filtered = nearbyReports;
          break;
        case 'trending':
          filtered = [...filtered].sort((a, b) => (b.votes || 0) - (a.votes || 0));
          break;
        case 'recent':
          filtered = [...filtered].sort((a, b) => {
            const dateA = new Date(a.submitted || 0).getTime();
            const dateB = new Date(b.submitted || 0).getTime();
            return dateB - dateA;
          });
          break;
        default:
          filtered = filtered;
      }
      
      if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(report => report.category === selectedCategory);
      }
      
      return filtered;
    } catch (error) {
      console.error('Error filtering reports:', error);
      return [];
    }
  };

  const filteredReports = getFilteredReports();
  const completedCount = (reports || []).filter(r => r?.status === 'completed').length;
  const inProgressCount = (reports || []).filter(r => r?.status === 'in-progress').length;
  const pendingCount = (reports || []).filter(r => r?.status === 'pending').length;

  const handleVote = (reportId: string) => {
    voteReport(reportId, 'up');
  };

  const handleComment = (reportId: string) => {
    const comment = commentInputs[reportId]?.trim();
    if (comment) {
      addComment(reportId, comment);
      setCommentInputs(prev => ({ ...prev, [reportId]: '' }));
    }
  };

  const handleReply = (reportId: string, commentId: string) => {
    const reply = replyInputs[`${reportId}-${commentId}`]?.trim();
    if (reply) {
      addReply(reportId, commentId, reply);
      setReplyInputs(prev => ({ ...prev, [`${reportId}-${commentId}`]: '' }));
    }
  };

  const toggleComments = (reportId: string) => {
    setShowComments(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
          <p className="text-sm text-gray-600">Stay updated with your community</p>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
        >
          <User className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Live Dashboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Live Dashboard</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <div className="text-xl font-bold text-red-600">{pendingCount}</div>
            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Reported
            </div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <div className="text-xl font-bold text-yellow-600">{inProgressCount}</div>
            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              In Progress
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Solved
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter === 'nearby' && (
                <span className="mr-1">📍</span>
              )}
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'nearby' && (
                <span className="ml-1 text-xs">({nearbyReports.length})</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">
              {activeFilter === 'nearby' ? 'No nearby issues found' : 'No reports match your filters'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{report.author}</p>
                        <p className="text-xs text-gray-500">{report.submitted}</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{report.department}</span>
                      {report.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {report.distance.toFixed(1)}km away
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Post Images */}
              {report.images.length > 0 && (
                <div className="relative">
                  <div className="aspect-video bg-gray-100 overflow-x-auto snap-x snap-mandatory">
                    <div className="flex h-full">
                      {report.images.map((image, index) => (
                        <div key={index} className="flex-shrink-0 w-full h-full snap-start">
                          <img 
                            src={image} 
                            alt={`${report.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {report.images.length > 1 && (
                    <>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                        {report.images.length} photos
                      </div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {report.images.map((_, index) => (
                          <div key={index} className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-800 mb-3">{report.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{report.location}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
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
                      onClick={() => {
                        setSelectedReportId(report.id);
                        onViewOnMap && onViewOnMap(report.id);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Map className="w-4 h-4" />
                      <span className="text-sm">View on Map</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{report.category}</span>
                </div>

                {/* Comments Section */}
                {showComments[report.id] && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {/* Comment Input */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={commentInputs[report.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [report.id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(report.id)}
                      />
                      <button
                        onClick={() => handleComment(report.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {report.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setShowReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Reply
                              </button>
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{comment.text}</p>
                          
                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="bg-white rounded p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-xs text-gray-800">{reply.author}</span>
                                    <span className="text-xs text-gray-400">{reply.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{reply.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Reply Input */}
                          {showReplies[comment.id] && (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                value={replyInputs[`${report.id}-${comment.id}`] || ''}
                                onChange={(e) => setReplyInputs(prev => ({ ...prev, [`${report.id}-${comment.id}`]: e.target.value }))}
                                placeholder="Write a reply..."
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && handleReply(report.id, comment.id)}
                              />
                              <button
                                onClick={() => handleReply(report.id, comment.id)}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                              >
                                <Reply className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;