import React from 'react';
import { MapPin, Clock, Users, CheckCircle } from 'lucide-react';

interface HomePageProps {
  setActiveTab?: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const stats = [
    { label: 'Issues Reported', value: '2,847', icon: MapPin, color: 'text-blue-600' },
    { label: 'In Progress', value: '184', icon: Clock, color: 'text-yellow-600' },
    { label: 'Citizens Active', value: '15,203', icon: Users, color: 'text-purple-600' },
    { label: 'Resolved', value: '2,663', icon: CheckCircle, color: 'text-green-600' },
  ];

  const recentIssues = [
    { id: 1, title: 'Pothole on Main Street', department: 'Roads', status: 'In Progress', votes: 23 },
    { id: 2, title: 'Broken Streetlight', department: 'Electricity', status: 'Pending', votes: 15 },
    { id: 3, title: 'Garbage Collection Missed', department: 'Waste Management', status: 'Completed', votes: 8 },
    { id: 4, title: 'Water Leak at Park', department: 'Water Services', status: 'In Progress', votes: 31 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'In Progress': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 mb-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Report Municipal Issues with Ease</h1>
          <p className="text-xl text-blue-100 mb-6">
            Help improve your community by reporting issues directly to the relevant departments. 
            Track progress and see real-time updates on resolution status.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setActiveTab?.('report')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Report an Issue
            </button>
            <button 
              onClick={() => setActiveTab?.('map')}
              className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Map
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const getClickHandler = () => {
            if (stat.label === 'Issues Reported') return () => setActiveTab?.('feed');
            if (stat.label === 'In Progress') return () => setActiveTab?.('dashboard');
            if (stat.label === 'Citizens Active') return () => setActiveTab?.('dashboard');
            if (stat.label === 'Resolved') return () => setActiveTab?.('dashboard');
            return undefined;
          };
          return (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 bg-gradient-to-br from-white to-gray-50"
              onClick={getClickHandler()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <IconComponent className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Report Issue</h3>
            <p className="text-gray-600">Submit photos, location, and description of the issue you've encountered.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Community Votes</h3>
            <p className="text-gray-600">Citizens vote on issues to help prioritize them based on urgency and impact.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Track Progress</h3>
            <p className="text-gray-600">Monitor the status of your reports and receive updates when issues are resolved.</p>
          </div>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Issues</h2>
          <button 
            onClick={() => setActiveTab?.('feed')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentIssues.map((issue) => (
            <div 
              key={issue.id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer hover:shadow-md"
              onClick={() => setActiveTab?.('map')}
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                <p className="text-sm text-gray-600 mt-1">Department: {issue.department}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{issue.votes}</p>
                  <p className="text-xs text-gray-500">votes</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default HomePage;