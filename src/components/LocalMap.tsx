import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Bus, Hotel, UtensilsCrossed, Cross, Plus, Moon, Sun, Filter, TrendingUp, Clock } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface MapReport {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  lat: number;
  lng: number;
}

const LocalMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [reports, setReports] = useState<MapReport[]>([]);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const tileLayerRef = useRef<any>(null);

  const services = [
    { id: 'transport', name: 'Transport', icon: Bus, color: 'bg-blue-500' },
    { id: 'lodges', name: 'Lodges', icon: Hotel, color: 'bg-purple-500' },
    { id: 'food', name: 'Food', icon: UtensilsCrossed, color: 'bg-orange-500' },
    { id: 'pharmacy', name: 'Pharmacy', icon: Cross, color: 'bg-red-500' },
    { id: 'custom', name: 'Custom', icon: Plus, color: 'bg-gray-500' }
  ];

  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = window.L.map(mapRef.current).setView([23.3441, 85.3096], 13);

    tileLayerRef.current = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    getCurrentLocation();
    loadReports();
  };

  const toggleMapTheme = () => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    
    mapInstance.current.removeLayer(tileLayerRef.current);
    
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    tileLayerRef.current = window.L.tileLayer(
      newTheme 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap contributors' }
    ).addTo(mapInstance.current);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          const userIcon = window.L.divIcon({
            html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            className: 'user-location-marker',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          window.L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstance.current)
            .bindPopup('Your Location');

          mapInstance.current.setView([latitude, longitude], 15);
        },
        () => {}
      );
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports');
      const data = await response.json();

      const mapReports: MapReport[] = data.map((report: any) => ({
        id: report._id || report.id,
        title: report.title,
        status: report.status === 'resolved' ? 'completed' :
          report.status === 'in_progress' ? 'in-progress' :
          'pending',
        category: report.category,
        lat: report?.location?.coordinates?.latitude ?? 23.3441 + (Math.random() - 0.5) * 0.02,
        lng: report?.location?.coordinates?.longitude ?? 85.3096 + (Math.random() - 0.5) * 0.02
      }));

      setReports(mapReports);
      addReportMarkers(mapReports);
    } catch {
      const mockReports: MapReport[] = [
        { id: '1', title: 'Water Leak', status: 'pending', category: 'Water', lat: 23.3441, lng: 85.3096 },
        { id: '2', title: 'Road Repair', status: 'in-progress', category: 'Roads', lat: 23.3500, lng: 85.3150 },
        { id: '3', title: 'Street Light', status: 'completed', category: 'Electricity', lat: 23.3400, lng: 85.3050 }
      ];
      setReports(mockReports);
      addReportMarkers(mockReports);
    }
  };

  const addReportMarkers = (reports: MapReport[]) => {
    if (!mapInstance.current) return;

    reports.forEach(report => {
      const color = report.status === 'completed' ? '#10b981' :
        report.status === 'in-progress' ? '#f59e0b' : '#ef4444';

      const icon = window.L.divIcon({
        html: `<div style="background: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
        className: 'report-marker',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      window.L.marker([report.lat, report.lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="font-size: 12px;">
            <strong>${report.title}</strong><br>
            <span style="color: ${color};">${report.status.replace('-', ' ')}</span><br>
            <small>${report.category}</small>
          </div>
        `);
    });
  };

  const showServiceLocations = (serviceId: string) => {
    if (!mapInstance.current || !userLocation) return;

    mapInstance.current.eachLayer((layer: any) => {
      if (layer.options && layer.options.serviceMarker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    if (activeService === serviceId) {
      setActiveService(null);
      return;
    }

    setActiveService(serviceId);

    const mockLocations = Array.from({ length: 5 }, (_, i) => ({
      lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
      name: `${services.find(s => s.id === serviceId)?.name} ${i + 1}`
    }));

    const service = services.find(s => s.id === serviceId);
    const color = service?.color.replace('bg-', '').replace('-500', '');
    const colorMap: { [key: string]: string } = {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      orange: '#f97316',
      red: '#ef4444',
      gray: '#6b7280'
    };

    mockLocations.forEach(location => {
      const icon = window.L.divIcon({
        html: `<div style="background: ${colorMap[color || 'gray']}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'service-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      window.L.marker([location.lat, location.lng], {
        icon,
        serviceMarker: true
      })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="font-size: 12px;">
            <strong>${location.name}</strong><br>
            <small>Click for directions</small>
          </div>
        `);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[450px]">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Local Issues Map
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMapTheme}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Toggle map theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
          </button>
          <button
            onClick={getCurrentLocation}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Center on my location"
          >
            <Navigation className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div
        ref={mapRef}
        className="flex-1 min-h-[250px] w-full dark:brightness-75 dark:contrast-125"
      />

      <div className="p-3 overflow-y-auto h-[180px] bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Resolved</span>
            </div>
          </div>
          <span className="text-gray-500 dark:text-gray-400">{reports.length} issues</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Issues</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Resolved</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">{reports.filter(r => r.status === 'pending').length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-2">
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">Active</span>
            </div>
            <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{reports.filter(r => r.status === 'in-progress').length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-medium">Resolved</span>
            </div>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">{reports.filter(r => r.status === 'completed').length}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nearby Services</h4>
          <div className="flex flex-wrap gap-2">
            {services.map(service => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => showServiceLocations(service.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeService === service.id
                      ? `${service.color} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {service.name}
                </button>
              );
            })}
          </div>
          {activeService && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Showing nearby {services.find(s => s.id === activeService)?.name.toLowerCase()} locations
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalMap;
