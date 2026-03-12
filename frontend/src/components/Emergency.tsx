import React, { useState } from 'react';
import { AlertTriangle, Phone, Zap, Flame, Car, Shield } from 'lucide-react';

const Emergency: React.FC = () => {
  const [selectedEmergency, setSelectedEmergency] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emergencyTypes = [
    { id: 'electrical', label: 'Electrical Hazard', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { id: 'fire', label: 'Fire Risk', icon: Flame, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 'traffic', label: 'Traffic Emergency', icon: Car, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'public-safety', label: 'Public Safety', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCall911 = () => {
    // In a real app, this would trigger emergency calling functionality
    alert('Emergency services would be contacted immediately');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Emergency Report Submitted</h1>
          <p className="text-red-700 mb-6">
            Your emergency report has been submitted with high priority. The appropriate emergency services 
            and municipal departments have been notified immediately.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Report ID: ER-2024-001</h3>
            <p className="text-sm text-gray-600">Expected response time: 15-30 minutes</p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Report Another Emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-red-800">Emergency Reporting</h1>
        </div>
        <p className="text-red-700 text-lg">
          Use this form to report immediate safety hazards and dangerous situations that require urgent attention.
        </p>
        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-gray-900">For life-threatening emergencies, call 911 first</span>
          </div>
          <button
            onClick={handleCall911}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Call Emergency Services
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emergency Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Emergency Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {emergencyTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedEmergency(type.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:bg-gray-50 ${
                      selectedEmergency === type.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.bg}`}>
                        <IconComponent className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exact Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Street address, intersection, or landmark"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe the emergency situation in detail. Include any immediate dangers or safety concerns."
              required
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Important Notice</h3>
                <p className="text-sm text-yellow-700">
                  Emergency reports are given highest priority and are immediately forwarded to the appropriate 
                  emergency services and municipal departments. False emergency reports may result in penalties.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedEmergency}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Submit Emergency Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default Emergency;