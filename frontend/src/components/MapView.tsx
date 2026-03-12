import React, { useState, useEffect } from 'react';
import { MapPin, Filter, RefreshCw } from 'lucide-react';
import MapComponent from './MapComponent';
import { useUserLocation } from '../hooks/useUserLocation';

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  votes?: {
    upvotes: number;
    downvotes: number;
  };
}

const MapView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const location = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { apiService } = await import('../services/api');
      const data = await apiService.getReports();

      // Add mock coordinates for reports that don't have them
      const reportsWithCoords = data.map((report: any, index: number) => ({
        ...report,
        location: {
          ...report.location,
          latitude: report.location?.latitude || (23.3441 + (index % 10 - 5) * 0.01),
          longitude: report.location?.longitude || (85.3096 + (index % 10 - 5) * 0.01)
        }
      }));

      setReports(reportsWithCoords);
    } catch (error) {
      console.error('Failed to load reports:', error);
      // Load demo data
      setReports(getDemoReports());
    } finally {
      setLoading(false);
    }
  };

  const getDemoReports = (): Report[] => {
    return [
      {
        _id: '1',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        category: 'Roads & Infrastructure',
        status: 'pending',
        location: {
          latitude: 23.3441,
          longitude: 85.3096,
          address: `Main Street, ${location.city}`
        },
        createdAt: new Date().toISOString(),
        votes: { upvotes: 15, downvotes: 2 }
      },
      {
        _id: '2',
        title: 'Broken Street Light',
        description: 'Street light not working for 3 days',
        category: 'Electricity',
        status: 'in-progress',
        location: {
          latitude: 23.3451,
          longitude: 85.3106,
          address: `Park Avenue, ${location.city}`
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        votes: { upvotes: 8, downvotes: 0 }
      },
      {
        _id: '3',
        title: 'Water Pipe Leak',
        description: 'Water wastage due to pipe leak',
        category: 'Water Services',
        status: 'resolved',
        location: {
          latitude: 23.3431,
          longitude: 85.3086,
          address: `Gandhi Road, ${location.city}`
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        votes: { upvotes: 12, downvotes: 1 }
      }
    ];
  };

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || report.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const categories = [
    'Roads & Infrastructure',
    'Water Services',
    'Electricity',
    'Waste Management',
    'Parks & Recreation',
    'Public Safety'
  ];

  const statuses = ['pending', 'in-progress', 'resolved', 'rejected'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issue Map</h1>
              <p className="text-gray-600">View reported issues on the map</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={loadReports}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Filter
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <p>Showing {filteredReports.length} of {reports.length} reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <MapComponent
              reports={filteredReports}
              showReports={true}
              height="calc(100vh - 200px)"
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-t shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Pending: {filteredReports.filter(r => r.status === 'pending').length}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                In Progress: {filteredReports.filter(r => r.status === 'in-progress').length}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Resolved: {filteredReports.filter(r => r.status === 'resolved').length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Total Issues: {filteredReports.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;