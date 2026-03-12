import React, { useState, useEffect } from 'react';
import { Server, Wifi, WifiOff } from 'lucide-react';

interface ServerStatus {
  name: string;
  port: number;
  endpoint: string;
  status: 'checking' | 'online' | 'offline';
}

const AIStatus: React.FC = () => {
  const [servers, setServers] = useState<ServerStatus[]>([
    { name: 'Backend', port: 5005, endpoint: '/api/health', status: 'checking' as const },
    { name: 'AI Vision', port: 5007, endpoint: '/ai-vision/health', status: 'checking' as const },
    { name: 'Speech', port: 8000, endpoint: '/speech/health', status: 'checking' as const },
    { name: 'App', port: 3000, endpoint: '/health', status: 'checking' as const }
  ]);

  useEffect(() => {
    checkAllServers();
    const interval = setInterval(checkAllServers, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkAllServers = async () => {
    const updatedServers = await Promise.all(
      servers.map(async (server) => {
        try {
          const response = await fetch(server.endpoint, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
          });
          return { ...server, status: (response.ok ? 'online' : 'offline') as 'online' | 'offline' };
        } catch {
          return { ...server, status: 'offline' as const };
        }
      })
    );
    setServers(updatedServers);
  };

  const onlineCount = servers.filter(s => s.status === 'online').length;
  const totalCount = servers.length;

  return (
    <div className="flex items-center gap-2 text-xs">
      <Server className="w-3 h-3" />
      <span>Services: {onlineCount}/{totalCount}</span>
      <div className="flex gap-1">
        {servers.map((server) => (
          <div key={server.name} className="flex items-center gap-1" title={`${server.name} (${server.port})`}>
            {server.status === 'online' ? (
              <Wifi className="w-3 h-3 text-green-600" />
            ) : server.status === 'offline' ? (
              <WifiOff className="w-3 h-3 text-red-600" />
            ) : (
              <div className="w-3 h-3 border border-yellow-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIStatus;