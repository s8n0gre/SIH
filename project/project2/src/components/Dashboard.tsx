
import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { useApp } from '../store/AppContext';

const Dashboard: React.FC = () => {
  const { reports, user } = useApp();
  const [activeTab, setActiveTab] = useState('my-reports');

  // Safety checks
  if (!reports) return <div>Loading...</div>;

  // Filter reports to show only current user's reports
  const myReports = (reports || []).filter(r => r?.author === user.username);
  const completedReports = myReports.filter(r => r?.status === 'completed');
  const inProgressReports = myReports.filter(r => r?.status === 'in-progress');
  const totalVotes = myReports.reduce((sum, r) => sum + (r?.votes || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Track your reports and community engagement</p>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{myReports.length}</div>
              <div className="text-sm text-gray-600">Reports Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedReports.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{inProgressReports.length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalVotes}</div>
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
              {myReports.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                  <p className="text-gray-600">You haven't submitted any reports yet.</p>
                </div>
              ) : (
                myReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(report.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Department: {report.department}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.submitted}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">
                        {report.status === 'completed' ? '100' :
                         report.status === 'in-progress' ? '50' : '10'}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          report.status === 'completed' ? 'bg-green-600' :
                          report.status === 'in-progress' ? 'bg-yellow-600' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${
                          report.status === 'completed' ? '100' :
                          report.status === 'in-progress' ? '50' : '10'
                        }%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{report.votes} votes</span>
                      </div>
                      <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                        <MessageSquare className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                    {report.status !== 'completed' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Follow Up
                      </button>
                    )}
                  </div>
                </div>
                ))
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