import React, { useEffect, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

const MapView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Mock data for Jharkhand, India
  const reports = [
    { 
      id: '1', 
      title: 'Pothole on Station Road', 
      coordinates: { lat: 23.3441, lng: 85.3096 }, 
      status: 'pending', 
      department: 'Roads & Infrastructure', 
      votes: 23,
      location: 'Station Road, Ranchi',
      submitted: '2024-01-15'
    },
    { 
      id: '2', 
      title: 'Broken Streetlight', 
      coordinates: { lat: 23.3500, lng: 85.3200 }, 
      status: 'in-progress', 
      department: 'Electricity', 
      votes: 15,
      location: 'Main Road, Ranchi',
      submitted: '2024-01-14'
    },
    { 
      id: '3', 
      title: 'Garbage Collection Missed', 
      coordinates: { lat: 23.3400, lng: 85.3000 }, 
      status: 'completed', 
      department: 'Waste Management', 
      votes: 8,
      location: 'Circular Road, Ranchi',
      submitted: '2024-01-13'
    },
    { 
      id: '4', 
      title: 'Water Leak at Kanke Dam', 
      coordinates: { lat: 23.4241, lng: 85.3188 }, 
      status: 'in-progress', 
      department: 'Water Services', 
      votes: 31,
      location: 'Kanke Dam Area, Ranchi',
      submitted: '2024-01-12'
    },
    { 
      id: '5', 
      title: 'Damaged Road near Jamshedpur', 
      coordinates: { lat: 22.8046, lng: 86.2029 }, 
      status: 'pending', 
      department: 'Roads & Infrastructure', 
      votes: 12,
      location: 'Bistupur, Jamshedpur',
      submitted: '2024-01-11'
    },
    { 
      id: '6', 
      title: 'Tree Blocking Path in Dhanbad', 
      coordinates: { lat: 23.7957, lng: 86.4304 }, 
      status: 'completed', 
      department: 'Parks & Recreation', 
      votes: 7,
      location: 'Bank More, Dhanbad',
      submitted: '2024-01-10'
    },
  ];

  const filters = [
    { value: 'all', label: 'All Issues', color: 'bg-gray-500' },
    { value: 'pending', label: 'Pending', color: 'bg-red-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  ];

  const filteredIssues = (reports || []).filter(
    (report) =>
      report &&
      (selectedFilter === 'all' || report.status === selectedFilter) &&
      (report.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Location access denied:', err)
      );
    }
  }, []);

  useEffect(() => {
    // Check if map is already initialized
    if (map) return;
    
    // Initialize map with CDN
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const L = (window as any).L;
      
      // Clear any existing map container
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.innerHTML = '';
      }
      
      const mapInstance = L.map('map').setView([23.3441, 85.3096], 10);
      setMap(mapInstance);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);
    };
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, []);

  useEffect(() => {
    if (map && (window as any).L) {
      const L = (window as any).L;
      
      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Add markers for reports
      filteredIssues.forEach((report) => {
        if (report && report.coordinates && 
            typeof report.coordinates.lat === 'number' && 
            typeof report.coordinates.lng === 'number' &&
            !isNaN(report.coordinates.lat) && 
            !isNaN(report.coordinates.lng)) {
          
          try {
            const color = report.status === 'completed' ? 'green' : 
                         report.status === 'in-progress' ? 'orange' : 'red';
            
            const isSelected = selectedReportId === report.id;
            
            // Create custom drop pin icon
            const dropPinIcon = L.divIcon({
              className: 'custom-drop-pin',
              html: `<div style="
                width: 30px;
                height: 30px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ${isSelected ? 'width: 40px; height: 40px; border-width: 4px;' : ''}
              "></div>`,
              iconSize: isSelected ? [40, 40] : [30, 30],
              iconAnchor: isSelected ? [20, 35] : [15, 25]
            });
            
            const marker = L.marker([report.coordinates.lat, report.coordinates.lng], {
              icon: dropPinIcon
            }).addTo(map);
            
            // Create detailed popup content
            const popupContent = `
              <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">${report.title}</h3>
                <div style="margin-bottom: 6px;">
                  <span style="font-size: 12px; color: #6b7280;">Department:</span>
                  <span style="font-size: 12px; color: #374151; margin-left: 4px;">${report.department}</span>
                </div>
                <div style="margin-bottom: 6px;">
                  <span style="font-size: 12px; color: #6b7280;">Status:</span>
                  <span style="font-size: 12px; padding: 2px 6px; border-radius: 12px; margin-left: 4px; background-color: ${
                    report.status === 'completed' ? '#dcfce7; color: #166534' :
                    report.status === 'in-progress' ? '#fef3c7; color: #92400e' :
                    '#fee2e2; color: #991b1b'
                  };">${report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 12px; color: #6b7280;">Votes:</span>
                  <span style="font-size: 12px; color: #374151; margin-left: 4px;">${report.votes}</span>
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">📍 ${report.location}</div>
                <div style="font-size: 11px; color: #9ca3af;">Reported: ${report.submitted}</div>
              </div>
            `;
            
            marker.bindPopup(popupContent, {
              maxWidth: 250,
              className: 'custom-popup'
            });
            
            // Auto-open popup and center on selected report
            if (isSelected) {
              map.setView([report.coordinates.lat, report.coordinates.lng], 16);
              marker.openPopup();
            }
          } catch (error) {
            console.error('Error adding marker for report:', report.id, error);
          }
        }
      });
    }
  }, [map, filteredIssues, selectedReportId]);

  const handleIssueClick = (report: any) => {
    if (map && report.coordinates && report.coordinates.lat && report.coordinates.lng) {
      setSelectedReportId(report.id);
      // Set view to the report location
      map.setView([report.coordinates.lat, report.coordinates.lng], 16);
      
      // Find and open the popup for this marker
      setTimeout(() => {
        map.eachLayer((layer: any) => {
          if (layer.getLatLng) {
            const latLng = layer.getLatLng();
            const latDiff = Math.abs(latLng.lat - report.coordinates.lat);
            const lngDiff = Math.abs(latLng.lng - report.coordinates.lng);
            
            if (latDiff < 0.0001 && lngDiff < 0.0001) {
              layer.openPopup();
            }
          }
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Issue Map</h1>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search issues..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${filter.color}`}></div>
                    {filter.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map + List */}
        <div className="flex flex-col lg:flex-row">
          {/* Interactive Map */}
          <div className="lg:w-2/3 h-96 lg:h-[600px] relative border-r border-gray-200">
            <div id="map" className="w-full h-full"></div>
          </div>

          {/* Issue List */}
          <div className="lg:w-1/3 lg:border-l border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Issues ({filteredIssues.length})
              </h2>
              
              <div className="space-y-4 max-h-96 lg:max-h-[520px] overflow-y-auto">
                {filteredIssues.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer hover:shadow-md"
                    onClick={() => handleIssueClick(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{report.title}</h3>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          report.status === 'completed'
                            ? 'bg-green-500'
                            : report.status === 'in-progress'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{report.department}</span>
                      <div className="flex items-center gap-1">
                        <span>{report.votes} votes</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() +
                          report.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MapView;