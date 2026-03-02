import React, { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useApp } from '../store/AppContext';

const MiniMap: React.FC = () => {
  const { reports, currentLocation, selectedCategory } = useApp();
  const [map, setMap] = useState<any>(null);

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(report => report.category === selectedCategory);

  useEffect(() => {
    let mapInstance: any = null;

    const initializeMap = () => {
      const L = (window as any).L;
      const container = document.getElementById('mini-map');
      
      if (!container) return;
      
      // Clear any existing map
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }
      
      try {
        mapInstance = L.map('mini-map', {
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true,
          zoomControl: true
        }).setView([34.0522, -118.2437], 12);
        setMap(mapInstance);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Add user location if available
        if (currentLocation) {
          L.circleMarker([currentLocation.lat, currentLocation.lng], {
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.8,
            radius: 6,
            weight: 2
          }).addTo(mapInstance).bindPopup('Your Location');
          mapInstance.setView([currentLocation.lat, currentLocation.lng], 13);
        }

        // Add markers for reports
        filteredReports.forEach((report) => {
          if (report.coordinates.lat && report.coordinates.lng) {
            const color = report.status === 'completed' ? 'green' : 
                         report.status === 'in-progress' ? 'orange' : 'red';
            
            const marker = L.circleMarker([report.coordinates.lat, report.coordinates.lng], {
              color: 'white',
              fillColor: color,
              fillOpacity: 0.8,
              radius: 5,
              weight: 1
            }).addTo(mapInstance);
            
            marker.bindPopup(`<b>${report.title}</b><br/>Status: ${report.status}<br/>Votes: ${report.votes}`);
          }
        });
      } catch (error) {
        console.error('Error initializing mini map:', error);
      }
    };

    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        setTimeout(initializeMap, 100);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(initializeMap, 100);
    }

    return () => {
      try {
        if (mapInstance) {
          mapInstance.remove();
          mapInstance = null;
        }
        setMap(null);
        const container = document.getElementById('mini-map');
        if (container) {
          container._leaflet_id = null;
        }
      } catch (error) {
        console.error('Error cleaning up mini map:', error);
      }
    };
  }, [filteredReports, currentLocation]);

  return (
    <div className="fixed bottom-20 right-4 w-48 h-32 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden z-20">
      <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-90 rounded-lg px-2 py-1">
        <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <Navigation className="w-3 h-3" />
          <span>Quick View</span>
        </div>
      </div>
      <div id="mini-map" className="w-full h-full"></div>
      <div className="absolute bottom-2 right-2 flex gap-1">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default MiniMap;