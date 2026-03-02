import React, { useState, useEffect } from 'react';
import { apiService, MINICPM_SERVER } from '../services/api';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline';
  port?: number;
}

const ConnectionStatus: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      
      // 1. Check backend and database status from the single health endpoint
      const backendStatus = apiService.getBackendStatus();
      const backendIsOnline = backendStatus && backendStatus.status === 'ok';
      const dbIsOnline = backendIsOnline && backendStatus.database === 'connected';

      // 2. Check MiniCPM server status
      const miniCpmIsOnline = await apiService.checkMiniCPMHealth();
      
      // 3. Check ASR server status
      const asrIsOnline = await apiService.checkASRHealth();

      const statuses: ServiceStatus[] = [
        {
          name: 'Frontend',
          status: 'online', // If this component is running, the frontend is online
          port: 3000
        },
        {
          name: 'Backend API',
          status: backendIsOnline ? 'online' : 'offline',
          port: 5000
        },
        {
          name: 'MongoDB',
          status: dbIsOnline ? 'online' : 'offline',
          port: 27017
        },
        {
          name: 'MiniCPM AI',
          status: miniCpmIsOnline ? 'online' : 'offline',
          port: parseInt(MINICPM_SERVER.split(':')[2]) // Extract port from URL
        },
        {
          name: 'ASR Server',
          status: asrIsOnline ? 'online' : 'offline',
          port: 8000
        }
      ];
      
      setServiceStatuses(statuses);
      setIsChecking(false);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (isChecking && serviceStatuses.length === 0) return null;

  const workingServices = serviceStatuses.filter(s => s.status === 'online');
  const totalServices = serviceStatuses.length;
  
  const getStatusColor = () => {
    if (workingServices.length === totalServices) return 'green';
    if (workingServices.length >= 2) return 'yellow'; // At least frontend and backend
    return 'red';
  };
  
  const statusColor = getStatusColor();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
          statusColor === 'green' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : statusColor === 'yellow'
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            statusColor === 'green' ? 'bg-green-500' : 
            statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          Services ({workingServices.length}/{totalServices})
        </div>
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-48">
          <div className="font-semibold mb-2">Service Status:</div>
          <div className="space-y-1">
            {serviceStatuses.map(({ name, status, port }) => (
              <div key={name} className="flex justify-between items-center">
                <span>{name}</span>
                <div className="flex items-center gap-2">
                  {port && <span>:{port}</span>}
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'online' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;