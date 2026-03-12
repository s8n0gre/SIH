import React from 'react';
import { Building2, ArrowRight, Shield, Users, FileText, BarChart3 } from 'lucide-react';
import { useUserLocation } from '../hooks/useUserLocation';

interface IntroPageProps {
  onContinue: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onContinue }) => {
  const userLocation = useUserLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen text-white">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Building2 className="w-12 h-12 text-blue-800" />
          </div>
          <h1 className="text-5xl font-bold mb-4">CIVIC PORTAL</h1>
          <p className="text-xl text-blue-100 mb-2">GOVERNMENT SERVICES</p>
          <p className="text-lg text-blue-200">State of {userLocation.region} • Official Portal</p>
        </div>

        <div className="max-w-4xl text-center mb-12">
          <h2 className="text-3xl font-semibold mb-6">Digital Governance Platform</h2>
          <p className="text-lg text-blue-100 leading-relaxed mb-8">
            Welcome to the official digital platform for civic engagement and public service management.
            This portal enables citizens to report issues, track progress, and engage with government services
            through a secure, transparent, and efficient system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-4 text-blue-200" />
            <h3 className="font-semibold mb-2">Submit Reports</h3>
            <p className="text-sm text-blue-100">File civic issues and service requests</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-4 text-blue-200" />
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-blue-100">Monitor status of submitted requests</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-4 text-blue-200" />
            <h3 className="font-semibold mb-2">Community</h3>
            <p className="text-sm text-blue-100">View public records and engage</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-blue-200" />
            <h3 className="font-semibold mb-2">Secure Access</h3>
            <p className="text-sm text-blue-100">Protected government services</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-white text-blue-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center gap-3 shadow-xl"
          >
            Access Portal
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-blue-200 mt-4">Authorized personnel and registered citizens only</p>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;