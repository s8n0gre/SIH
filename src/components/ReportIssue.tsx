import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload, Send, AlertCircle, Brain, X, Video } from 'lucide-react';
import { aiModelService } from '../services/aiModel';
import VoiceInput from './VoiceInput';
import MapComponent from './MapComponent';

const ReportIssue: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    urgency: 'medium',
    location: '',
    images: [] as File[],
    isAnonymous: false
  });

  const [_detectedIssues, setDetectedIssues] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{ category: string, confidence: number, detectedIssues?: string[], description?: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showOtherError, setShowOtherError] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
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

    // Show geocoding message if needed
    if (formData.location && !currentCoords && !formData.location.match(/-?\d+\.\d+/g)) {
      console.log('Geocoding address:', formData.location);
    }

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
      }

      // Use stored coordinates or geocode the address
      let coordinates = currentCoords;

      if (!coordinates) {
        // Try to parse if location contains coordinates
        if (formData.location.includes(',')) {
          const match = formData.location.match(/-?\d+\.\d+/g);
          if (match && match.length >= 2) {
            coordinates = {
              latitude: parseFloat(match[0]),
              longitude: parseFloat(match[1])
            };
          }
        }

        // If still no coordinates, geocode the address
        if (!coordinates) {
          coordinates = await geocodeAddress(formData.location);
        }

        // Fallback to default Ranchi coordinates
        if (!coordinates) {
          coordinates = { latitude: 23.3441, longitude: 85.3096 };
        }
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

      // Prepare report data for API — using new flat ServiceNow-aligned fields
      const reportData = {
        title: formData.title,
        description: finalDescription,
        category: finalCategory,
        subCategory: formData.subCategory || undefined,
        departmentId: (aiPrediction as any)?.department || finalCategory,
        urgency: formData.urgency,
        priority: (aiPrediction as any)?.priority || (aiPrediction?.confidence && aiPrediction.confidence > 0.8 ? 'high' : 'medium'),
        isAnonymous: formData.isAnonymous,
        // Flat location fields
        locationAddress: formData.location,
        latitude: coordinates?.latitude ?? 23.3441,
        longitude: coordinates?.longitude ?? 85.3096,
        images: imageUrls,
        // Flat AI fields
        aiDetectedCategory: aiPrediction ? finalCategory : undefined,
        aiSeverityPrediction: aiPrediction ? ((aiPrediction as any)?.priority || 'medium') : undefined,
        aiConfidenceScore: aiPrediction ? aiPrediction.confidence : undefined,
        aiRecommendation: aiPrediction?.description || undefined,
        aiModelVersion: 'MiniCPM-V-2.6'
      };

      // Submit to API
      const { apiService } = await import('../services/api');
      const result = await apiService.createReport(reportData);
      console.log('Report submitted successfully:', result);

      setIsSubmitted(true);
      setIsAnalyzing(false);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({ title: '', description: '', category: '', subCategory: '', urgency: 'medium', location: '', images: [], isAnonymous: false });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const audioFiles = files.filter(f => f.type.startsWith('audio/'));
      const otherFiles = files.filter(f => !f.type.startsWith('audio/'));

      if (audioFiles.length > 0) {
        audioFiles.forEach(processAudioFile);
      }

      if (otherFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...otherFiles]
        }));
        analyzeImage(otherFiles[0]);
      }
    }
  };

  const processAudioFile = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('audio', file);

      const response = await fetch('/speech/transcribe', {
        method: 'POST',
        body: formDataObj
      });

      const result = await response.json();
      if (result.transcript) {
        const text = result.transcript;
        const translation = result.translation;
        setFormData(prev => ({
          ...prev,
          description: prev.description +
            (prev.description ? '\n' : '') +
            (translation ? `${text} (English: ${translation})` : text)
        }));
      }
    } catch (error) {
      console.error('Error processing audio file:', error);
    } finally {
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

      // Auto-fill description with AI analysis output
      if (prediction.description) {
        setFormData(prev => ({
          ...prev,
          description: prediction.description ?? prev.description,
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
      console.error('MiniCPM image analysis failed:', error);
    }
    setIsAnalyzing(false);
  };

  const [currentCoords, setCurrentCoords] = useState<{ latitude: number, longitude: number } | null>(null);

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
    return null;
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      setCurrentCoords({ latitude, longitude });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 form-mobile">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Report an Issue</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Help improve your community by reporting municipal issues.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category (Optional - AI will detect)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Let AI detect automatically</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sub-Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sub-Category <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g. Pothole, Water Leakage, Streetlight"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <div className="space-y-3">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="Detailed description of the issue"
                  required
                />
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-xs mb-2 font-medium">💡 Voice Input Tip:</p>
                  <p className="text-amber-700 text-xs mb-3">For best results, please turn off other audio sources (YouTube, Spotify, music, etc.) before using voice input.</p>
                  <div className="flex justify-center">
                    <VoiceInput
                      onTranscription={(text: string, translation?: string) => setFormData(prev => ({
                        ...prev,
                        description: prev.description +
                          (prev.description ? '\n' : '') +
                          (translation ? `${text} (English: ${translation})` : text)
                      }))}
                      placeholder="Hold to speak in Hindi"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Street address or landmark"
                  required
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  {isGettingLocation ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {isGettingLocation ? 'Getting...' : 'GPS'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4" />
                  Map
                </button>
              </div>
              {showMap && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Select Location on Map</h3>
                      <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1 min-h-0">
                      <MapComponent
                        height="400px"
                        showReports={false}
                        onLocationSelect={(lat, lng, address) => {
                          setCurrentCoords({ latitude: lat, longitude: lng });
                          setFormData(prev => ({ ...prev, location: address }));
                        }}
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Confirm Location
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photos/Videos
              </label>

              {/* Camera Modal */}
              {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 max-w-md w-full">
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

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
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

                <div className="flex flex-col items-center space-y-3">
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Video className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Live Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickShot}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Quick Shot</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFileSelect}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Upload Files</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Take photos or upload files</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Up to 10MB each</p>
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <span className="truncate max-w-32">{file.name}</span>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {isAnalyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="font-medium text-sm">
                    {formData.location && !currentCoords ? 'Converting address to coordinates...' : 'Analyzing with MiniCPM Model...'}
                  </span>
                </div>
              </div>
            )}

            {aiPrediction && !isAnalyzing && (
              <div className={`border rounded-lg p-3 ${aiPrediction.category === 'Error' ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
                <div className="flex items-start gap-2">
                  {aiPrediction.category === 'Error' ? (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-medium mb-1 text-sm ${aiPrediction.category === 'Error' ? 'text-red-800' : 'text-purple-800'}`}>
                      {aiPrediction.category === 'Error' ? 'MiniCPM Analysis Failed' : 'MiniCPM Model Analysis'}
                    </h3>
                    {aiPrediction.category !== 'Error' && (
                      <p className="text-xs text-purple-700 mb-2">
                        Detected: <span className="font-semibold">{aiPrediction.category}</span>
                        <span className="ml-2 bg-purple-100 px-2 py-1 rounded">
                          {Math.round(aiPrediction.confidence * 100)}% confidence
                        </span>
                      </p>
                    )}
                    {aiPrediction.description && (
                      <p className={`text-xs p-2 rounded break-words ${aiPrediction.category === 'Error' ? 'text-red-600 bg-red-50' : 'text-purple-600 bg-purple-50'}`}>
                        <strong>{aiPrediction.category === 'Error' ? 'Error:' : 'Analysis:'}</strong> {aiPrediction.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                Submit anonymously (your identity will not be shown publicly)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              {isSubmitted ? 'Report Submitted!' : isAnalyzing ? 'Analyzing...' : 'Submit Report'}
            </button>

            {showOtherError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <p className="text-red-700 text-xs">
                    Cannot submit report: Issue category could not be determined. Please provide clearer information or select a specific category.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowOtherError(false)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;