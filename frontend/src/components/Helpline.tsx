import React from 'react';
import { Phone, Clock, MapPin, AlertCircle } from 'lucide-react';

const Helpline: React.FC = () => {
  const helplineNumbers = [
    {
      department: 'Roads & Infrastructure',
      number: '1800-123-4567',
      shortCode: '*567#',
      timing: '24/7',
      description: 'Report potholes, road damage, traffic signals'
    },
    {
      department: 'Water Services',
      number: '1800-123-4568',
      shortCode: '*568#',
      timing: '24/7',
      description: 'Water leaks, supply issues, drainage problems'
    },
    {
      department: 'Electricity',
      number: '1800-123-4569',
      shortCode: '*569#',
      timing: '24/7',
      description: 'Power outages, street lights, electrical hazards'
    },
    {
      department: 'Waste Management',
      number: '1800-123-4570',
      shortCode: '*570#',
      timing: '6 AM - 10 PM',
      description: 'Garbage collection, overflowing bins, illegal dumping'
    },
    {
      department: 'Parks & Recreation',
      number: '1800-123-4571',
      shortCode: '*571#',
      timing: '8 AM - 6 PM',
      description: 'Park maintenance, playground issues, tree problems'
    },
    {
      department: 'Public Safety',
      number: '1800-123-4572',
      shortCode: '*572#',
      timing: '24/7',
      description: 'Safety hazards, broken infrastructure, emergencies'
    },
    {
      department: 'General Complaints',
      number: '1800-123-4500',
      shortCode: '*500#',
      timing: '24/7',
      description: 'All civic issues, general complaints, information'
    }
  ];

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const handleUSSD = (shortCode: string) => {
    window.open(`tel:${shortCode}`, '_self');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <Phone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Helpline Numbers</h1>
            <p className="text-gray-600 dark:text-gray-300">For button phone users - Call directly to report issues</p>
          </div>

          {/* Emergency Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Emergency Services</h3>
                <p className="text-red-700 text-sm mb-2">For life-threatening emergencies, call:</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <button 
                    onClick={() => handleCall('100')}
                    className="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700"
                  >
                    Police: 100
                  </button>
                  <button 
                    onClick={() => handleCall('101')}
                    className="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700"
                  >
                    Fire: 101
                  </button>
                  <button 
                    onClick={() => handleCall('108')}
                    className="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700"
                  >
                    Ambulance: 108
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Helpline Numbers */}
          <div className="grid gap-6">
            {helplineNumbers.map((helpline, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{helpline.department}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{helpline.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{helpline.timing}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Toll-Free Number */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">TOLL-FREE NUMBER</label>
                    <button
                      onClick={() => handleCall(helpline.number)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      {helpline.number}
                    </button>
                  </div>

                  {/* USSD Short Code */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">USSD SHORT CODE</label>
                    <button
                      onClick={() => handleUSSD(helpline.shortCode)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      {helpline.shortCode}
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Tap to call directly from your phone
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">How to Use</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Choose the appropriate department for your complaint</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Call the toll-free number or dial the USSD short code</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Provide your location and describe the issue clearly</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Note down the complaint reference number for tracking</span>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 inline mr-1" />
              Services available in: Hindi, English, Santali, Ho, Mundari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpline;