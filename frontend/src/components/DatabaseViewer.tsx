import React, { useState, useEffect } from 'react';
import { Database, Users, FileText, RefreshCw } from 'lucide-react';

const DatabaseViewer: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const headers = authToken ? {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      // Fetch reports
      const reportsResponse = await fetch('/api/reports', {
        headers: headers as any
      });
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
        console.log(`Fetched ${reportsData.length} reports from MongoDB`);
      } else {
        console.error('Failed to fetch reports:', reportsResponse.status);
      }

      // Fetch users (if admin)
      try {
        const usersResponse = await fetch('/api/users/public', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
          console.log(`Fetched ${usersData.length} users from MongoDB`);
        } else {
          console.log('Users fetch failed - likely not admin or not authenticated');
        }
      } catch (error) {
        console.log('Users fetch failed:', error);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading database data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Database Viewer</h1>
              </div>
              <button
                onClick={fetchData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports ({reports.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users ({users.length})</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Reports Collection</h2>
                {reports.length === 0 ? (
                  <p className="text-gray-500">No reports found. Run the seed script to add demo data.</p>
                ) : (
                  <div className="grid gap-4">
                    {reports.map((report) => (
                      <div key={report._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{report.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                          <div><strong>Category:</strong> {report.category}</div>
                          <div><strong>Priority:</strong> {report.priority}</div>
                          <div><strong>Department:</strong> {report.department}</div>
                          <div><strong>Location:</strong> {report.location?.address}</div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          ID: {report._id} | Created: {new Date(report.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Users Collection</h2>
                {users.length === 0 ? (
                  <p className="text-gray-500">No users found or insufficient permissions.</p>
                ) : (
                  <div className="grid gap-4">
                    {users.map((user) => (
                      <div key={user._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{user.username}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'system_admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'department_admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-500">
                          <div><strong>Email:</strong> {user.email}</div>
                          <div><strong>Department:</strong> {user.department || 'N/A'}</div>
                          <div><strong>Approved:</strong> {user.isApproved ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          ID: {user._id} | Created: {new Date(user.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;