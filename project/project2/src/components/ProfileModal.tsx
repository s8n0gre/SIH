import React, { useState } from 'react';
import { X, User, Mail, Phone, Edit3, Award, MapPin } from 'lucide-react';
import { useApp } from '../store/AppContext';

const ProfileModal: React.FC = () => {
  const { showProfileModal, setShowProfileModal, user, updateUser, reports } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);

  const userReports = reports.filter(report => report.author === user.username);

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
  };

  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={() => setShowProfileModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-4">
          {/* Profile Picture & Basic Info */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                className="text-xl font-bold text-center border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
            )}
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {user.reputationPoints} pts
              </span>
              <span>{user.issuesReported} reports</span>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{user.bio}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-700">{user.email}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.mobile}
                  onChange={(e) => setEditData(prev => ({ ...prev, mobile: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-700">{user.mobile}</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{userReports.length}</div>
              <div className="text-xs text-gray-600">Reported</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {userReports.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Resolved</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {userReports.reduce((sum, r) => sum + r.votes, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Votes</div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Reports</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {userReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 truncate">{report.title}</div>
                    <div className="text-xs text-gray-500">{report.submitted}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${report.status === 'completed' ? 'bg-green-100 text-green-800' : report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {report.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(user);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;