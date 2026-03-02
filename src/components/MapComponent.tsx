import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Report {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
}

interface MapComponentProps {
  reports?: Report[];
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  showReports?: boolean;
  height?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  reports = [], 
  onLocationSelect, 
  showReports = true,
  height = "400px" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && !leafletMapRef.current) {
        createLeafletMap(23.6102, 85.2799);
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const createLeafletMap = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], 13);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (onLocationSelect) {
      const centerIcon = L.divIcon({
        className: 'custom-center-icon',
        html: '<div style="color: red; font-size: 32px; margin-left: -16px; margin-top: -32px;">📍</div>',
        iconSize: [32, 32]
      });

      markerRef.current = L.marker([lat, lng], { 
        icon: centerIcon,
        draggable: true 
      }).addTo(map);

      markerRef.current.on('dragend', async () => {
        const pos = markerRef.current!.getLatLng();
        await reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', async (e: L.LeafletMouseEvent) => {
        markerRef.current?.setLatLng(e.latlng);
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      reverseGeocode(lat, lng);
    }

    if (showReports) {
      displayReportMarkers(map, reports);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelectedAddress(address);
      if (onLocationSelect) {
        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelectedAddress(address);
      if (onLocationSelect) {
        onLocationSelect(lat, lng, address);
      }
    }
  };

  const displayReportMarkers = (map: L.Map, reportsData: Report[]) => {
    const statusColors: Record<string, string> = {
      'open': '#EF4444',
      'pending': '#EF4444',
      'assigned': '#EAB308',
      'in_progress': '#F97316',
      'in-progress': '#F97316',
      'resolved': '#10B981',
      'rejected': '#6B7280'
    };

    reportsData.forEach(report => {
      if (report.location?.latitude && report.location?.longitude) {
        const normalizedStatus = report.status?.toLowerCase().replace(/-/g, '_');
        const color = statusColors[normalizedStatus] || statusColors[report.status] || '#3B82F6';
        
        const pinIcon = L.divIcon({
          className: 'custom-pin-icon',
          html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" 
              fill="${color}" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#fff"/>
          </svg>`,
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -42]
        });

        const marker = L.marker(
          [report.location.latitude, report.location.longitude],
          { icon: pinIcon }
        ).addTo(map);

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="font-weight: bold; margin-bottom: 8px;">${report.title}</h4>
            <p style="font-size: 14px; margin-bottom: 4px;">${report.description}</p>
            <p style="font-size: 12px; color: #666;"><strong>Status:</strong> ${report.status}</p>
            <p style="font-size: 12px; color: #666;"><strong>Category:</strong> ${report.category}</p>
          </div>
        `);
      }
    });
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {onLocationSelect && selectedAddress && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 mb-1">Selected Location:</p>
              <p className="text-sm text-gray-900 break-words">{selectedAddress}</p>
              <p className="text-xs text-gray-500 mt-1">Drag the pin or click on the map to change location</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
