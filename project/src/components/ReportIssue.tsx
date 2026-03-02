import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload, Send, AlertCircle, Brain, X, Video } from 'lucide-react';
import { aiModelService } from '../services/aiModel';
import AIStatus from './AIStatus';

const ReportIssue: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    images: [] as File[]
  });

  const [detectedIssues, setDetectedIssues] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{category: string, confidence: number, detectedIssues?: string[], description?: string} | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showOtherError, setShowOtherError] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    
    try {
      let finalCategory = formData.category;
      let finalDescription = formData.description;
      
      // Use AI to predict category if not manually selected
      if (!formData.category && (formData.title || formData.description || formData.images.length > 0)) {
        const prediction = await aiModelService.predictCategory(formData.title, formData.description, formData.images);
        setAiPrediction(prediction);
        finalCategory = prediction.category;
        finalDescription = prediction.description || formData.description;
        setDetectedIssues(prediction.detectedIssues || []);
        
        // No longer block 'Other' category since AI always assigns valid departments
      }
      
      // Allow 'Other' category if manually selected
      
      // Parse location for coordinates (if GPS was used)
      let coordinates = { latitude: 23.3441, longitude: 85.3096 }; // Default Ranchi coordinates
      if (formData.location.includes(',') && formData.location.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/)) {
        const [lat, lng] = formData.location.split(',').map(coord => parseFloat(coord.trim()));
        coordinates = { latitude: lat, longitude: lng };
      }
      
      // Convert images to base64
      const imageUrls = await Promise.all(
        formData.images.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );
      
      // Prepare report data for API with enhanced department routing
      const reportData = {
        title: formData.title,
        description: finalDescription,
        category: finalCategory,
        department: (aiPrediction as any)?.department || finalCategory,
        priority: (aiPrediction as any)?.priority || (aiPrediction?.confidence && aiPrediction.confidence > 0.8 ? 'high' : 'medium'),
        location: {
          address: formData.location,
          coordinates
        },
        images: imageUrls,
        aiAnalysis: aiPrediction ? {
          confidence: aiPrediction.confidence,
          detectedIssues: aiPrediction.detectedIssues || [],
          detectedObjects: [],
          department: (aiPrediction as any)?.department,
          priority: (aiPrediction as any)?.priority,
          routingConfidence: (aiPrediction as any)?.routing_confidence,
          matchedKeywords: (aiPrediction as any)?.matched_keywords
        } : undefined
      };
      
      // Submit to API
      const { apiService } = await import('../services/api');
      await apiService.createReport(reportData);
      
      setIsSubmitted(true);
      setIsAnalyzing(false);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({ title: '', description: '', category: '', location: '', images: [] });
        setAiPrediction(null);
        setDetectedIssues([]);
        setIsSubmitted(false);
        setShowOtherError(false);
      }, 2000);
      
    } catch (error) {
      console.error('Report submission failed:', error);
      alert('Failed to submit report. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    
    // Auto-analyze image when uploaded with Google ViT
    if (files.length > 0) {
      setIsAnalyzing(true);
      try {
        const prediction = await aiModelService.predictCategory('', '', files);
        setAiPrediction(prediction);
        
        // Auto-fill description if AI provided detailed analysis
        if (prediction.description && (prediction.description.includes('Smart') || prediction.description.includes('analysis'))) {
          setFormData(prev => ({ 
            ...prev, 
            description: prediction.description,
            category: prediction.category !== 'Other' ? prediction.category : prev.category
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            category: prediction.category !== 'Other' ? prediction.category : prev.category
          }));
        }
        
        setDetectedIssues(prediction.detectedIssues || []);
      } catch (error) {
        console.error('Google ViT image analysis failed:', error);
      }
      setIsAnalyzing(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, file]
            }));
            
            // Auto-analyze captured image
            analyzeImage(file);
          }
        }, 'image/jpeg', 0.8);
      }
    }
    stopCamera();
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const prediction = await aiModelService.predictFromImage(file);
      setAiPrediction(prediction);
      
      // Auto-fill description if AI provided detailed analysis
      if (prediction.description && (prediction.description.includes('Smart') || prediction.description.includes('analysis'))) {
        setFormData(prev => ({ 
          ...prev, 
          description: prediction.description,
          category: prediction.category !== 'Other' ? prediction.category : prev.category
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          category: prediction.category !== 'Other' ? prediction.category : prev.category
        }));
      }
      
      setDetectedIssues(prediction.detectedIssues || []);
    } catch (error) {
      console.error('Google ViT image analysis failed:', error);
    }
    setIsAnalyzing(false);
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Use coordinates directly (no API key needed)
      const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (GPS Location)`;
      setFormData(prev => ({
        ...prev,
        location: locationString
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get location. Please check location permissions and try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleQuickShot = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      // Create a temporary video element for quick capture
      const video = document.createElement('video');
      video.srcObject = mediaStream;
      video.autoplay = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        // Wait a moment for camera to focus, then capture
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], `quickshot-${Date.now()}.jpg`, { type: 'image/jpeg' });
                setFormData(prev => ({
                  ...prev,
                  images: [...prev.images, file]
                }));
                
                // Auto-analyze captured image
                analyzeImage(file);
              }
            }, 'image/jpeg', 0.8);
          }
          
          // Stop camera stream
          mediaStream.getTracks().forEach(track => track.stop());
        }, 1000);
      };
    } catch (error) {
      console.error('Error accessing camera for quick shot:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
            <p className="text-gray-600">Help improve your community by reporting municipal issues.</p>
          </div>
          <AIStatus />
        </div>

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
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {isGettingLocation ? 'Getting...' : 'GPS'}
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos/Videos
            </label>
            
            {/* Camera Modal */}
            {showCamera && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Take Photo</h3>
                    <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Capture
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Video className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Live Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickShot}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Quick Shot</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFileSelect}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Upload Files</span>
                  </button>
                </div>
                <p className="text-gray-600">Take photos with live camera or upload files</p>
                <p className="text-sm text-gray-500">Support for multiple files, up to 10MB each</p>
              </div>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Category Prediction */}
          {aiPrediction && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-purple-800 mb-1">Your Google ViT Model Analysis</h3>
                  <p className="text-sm text-purple-700 mb-2">
                    Detected category: <span className="font-semibold">{aiPrediction.category}</span>
                    <span className="ml-2 text-xs bg-purple-100 px-2 py-1 rounded">
                      {Math.round(aiPrediction.confidence * 100)}% confidence
                    </span>
                  </p>
                  {aiPrediction.detectedIssues && aiPrediction.detectedIssues.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-purple-700 font-medium mb-1">Detected Objects:</p>
                      <div className="flex flex-wrap gap-1">
                        {aiPrediction.detectedIssues.map((issue, index) => (
                          <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiPrediction.description && (
                    <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                      <strong>Combined AI Analysis:</strong> {aiPrediction.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="font-medium">Analyzing with Your Google ViT Model - advanced vision transformer identifying municipal issues...</span>
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
            {isSubmitted ? 'Report Submitted!' : isAnalyzing ? 'Analyzing...' : 'Submit Report'}
          </button>
          
          {showOtherError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <p className="text-red-700 text-sm">
                  Cannot submit report: Issue category could not be determined. Please provide clearer information or select a specific category.
                </p>
                <button
                  type="button"
                  onClick={() => setShowOtherError(false)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;