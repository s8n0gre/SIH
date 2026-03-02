import React, { useState } from 'react';
import { Camera, MapPin, Upload, Send, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

const ReportIssue: React.FC = () => {
  const { addReport } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    coordinates: { lat: 0, lng: 0 },
    images: [] as File[]
  });

  const [detectedIssues, setDetectedIssues] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    setIsAnalyzing(true);
    
    // Convert images to base64 URLs
    const imageUrls = await Promise.all(
      formData.images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    // Determine department based on category
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

    // Add report to global state
    addReport({
      title: formData.title,
      description: formData.description,
      category: formData.category || 'Other',
      location: formData.location,
      coordinates: formData.coordinates,
      images: imageUrls,
      department: getDepartment(formData.category)
    });

    setSubmitted(true);
    setIsAnalyzing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
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
          alert('Unable to get location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <Send className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Report Submitted Successfully!</h1>
          <p className="text-green-700 mb-6">
            Your report has been added to the community feed and mapped for tracking.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ title: '', description: '', category: '', location: '', coordinates: { lat: 0, lng: 0 }, images: [] });
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
        <p className="text-gray-600 mb-8">Help improve your community by reporting municipal issues.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional - AI will detect)
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Let AI detect automatically</option>
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
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed description of the issue, including any relevant context"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street address or landmark"
                required
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                GPS
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos/Videos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleImageUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload photos or videos</p>
                <p className="text-sm text-gray-500">Support for multiple files, up to 10MB each</p>
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.images.map((file, index) => (
                  <div key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Analysis Results */}
          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="font-medium">Analyzing content and detecting issues...</span>
              </div>
            </div>
          )}

          {detectedIssues.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800 mb-2">Multiple Issues Detected</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Our AI detected multiple issues in your report. Each will be routed to the appropriate department:
                  </p>
                  <div className="space-y-2">
                    {detectedIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-green-800">{issue}</span>
                        <span className="text-green-600">→ {
                          issue === 'Pothole' ? 'Roads Department' :
                          issue === 'Broken Streetlight' ? 'Electricity Department' :
                          'Waste Management Department'
                        }</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;