import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Filter, Download, User, MapPin, Calendar, Map, GitBranch, Shield, Wrench, Lock, BarChart2, GitMerge, Settings, LayoutDashboard, Flag, MessageSquare } from 'lucide-react';
import MapComponent from './MapComponent';
import { useUserLocation } from '../hooks/useUserLocation';
import RoutingRuleEngine from './RoutingRuleEngine';
import TriageQueue from './TriageQueue';
import RBACManager from './RBACManager';
import WorkOrderManager from './WorkOrderManager';
import AuditLog from './AuditLog';
import AnalyticsDashboard from './AnalyticsDashboard';

interface DepartmentData {
  department: string; count: number; color: string; trend: 'up' | 'down' | 'stable';
}

interface Report {
  _id: string; ticketNumber?: string; title: string; description: string; category: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  locationAddress: string; latitude?: number; longitude?: number;
  reportedBy: { username: string }; createdAt: string; upvotes: number; downvotes: number;
}

const TABS = [
  { id: 'analytics', label: 'Analytics & SLA', icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'reports', label: 'Reports', icon: <Flag className="w-5 h-5" /> },
  { id: 'triage', label: 'Triage Queue', icon: <GitMerge className="w-5 h-5" /> },
  { id: 'work-orders', label: 'Work Orders', icon: <Wrench className="w-5 h-5" /> },
  { id: 'routing', label: 'Routing Rules', icon: <GitBranch className="w-5 h-5" /> },
  { id: 'rbac', label: 'RBAC Access', icon: <Shield className="w-5 h-5" /> },
  { id: 'audit', label: 'Audit Log', icon: <Lock className="w-5 h-5" /> },
  { id: 'map', label: 'Map View', icon: <Map className="w-5 h-5" /> },
];

const AdminDashboard: React.FC = () => {
  const [issuesData, setIssuesData] = useState<DepartmentData[]>([]);
  const userLocation = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => { loadReportsData(); }, []);

  const loadReportsData = async () => {
    try {
      const { apiService } = await import('../services/api');
      const reportsData = await apiService.getReports();

      const transformedReports = reportsData.map((report: any) => ({
        _id: report._id || report.id, ticketNumber: report.ticketNumber || '',
        title: report.title, description: report.description, category: report.category, status: report.status,
        locationAddress: report.locationAddress || report.location?.address || report.location || 'Unknown',
        latitude: report.latitude ?? report.location?.coordinates?.latitude ?? 23.6102,
        longitude: report.longitude ?? report.location?.coordinates?.longitude ?? 85.2799,
        reportedBy: { username: report.reportedBy?.username || report.author || 'Anonymous' },
        createdAt: report.createdAt || new Date().toISOString(),
        upvotes: report.upvotes ?? report.votes?.upvotes ?? 0,
        downvotes: report.downvotes ?? report.votes?.downvotes ?? 0
      }));

      setReports(transformedReports);

      const departmentCounts: { [key: string]: number } = {};
      transformedReports.forEach(r => { const dept = r.category || r.department || 'Other'; departmentCounts[dept] = (departmentCounts[dept] || 0) + 1; });
      const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
      const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];

      setIssuesData(Object.entries(departmentCounts).map(([department, count], index) => ({
        department, count, color: colors[index % colors.length], trend: trends[Math.floor(Math.random() * trends.length)]
      })).sort((a, b) => b.count - a.count));

    } catch (error) {
      console.error('Error loading reports:', error);
      const demoReports: Report[] = [
        { _id: '1', ticketNumber: 'TKT-DEMO-001', title: 'Water Leakage on Station Road', description: 'Major water pipe burst causing flooding', category: 'Water Services', status: 'open', locationAddress: `Station Road, ${userLocation.city}`, latitude: 23.3441, longitude: 85.3096, reportedBy: { username: 'Demoresident' }, createdAt: new Date(Date.now() - 3600000).toISOString(), upvotes: 23, downvotes: 1 },
        { _id: '2', ticketNumber: 'TKT-DEMO-002', title: 'Broken Traffic Signal', description: 'Traffic signal malfunctioning for 2 days', category: 'Public Safety', status: 'in_progress', locationAddress: `Albert Ekka Chowk, ${userLocation.city}`, latitude: 23.3569, longitude: 85.3346, reportedBy: { username: 'SafetyFirst' }, createdAt: new Date(Date.now() - 7200000).toISOString(), upvotes: 18, downvotes: 0 }
      ];
      setReports(demoReports);
      setIssuesData([
        { department: 'Water Services', count: 12, color: '#3B82F6', trend: 'down' },
        { department: 'Public Safety', count: 8, color: '#EC4899', trend: 'up' },
        { department: 'Roads & Infrastructure', count: 24, color: '#EF4444', trend: 'stable' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalIssues = issuesData.reduce((sum, item) => sum + item.count, 0);
  const avgIssuesPerDept = issuesData.length ? Math.round(totalIssues / issuesData.length) : 0;
  const highPriorityDepts = issuesData.filter(item => item.count > avgIssuesPerDept).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-transparent border-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300">

      {/* ── Left Sidebar (Desktop) ── */}
      <aside className="w-full md:w-64 flex-shrink-0 border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)' }}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>Civic Control</h1>
              <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--text-faint)' }}>Admin Workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2 ml-2" style={{ color: 'var(--text-faint)' }}>Operations</p>
            {TABS.slice(0, 4).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab.id ? 'var(--accent-subtle)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)'
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}

            <p className="text-[10px] font-bold uppercase tracking-wider mt-6 mb-2 ml-2" style={{ color: 'var(--text-faint)' }}>System</p>
            {TABS.slice(4).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab.id ? 'var(--accent-subtle)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b z-10" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>

          <div className="flex items-center gap-4">
            <button onClick={loadReportsData} className="btn-secondary px-3 py-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5 mr-1" /> Sync</button>
            <button className="btn-primary px-3 py-1.5 text-xs"><Download className="w-3.5 h-3.5 mr-1" /> Export CSV</button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* Global Metric Sparks (always visible unless map) */}
          {activeTab !== 'map' && activeTab !== 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Issues</p>
                  <AlertCircle className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
                </div>
                <p className="text-3xl font-bold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>{totalIssues}</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Departments</p>
                  <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                </div>
                <p className="text-3xl font-bold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>{issuesData.length}</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>High Priority</p>
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
                </div>
                <p className="text-3xl font-bold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>{highPriorityDepts}</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg Per Dept</p>
                  <Clock className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <p className="text-3xl font-bold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>{avgIssuesPerDept}</p>
              </div>
            </div>
          )}

          {/* Active View Container */}
          <div className="animate-fade-up">
            {activeTab === 'analytics' && <div className="card p-6 min-h-[500px]"><AnalyticsDashboard /></div>}
            {activeTab === 'triage' && <div className="card p-6 min-h-[500px]"><TriageQueue /></div>}
            {activeTab === 'work-orders' && <div className="card p-6 min-h-[500px]"><WorkOrderManager /></div>}
            {activeTab === 'routing' && <div className="card p-6 min-h-[500px]"><RoutingRuleEngine /></div>}
            {activeTab === 'rbac' && <div className="card p-6 min-h-[500px]"><RBACManager /></div>}
            {activeTab === 'audit' && <div className="card p-6 min-h-[500px]"><AuditLog /></div>}

            {activeTab === 'map' && (
              <div className="card p-6 h-[700px] flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Spatial Intelligence</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Geographical distribution of active tickets</p>
                </div>
                <div className="flex-1 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <MapComponent reports={reports.map(r => ({ ...r, location: { latitude: r.latitude || 23.6102, longitude: r.longitude || 85.2799, address: r.locationAddress || 'Unknown' } }))} showReports={true} height="100%" />
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="card min-h-[600px] overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm py-1 px-3 w-40">
                      <option value="all">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{reports.length} Records found</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        {['ID / Ticket', 'Issue Title', 'Status', 'Location', 'Reporter', 'Date', 'Actions'].map(col => (
                          <th key={col} className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--border)' }}>
                      {reports.filter(r => statusFilter === 'all' || r.status === statusFilter).map(report => (
                        <tr key={report._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 cursor-pointer group">
                            <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{report._id.substring(0, 8)}</span>
                            {report.ticketNumber && <div className="text-[10px] uppercase font-semibold mt-1" style={{ color: 'var(--text-faint)' }}>{report.ticketNumber}</div>}
                          </td>
                          <td className="px-4 py-3 max-w-[250px]">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{report.title}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{report.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.status === 'resolved' ? 'bg-green-100/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                                report.status === 'in_progress' ? 'bg-amber-100/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                  report.status === 'rejected' ? 'bg-red-100/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                                    'bg-gray-100/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
                              }`}>
                              {report.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <MapPin className="w-3.5 h-3.5" /> <span className="truncate max-w-[150px]">{report.locationAddress}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                              <User className="w-3 h-3" style={{ color: 'var(--text-faint)' }} /> {report.reportedBy.username}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <select value={report.status} onChange={async (e) => {
                              const newStatus = e.target.value as Report['status'];
                              setReports(prev => prev.map(r => r._id === report._id ? { ...r, status: newStatus } : r));
                              try {
                                const response = await fetch(`${API_BASE}/api/reports/${report._id}/status`, {
                                  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, notes: 'Status updated by admin' })
                                });
                                if (response.ok) { await loadReportsData(); window.dispatchEvent(new CustomEvent('reportStatusUpdated')); }
                              } catch (error) { console.error(error); }
                            }}
                              className="input-field text-xs py-1 px-2 pr-8 font-semibold w-full">
                              <option value="open">Open</option>
                              <option value="assigned">Assigned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;