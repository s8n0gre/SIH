import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Filter, Download, User, MapPin, Calendar, Map, GitBranch, Shield, Wrench, Lock, BarChart2, GitMerge } from 'lucide-react';
import MapComponent from './MapComponent';
import { useUserLocation } from '../hooks/useUserLocation';
import RoutingRuleEngine from './RoutingRuleEngine';
import TriageQueue from './TriageQueue';
import RBACManager from './RBACManager';
import WorkOrderManager from './WorkOrderManager';
import AuditLog from './AuditLog';
import AnalyticsDashboard from './AnalyticsDashboard';

interface DepartmentData {
  department: string;
  count: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface Report {
  _id: string;
  ticketNumber?: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  reportedBy: { username: string };
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

const AdminDashboard: React.FC = () => {
  const [issuesData, setIssuesData] = useState<DepartmentData[]>([]);
  const userLocation = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  type AdminTab = 'analytics' | 'reports' | 'map' | 'routing' | 'triage' | 'rbac' | 'work-orders' | 'audit';
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      // Fetch real data from MongoDB
      const { apiService } = await import('../services/api');
      const reportsData = await apiService.getReports();

      // Transform API data to match Report interface
      const transformedReports = reportsData.map((report: any) => ({
        _id: report._id || report.id,
        ticketNumber: report.ticketNumber || '',
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        // Support both new flat fields and old nested location shape
        locationAddress: report.locationAddress || report.location?.address || report.location || 'Unknown',
        latitude: report.latitude ?? report.location?.coordinates?.latitude ?? 23.6102,
        longitude: report.longitude ?? report.location?.coordinates?.longitude ?? 85.2799,
        reportedBy: { username: report.reportedBy?.username || report.author || 'Anonymous' },
        createdAt: report.createdAt || new Date().toISOString(),
        upvotes: report.upvotes ?? report.votes?.upvotes ?? 0,
        downvotes: report.downvotes ?? report.votes?.downvotes ?? 0
      }));

      setReports(transformedReports);

      // Generate department statistics from real data
      const departmentCounts = aggregateReportsByDepartment(transformedReports);
      setIssuesData(departmentCounts);

    } catch (error) {
      console.error('Error loading reports:', error);
      // Fallback to demo data only if API fails
      const demoReports = getDemoReports();
      setReports(demoReports);
      setIssuesData(getDemoData());
    } finally {
      setLoading(false);
    }
  };

  const getDemoReports = (): Report[] => {
    return [
      {
        _id: '1',
        ticketNumber: 'TKT-DEMO-001',
        title: 'Water Leakage on Station Road',
        description: 'Major water pipe burst causing flooding',
        category: 'Water Services',
        status: 'open',
        locationAddress: `Station Road, ${userLocation.city}`,
        latitude: 23.3441,
        longitude: 85.3096,
        reportedBy: { username: `${userLocation.city.replace(/\s+/g, '')}Resident` },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        upvotes: 23,
        downvotes: 1
      },
      {
        _id: '2',
        ticketNumber: 'TKT-DEMO-002',
        title: 'Broken Traffic Signal',
        description: 'Traffic signal malfunctioning for 2 days',
        category: 'Public Safety',
        status: 'in_progress',
        locationAddress: `Albert Ekka Chowk, ${userLocation.city}`,
        latitude: 23.3569,
        longitude: 85.3346,
        reportedBy: { username: 'SafetyFirst' },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        upvotes: 18,
        downvotes: 0
      },
      {
        _id: '3',
        ticketNumber: 'TKT-DEMO-003',
        title: 'Park Maintenance Required',
        description: 'Playground equipment needs repair',
        category: 'Parks & Recreation',
        status: 'resolved',
        locationAddress: `Oxygen Park, ${userLocation.city}`,
        latitude: 23.3701,
        longitude: 85.3378,
        reportedBy: { username: 'ParkLover' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        upvotes: 12,
        downvotes: 2
      }
    ];
  };

  const aggregateReportsByDepartment = (reports: any[]): DepartmentData[] => {
    const departmentCounts: { [key: string]: number } = {};
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];

    // Count reports by category/department
    reports.forEach(report => {
      const dept = report.category || report.department || 'Other';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    return Object.entries(departmentCounts)
      .map(([department, count], index) => ({
        department,
        count,
        color: colors[index % colors.length],
        trend: trends[Math.floor(Math.random() * trends.length)]
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getDemoData = (): DepartmentData[] => {
    const departments = [
      { name: 'Roads & Infrastructure', color: '#EF4444' },
      { name: 'Water Services', color: '#3B82F6' },
      { name: 'Electricity', color: '#10B981' },
      { name: 'Waste Management', color: '#F59E0B' },
      { name: 'Parks & Recreation', color: '#8B5CF6' },
      { name: 'Public Safety', color: '#EC4899' }
    ];

    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];

    return departments.map(dept => ({
      department: dept.name,
      count: Math.floor(Math.random() * 30) + 3,
      color: dept.color,
      trend: trends[Math.floor(Math.random() * trends.length)]
    }));
  };

  const totalIssues = issuesData.reduce((sum, item) => sum + item.count, 0);
  const avgIssuesPerDept = Math.round(totalIssues / issuesData.length);
  const highPriorityDepts = issuesData.filter(item => item.count > avgIssuesPerDept).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Municipal Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time civic issues analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadReportsData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('bar')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                >
                  Bar Chart
                </button>
                <button
                  onClick={() => setViewMode('pie')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'pie' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    }`}
                >
                  Pie Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{issuesData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{highPriorityDepts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg per Dept</p>
                <p className="text-2xl font-bold text-gray-900">{avgIssuesPerDept}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max">
            {[
              { id: 'analytics', label: 'Analytics & SLA', icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <AlertCircle className="w-4 h-4" /> },
              { id: 'triage', label: 'Triage Queue', icon: <GitMerge className="w-4 h-4" /> },
              { id: 'work-orders', label: 'Work Orders', icon: <Wrench className="w-4 h-4" /> },
              { id: 'routing', label: 'Routing Rules', icon: <GitBranch className="w-4 h-4" /> },
              { id: 'rbac', label: 'RBAC', icon: <Shield className="w-4 h-4" /> },
              { id: 'audit', label: 'Audit Log', icon: <Lock className="w-4 h-4" /> },
              { id: 'map', label: 'Map View', icon: <Map className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'map' ? (
          /* Map View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Locations</h3>
              <p className="text-sm text-gray-600">View all reported issues on the map. Click on markers for details.</p>
            </div>
            <MapComponent
              reports={reports.map(r => ({
                ...r,
                location: {
                  latitude: r.latitude || 23.6102,
                  longitude: r.longitude || 85.2799,
                  address: r.locationAddress || 'Unknown'
                }
              }))}
              showReports={true}
              height="600px"
            />
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <AnalyticsDashboard />
          </div>
        ) : activeTab === 'triage' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TriageQueue />
          </div>
        ) : activeTab === 'work-orders' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <WorkOrderManager />
          </div>
        ) : activeTab === 'routing' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <RoutingRuleEngine />
          </div>
        ) : activeTab === 'rbac' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <RBACManager />
          </div>
        ) : activeTab === 'audit' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <AuditLog />
          </div>
        ) : (
          /* Report Management */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Report Management</h3>
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {reports
                .filter(report => statusFilter === 'all' || report.status === statusFilter)
                .map((report) => (
                  <div key={report._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{report.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.reportedBy.username}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {report.locationAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span>👍 {report.upvotes} 👎 {report.downvotes}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <select
                          value={report.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Report['status'];
                            setReports(prev => prev.map(r =>
                              r._id === report._id ? { ...r, status: newStatus } : r
                            ));
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="open">Open</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={async () => {
                            try {
                              const { apiService } = await import('../services/api');

                              // Direct API call to backend
                              const response = await fetch(`http://localhost:5000/api/reports/${report._id}/status`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  status: report.status,
                                  notes: 'Status updated by admin'
                                })
                              });

                              if (response.ok) {
                                // Refresh both local data and trigger global stats update
                                await loadReportsData();

                                // Trigger a custom event to notify other components
                                window.dispatchEvent(new CustomEvent('reportStatusUpdated', {
                                  detail: { reportId: report._id, newStatus: report.status }
                                }));

                                alert('Status updated successfully! Community stats will refresh automatically.');
                              } else {
                                const errorData = await response.json();
                                throw new Error(errorData.error || 'Update failed');
                              }
                            } catch (error) {
                              console.error('Failed to update status:', error);
                              alert(`Failed to update status: ${error.message}`);
                            }
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;