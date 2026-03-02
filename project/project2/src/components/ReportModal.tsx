import React, { useState } from 'react';
import { X, Camera, MapPin, Send } from 'lucide-react';
import { useApp } from '../store/AppContext';

const ReportModal: React.FC = () => {
  const { showReportModal, setShowReportModal, addReport } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    coordinates: { lat: 0, lng: 0 },
    images: [] as File[]
  });

  const categories = [
    'Roads & Infrastructure',
    'Water Services',
    'Electricity',
    'Waste Management',
    'Parks & Recreation',
    'Public Safety',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure coordinates are set
    if (!formData.coordinates.lat || !formData.coordinates.lng) {
      handleGetLocation();
      return;
    }
    
    const imageUrls = await Promise.all(
      formData.images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    const getDepartment = (category: string) => {
      switch (category) {
        case 'Roads & Infrastructure': return 'Roads Department';
        case 'Water Services': return 'Water Department';
        case 'Electricity': return 'Electricity Department';
        case 'Waste Management': return 'Waste Department';
        case 'Parks & Recreation': return 'Parks Department';
        case 'Public Safety': return 'Safety Department';
        default: return 'General Services';
      }
    };

    addReport({
      title: formData.title,
      description: formData.description,
      category: formData.category || 'Other',
      location: formData.location,
      coordinates: formData.coordinates,
      images: imageUrls,
      department: getDepartment(formData.category)
    });

    setFormData({ title: '', description: '', category: '', location: '', coordinates: { lat: 0, lng: 0 }, images: [] });
    setShowReportModal(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            coordinates: { lat: latitude, lng: longitude }
          }));
        },
        (error) => {
          // Use random coordinates near LA for testing
          const lat = 34.0522 + (Math.random() - 0.5) * 0.01;
          const lng = -118.2437 + (Math.random() - 0.5) * 0.01;
          setFormData(prev => ({
            ...prev,
            location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            coordinates: { lat, lng }
          }));
        }
      );
    } else {
      // Use random coordinates near LA for testing
      const lat = 34.0522 + (Math.random() - 0.5) * 0.01;
      const lng = -118.2437 + (Math.random() - 0.5) * 0.01;
      setFormData(prev => ({
        ...prev,
        location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lat, lng }
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...filesToAdd]
    }));
  };

  if (!showReportModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[9999]">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Report Issue</h2>
          <button
            onClick={() => setShowReportModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed description"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Address or landmark"
                required
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={formData.images.length >= 5}
              />
              <label htmlFor="image-upload" className={`cursor-pointer ${formData.images.length >= 5 ? 'opacity-50' : ''}`}>
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {formData.images.length >= 5 ? 'Maximum 5 photos reached' : 'Tap to add photos'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{formData.images.length}/5 photos</p>
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.images.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;