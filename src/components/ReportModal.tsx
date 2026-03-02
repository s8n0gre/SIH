import React, { useState, useRef } from 'react';
import { X, Camera, MapPin, Send, Sparkles, Upload } from 'lucide-react';
import { aiModelService } from '../services/aiModel';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: any) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Let AI Decide',
    location: '',
    coordinates: { lat: 0, lng: 0 },
    images: [] as File[]
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Let AI Decide',
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
    
    if (!formData.coordinates.lat || !formData.coordinates.lng) {
      handleGetLocation();
      return;
    }
    
    try {
      let finalCategory = formData.category;
      let finalDescription = formData.description;
      
      // Use AI to predict category if "Let AI Decide" is selected
      if (formData.category === 'Let AI Decide') {
        const prediction = await aiModelService.predictCategory(formData.title, formData.description, formData.images);
        finalCategory = prediction.category;
        finalDescription = prediction.description || formData.description;
      }
      
      // Prepare report data for API
      const reportData = {
        title: formData.title,
        description: finalDescription,
        category: finalCategory,
        department: finalCategory,
        priority: 'medium',
        location: {
          address: formData.location,
          coordinates: {
            latitude: formData.coordinates.lat,
            longitude: formData.coordinates.lng
          }
        }
      };
      
      // Submit to API
      const { apiService } = await import('../services/api');
      await apiService.createReport(reportData);
      
      // Also call the parent onSubmit for UI updates
      onSubmit({
        title: formData.title,
        description: finalDescription,
        category: finalCategory,
        location: formData.location,
        coordinates: formData.coordinates,
        images: [],
        department: finalCategory
      });
      
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Report submission failed:', error);
      alert('Failed to submit report. Please try again.');
    }
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
          // Use random coordinates near Ranchi for testing
          const lat = 23.3441 + (Math.random() - 0.5) * 0.01;
          const lng = 85.3096 + (Math.random() - 0.5) * 0.01;
          setFormData(prev => ({
            ...prev,
            location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            coordinates: { lat, lng }
          }));
        }
      );
    } else {
      // Use random coordinates near Ranchi for testing
      const lat = 23.3441 + (Math.random() - 0.5) * 0.01;
      const lng = 85.3096 + (Math.random() - 0.5) * 0.01;
      setFormData(prev => ({
        ...prev,
        location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lat, lng }
      }));
    }
  };

  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = 5 - formData.images.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...filesToAdd]
    }));

    // Auto-analyze with AI if category is "Let AI Decide"
    if (formData.category === 'Let AI Decide' && filesToAdd.length > 0) {
      await handleAIAnalysis(filesToAdd[0]);
    }
  };

  const handleAIAnalysis = async (imageFile?: File) => {
    if (!formData.title && !formData.description && !imageFile) return;
    
    setIsAnalyzing(true);
    try {
      const prediction = await aiModelService.predictCategory(
        formData.title,
        formData.description,
        imageFile ? [imageFile] : formData.images
      );
      
      setFormData(prev => ({
        ...prev,
        category: prediction.category,
        description: prediction.description || prev.description
      }));
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      category: 'Let AI Decide', 
      location: '', 
      coordinates: { lat: 0, lng: 0 }, 
      images: [] 
    });
    setIsAnalyzing(false);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[9999]">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Report Issue</h2>
          <button
            onClick={handleClose}
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
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleAIAnalysis()}
                disabled={isAnalyzing || (!formData.title && !formData.description && formData.images.length === 0)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            </div>
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
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              } ${formData.images.length >= 5 ? 'opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                disabled={formData.images.length >= 5}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                disabled={formData.images.length >= 5}
              />
              
              <div className="flex flex-col items-center space-y-3">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    disabled={formData.images.length >= 5}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600">Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFileSelect}
                    disabled={formData.images.length >= 5}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600">Upload</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.images.length >= 5 ? 'Maximum 5 photos reached' : 'Take photo, upload, or drag & drop'}
                </p>
                <p className="text-xs text-gray-500">{formData.images.length}/5 photos</p>
              </div>
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