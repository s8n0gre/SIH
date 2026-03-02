import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle, MapPin, User, Plus, X, Camera, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  status: 'pending' | 'in-progress' | 'completed';
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
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    images: [] as File[]
  });
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'user');

  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('userRole') || 'user');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every second (for same-tab updates)
    const interval = setInterval(() => {
      const currentRole = localStorage.getItem('userRole') || 'user';
      if (currentRole !== userRole) {
        setUserRole(currentRole);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userRole]);

  const categories = ['all', 'Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety', 'Other'];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('userRole') || 'user');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every second (for same-tab updates)
    const interval = setInterval(() => {
      const currentRole = localStorage.getItem('userRole') || 'user';
      if (currentRole !== userRole) {
        setUserRole(currentRole);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userRole]);

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
        status: report.status === 'resolved' ? 'completed' : report.status === 'in_progress' ? 'in-progress' : 'pending',
        votes: (report.votes?.upvotes || 0) - (report.votes?.downvotes || 0),
        upvotes: report.votes?.upvotes || 0,
        downvotes: report.votes?.downvotes || 0,
        comments: [],
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
          location: 'Station Road, Ranchi, Jharkhand',
          coordinates: { lat: 23.3441, lng: 85.3096 },
          images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'],
          status: 'in-progress',
          votes: 22,
          upvotes: 23,
          downvotes: 1,
          comments: [],
          submitted: new Date(Date.now() - 3600000).toLocaleDateString(),
          department: 'Water Department',
          author: 'RanchiResident'
        },
        {
          id: 'demo-2',
          title: 'Broken Traffic Signal',
          description: 'Traffic signal at busy intersection has been malfunctioning for 2 days',
          category: 'Public Safety',
          location: 'Albert Ekka Chowk, Ranchi, Jharkhand',
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

  const handleVote = (reportId: string) => {
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
  };

  const handleDeletePost = async (reportId: string) => {
    if (userRole !== 'sys_admin') {
      alert('Access denied. Only system administrators can delete posts.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone and will remove it from the database permanently.')) {
      try {
        // Set a simple token for sys_admin operations
        localStorage.setItem('authToken', 'sys_admin_token');
        
        // Delete from database first
        await apiService.deleteReport(reportId);
        // Remove from local state only after successful database deletion
        setReports(prev => prev.filter(report => report.id !== reportId));
        alert('Post deleted successfully from database.');
      } catch (error) {
        console.error('Failed to delete from database:', error);
        
        // Check if it's a demo post (starts with 'demo-') or MongoDB ObjectId
        if (reportId.startsWith('demo-')) {
          setReports(prev => prev.filter(report => report.id !== reportId));
          alert('Demo post removed locally (demo posts are not stored in database).');
        } else if (reportId.match(/^[0-9a-fA-F]{24}$/)) {
          // MongoDB ObjectId format - real database post
          setReports(prev => prev.filter(report => report.id !== reportId));
          alert(`Database post removed locally. Backend deletion may have failed - check MongoDB Compass to verify.`);
        } else {
          // Other format posts
          setReports(prev => prev.filter(report => report.id !== reportId));
          alert(`Post removed locally. Database deletion failed: Backend server not running.`);
        }
      }
    }
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
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
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
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Post Images */}
              {report.images && report.images.length > 0 && (
                <div className="relative">
                  <div className="aspect-video bg-gray-100 overflow-x-auto snap-x snap-mandatory">
                    <div className="flex h-full">
                      {report.images.map((image, index) => {
                        // Handle both base64 and URL images
                        const imageSrc = image.startsWith('data:') ? image : 
                                       image.startsWith('http') ? image :
                                       `data:image/jpeg;base64,${image}`;
                        return (
                          <div key={index} className="flex-shrink-0 w-full h-full snap-start">
                            <img 
                              src={imageSrc}
                              alt={`${report.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Image load error for:', imageSrc.substring(0, 50));
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        );
                      })}
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

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleVote(report.id)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-sm">{report.votes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">0</span>
                    </button>
                    {userRole === 'sys_admin' && (
                      <button 
                        onClick={() => handleDeletePost(report.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                        title="Delete Post (Admin Only)"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{report.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[9999]">
          <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Report Issue</h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.filter(c => c !== 'all').map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={reportForm.location}
                  onChange={(e) => setReportForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Address or landmark"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Max 5)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
                    <p className="text-sm text-gray-600">
                      {reportForm.images.length >= 5 ? 'Maximum 5 photos reached' : 'Tap to add photos'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{reportForm.images.length}/5 photos</p>
                  </label>
                </div>
                {reportForm.images.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {reportForm.images.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
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
    </div>
  );
};

export default CommunityFeed;