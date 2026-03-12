import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const ServerStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET'
      });
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        <span>Checking server...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Server Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Server Offline</span>
          <div className="ml-2 text-xs text-gray-500">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Run start-all-services.bat
          </div>
        </>
      )}
    </div>
  );
};

export default ServerStatus;