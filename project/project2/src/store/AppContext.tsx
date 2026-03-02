import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Report {
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

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  mobile: string;
  profilePicture: string;
  bio: string;
  issuesReported: number;
  reputationPoints: number;
  badges: string[];
}

interface AppContextType {
  reports: Report[];
  user: User;
  currentLocation: { lat: number; lng: number } | null;
  showReportModal: boolean;
  showProfileModal: boolean;
  selectedCategory: string;
  selectedReportId: string | null;
  addReport: (report: Omit<Report, 'id' | 'votes' | 'upvotes' | 'downvotes' | 'comments' | 'submitted' | 'status' | 'author'>) => void;
  voteReport: (reportId: string, type: 'up' | 'down') => void;
  addComment: (reportId: string, comment: string) => void;
  addReply: (reportId: string, commentId: string, reply: string) => void;
  deleteReport: (reportId: string) => void;
  setShowReportModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedReportId: (reportId: string | null) => void;
  getNearbyReports: (radius?: number) => Report[];
  updateUser: (userData: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {
      id: '',
      username: '',
      email: '',
      mobile: '',
      profilePicture: '',
      bio: '',
      issuesReported: 0,
      reputationPoints: 0,
      badges: []
    };
  });

  useEffect(() => {
    // Fetch reports from backend
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:3001/api/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const backendReports = await response.json();
          const formattedReports = backendReports.map((report: any) => ({
            id: report._id,
            title: report.title,
            description: report.description,
            category: report.category,
            location: report.location?.address || 'Unknown location',
            coordinates: { 
              lat: report.location?.latitude || 34.0522, 
              lng: report.location?.longitude || -118.2437 
            },
            images: [],
            status: report.status,
            votes: 0,
            upvotes: 0,
            downvotes: 0,
            comments: [],
            submitted: new Date(report.createdAt).toLocaleDateString(),
            department: 'Public Works',
            author: report.userId?.name || 'Anonymous'
          }));
          setReports(formattedReports);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    
    fetchReports();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(location);
          console.log('User location set:', location);
        },
        (err) => {
          console.error('Location access denied:', err);
          const defaultLocation = { lat: 34.0522, lng: -118.2437 };
          setCurrentLocation(defaultLocation);
          console.log('Using default location:', defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      const defaultLocation = { lat: 34.0522, lng: -118.2437 };
      setCurrentLocation(defaultLocation);
    }
  }, []);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    try {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return isNaN(distance) ? 0 : distance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 0;
    }
  };

  const addReport = async (reportData: Omit<Report, 'id' | 'votes' | 'upvotes' | 'downvotes' | 'comments' | 'submitted' | 'status' | 'author'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:3001/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: reportData.title,
          description: reportData.description,
          category: reportData.category,
          location: {
            address: reportData.location,
            latitude: reportData.coordinates.lat,
            longitude: reportData.coordinates.lng
          }
        })
      });
      
      if (response.ok) {
        const newBackendReport = await response.json();
        const newReport: Report = {
          id: newBackendReport._id,
          title: newBackendReport.title,
          description: newBackendReport.description,
          category: newBackendReport.category,
          location: newBackendReport.location?.address || reportData.location,
          coordinates: reportData.coordinates,
          images: [],
          status: 'pending',
          votes: 0,
          upvotes: 0,
          downvotes: 0,
          comments: [],
          submitted: new Date().toLocaleDateString(),
          department: 'Public Works',
          author: user.username || 'Anonymous'
        };
        setReports(prev => [newReport, ...prev]);
        setUser(prev => ({ ...prev, issuesReported: prev.issuesReported + 1, reputationPoints: prev.reputationPoints + 10 }));
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const voteReport = (reportId: string, type: 'up' | 'down') => {
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        const newUpvotes = type === 'up' ? report.upvotes + 1 : report.upvotes;
        const newDownvotes = type === 'down' ? report.downvotes + 1 : report.downvotes;
        return {
          ...report,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          votes: newUpvotes - newDownvotes
        };
      }
      return report;
    }));
  };

  const addComment = (reportId: string, commentText: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      author: user.username || 'Anonymous',
      timestamp: new Date().toLocaleString(),
      replies: []
    };
    
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, comments: [...report.comments, newComment] }
        : report
    ));
  };

  const addReply = (reportId: string, commentId: string, replyText: string) => {
    const newReply: Reply = {
      id: Date.now().toString(),
      text: replyText,
      author: user.username,
      timestamp: new Date().toLocaleString()
    };
    
    setReports(prev => prev.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          comments: report.comments.map(comment =>
            comment.id === commentId
              ? { ...comment, replies: [...comment.replies, newReply] }
              : comment
          )
        };
      }
      return report;
    }));
  };

  const getNearbyReports = (radius = 2) => {
    try {
      if (!currentLocation || !reports || reports.length === 0) {
        console.log('No location or reports available for nearby search');
        return [];
      }
      
      const nearbyReports = reports.filter(report => {
        if (!report || !report.coordinates || 
            typeof report.coordinates.lat !== 'number' || 
            typeof report.coordinates.lng !== 'number') {
          return false;
        }
        
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          report.coordinates.lat,
          report.coordinates.lng
        );
        
        return distance <= radius && distance >= 0;
      }).map(report => {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          report.coordinates.lat,
          report.coordinates.lng
        );
        return { ...report, distance: Math.round(distance * 100) / 100 };
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      console.log(`Found ${nearbyReports.length} nearby reports within ${radius}km`);
      return nearbyReports;
    } catch (error) {
      console.error('Error getting nearby reports:', error);
      return [];
    }
  };

  const updateUser = (userData: Partial<User>) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
  
  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
  };

  return (
    <AppContext.Provider value={{
      reports,
      user,
      currentLocation,
      showReportModal,
      showProfileModal,
      selectedCategory,
      selectedReportId,
      addReport,
      voteReport,
      addComment,
      addReply,
      deleteReport,
      setShowReportModal,
      setShowProfileModal,
      setSelectedCategory,
      setSelectedReportId,
      getNearbyReports,
      updateUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};