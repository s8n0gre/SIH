import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      const status = apiService.getConnectionStatus();
      setIsConnected(status);
      setIsChecking(false);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking) return null;

  return (
    <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg text-sm font-medium z-50 ${
      isConnected 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
};

export default ConnectionStatus;