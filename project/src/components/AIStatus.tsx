import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff } from 'lucide-react';

const AIStatus: React.FC = () => {
  const [localServerStatus, setLocalServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkLocalServer();
  }, []);

  const checkLocalServer = async () => {
    try {
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        timeout: 3000
      } as any);
      
      if (response.ok) {
        setLocalServerStatus('online');
      } else {
        setLocalServerStatus('offline');
      }
    } catch (error) {
      setLocalServerStatus('offline');
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <Cpu className="w-3 h-3" />
      <span>Local AI:</span>
      {localServerStatus === 'checking' && (
        <span className="text-yellow-600">Checking...</span>
      )}
      {localServerStatus === 'online' && (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="w-3 h-3" />
          <span>Online</span>
        </div>
      )}
      {localServerStatus === 'offline' && (
        <div className="flex items-center gap-1 text-red-600">
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      )}
    </div>
  );
};

export default AIStatus;