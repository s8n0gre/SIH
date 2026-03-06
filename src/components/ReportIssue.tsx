import React, { useState, useRef, DragEvent } from 'react';
import { Camera, MapPin, Upload, Send, Brain, X, ChevronRight, CheckCircle2, Mic, Image as ImageIcon } from 'lucide-react';
import { aiModelService } from '../services/aiModel';
import VoiceInput from './VoiceInput';
import MapComponent from './MapComponent';
import {
  MUNICIPALITY_HIERARCHY,
  CATEGORY_TO_DOMAIN,
  getSubcategoriesForCategory,
} from '../data/municipalityData';

// Constants
const TOP_CATEGORIES = [
  { id: 'Roads & Infrastructure', iconUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=300&h=200', label: 'Roads' },
  { id: 'Water Services', iconUrl: 'https://images.unsplash.com/photo-1541888002625-3b10b0e9ae12?auto=format&fit=crop&q=80&w=300&h=200', label: 'Water' },
  { id: 'Electricity Services', iconUrl: 'https://images.unsplash.com/photo-1510313531317-a16f86641b6c?auto=format&fit=crop&q=80&w=300&h=200', label: 'Electric' },
  { id: 'Waste Management', iconUrl: 'https://images.unsplash.com/photo-1627988358485-eb991b1ac555?auto=format&fit=crop&q=80&w=300&h=200', label: 'Waste' },
  { id: 'Parks & Recreation', iconUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=300&h=200', label: 'Parks' },
  { id: 'Public Safety', iconUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=300&h=200', label: 'Safety' },
];

const ReportIssue: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', domain: '', category: '', subCategory: '', urgency: 'medium', location: '', images: [] as File[], isAnonymous: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // States from original
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{ category: string, confidence: number, detectedIssues?: string[], description?: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number, longitude: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    } catch { /* ignore */ }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      let finalCategory = formData.category;
      let finalDescription = formData.description;

      if (!formData.category && (formData.title || formData.description || formData.images.length > 0)) {
        const prediction = await aiModelService.predictCategory(formData.title, formData.description, formData.images);
        setAiPrediction(prediction);
        finalCategory = prediction.category;
        finalDescription = prediction.description || formData.description;
      }

      let coordinates = currentCoords;
      if (!coordinates) {
        if (formData.location.includes(',')) {
          const match = formData.location.match(/-?\d+\.\d+/g);
          if (match && match.length >= 2) coordinates = { latitude: parseFloat(match[0]), longitude: parseFloat(match[1]) };
        }
        if (!coordinates) coordinates = await geocodeAddress(formData.location);
        if (!coordinates) coordinates = { latitude: 23.3441, longitude: 85.3096 };
      }

      const imageUrls = await Promise.all(
        formData.images.map(file => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }))
      );

      const reportData = {
        title: formData.title,
        description: finalDescription,
        domain: formData.domain || CATEGORY_TO_DOMAIN[finalCategory] || finalCategory,
        category: finalCategory,
        subCategory: formData.subCategory || undefined,
        departmentId: (aiPrediction as any)?.department || finalCategory,
        urgency: formData.urgency,
        priority: (aiPrediction as any)?.priority || (aiPrediction?.confidence && aiPrediction.confidence > 0.8 ? 'high' : 'medium'),
        isAnonymous: formData.isAnonymous,
        locationAddress: formData.location,
        latitude: coordinates?.latitude ?? 23.3441,
        longitude: coordinates?.longitude ?? 85.3096,
        images: imageUrls,
        aiDetectedCategory: aiPrediction ? finalCategory : undefined,
        aiSeverityPrediction: aiPrediction ? ((aiPrediction as any)?.priority || 'medium') : undefined,
        aiConfidenceScore: aiPrediction ? aiPrediction.confidence : undefined,
        aiRecommendation: aiPrediction?.description || undefined,
        aiModelVersion: 'MiniCPM-V-2.6'
      };

      const { apiService } = await import('../services/api');
      await apiService.createReport(reportData);

      setIsSubmitted(true);
      setIsAnalyzing(false);
      setTimeout(() => {
        setFormData({ title: '', description: '', domain: '', category: '', subCategory: '', urgency: 'medium', location: '', images: [], isAnonymous: false });
        setAiPrediction(null); setIsSubmitted(false); setCurrentStep(1);
        if (window.location.hash !== '#/feed') window.dispatchEvent(new CustomEvent('reportStatusUpdated'));
      }, 2500);

    } catch (error) {
      console.error(error); alert('Failed to submit report. Please try again.'); setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const audioFiles = files.filter(f => f.type.startsWith('audio/'));
    const otherFiles = files.filter(f => !f.type.startsWith('audio/'));
    if (audioFiles.length > 0) audioFiles.forEach(processAudioFile);
    if (otherFiles.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...otherFiles] }));
      analyzeImage(otherFiles[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  };

  const processAudioFile = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const formDataObj = new FormData(); formDataObj.append('audio', file);
      const response = await fetch('/speech/transcribe', { method: 'POST', body: formDataObj });
      const result = await response.json();
      if (result.transcript) {
        setFormData(prev => ({ ...prev, description: prev.description + (prev.description ? '\n' : '') + (result.translation ? `${result.transcript} (English: ${result.translation})` : result.transcript) }));
      }
    } catch { /* ignore */ } finally { setIsAnalyzing(false); }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      setStream(mediaStream); setShowCamera(true);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch { alert('Unable to access camera.'); }
  };

  const stopCamera = () => { if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); } setShowCamera(false); };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current; const video = videoRef.current; const context = canvas.getContext('2d');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFormData(prev => ({ ...prev, images: [...prev.images, file] }));
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
      if (prediction.description) setFormData(prev => ({ ...prev, description: prediction.description ?? prev.description, category: prediction.category !== 'Other' ? prediction.category : prev.category }));
      else setFormData(prev => ({ ...prev, category: prediction.category !== 'Other' ? prediction.category : prev.category }));
    } catch { /* ignore */ }
    setIsAnalyzing(false);
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
      });
      const { latitude, longitude } = position.coords;
      setCurrentCoords({ latitude, longitude });
      setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (GPS)` }));
    } catch { alert('Unable to get location.'); } finally { setIsGettingLocation(false); }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative max-w-2xl mx-auto w-full">
      {/* ── Progressive Disclosure Steps with Artistic Styling ── */}
      <div className="flex items-center gap-2 mb-8 px-2 relative z-10">
        {[1, 2, 3].map(step => (
          <React.Fragment key={step}>
            <div
              className={`flex flex-col items-center gap-2 flex-1 cursor-pointer transition-all duration-300 ${step === currentStep ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => (step < currentStep || formData.title) && setCurrentStep(step)}
            >
              <div
                className={`h-2 text-transparent w-full rounded-full transition-all duration-300 border ${step === currentStep ? 'shadow-md border-transparent' : 'border-[var(--border-strong)] bg-transparent'}`}
                style={{ background: step <= currentStep ? 'var(--accent)' : 'var(--bg-elevated)' }}
              />
              <span className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-300" style={{ color: step <= currentStep ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {step === 1 ? 'Details' : step === 2 ? 'Media & AI' : 'Location'}
              </span>
            </div>
            {step < 3 && <div className="w-1" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-8 relative z-10">

        {/* ── STEP 1: details ── */}
        <div className="transition-all duration-500 animate-slide-right" style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Issue Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className="input-field text-xl font-bold py-4 shadow-sm" placeholder="E.g., Deep pothole on Station Road" autoFocus />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Description (Or Use Voice)</label>
              <div className="relative group">
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="input-field min-h-[140px] resize-none pb-12 shadow-sm text-base leading-relaxed" placeholder="Provide details about the issue to help our teams..." />
                <div className="absolute bottom-3 left-3 right-3 flex flex-col items-center gap-2">
                  <div className="badge badge-amber opacity-80 group-hover:opacity-100 transition-opacity"><Mic className="w-3.5 h-3.5 mr-1" /> Multi-lingual Voice</div>
                  <VoiceInput onTranscription={(text, translation) => setFormData(p => ({ ...p, description: p.description + (p.description ? '\n' : '') + (translation ? `${text} (${translation})` : text) }))} />
                </div>
              </div>
            </div>

            <div className="card p-5 border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Category</label>
                <div className="badge badge-blue animate-pulse"><Brain className="w-3.5 h-3.5 mr-1" /> AI Auto-detect</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {TOP_CATEGORIES.map(cat => (
                  <button type="button" key={cat.id}
                    onClick={() => setFormData(p => ({ ...p, category: p.category === cat.id ? '' : cat.id, domain: CATEGORY_TO_DOMAIN[cat.id] || '' }))}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 hover:scale-[1.03] overflow-hidden relative group"
                    style={{
                      background: formData.category === cat.id ? 'var(--accent)' : 'var(--bg-elevated)',
                      borderColor: formData.category === cat.id ? 'var(--accent)' : 'var(--border)',
                      color: formData.category === cat.id ? '#ffffff' : 'var(--text-muted)',
                      boxShadow: formData.category === cat.id ? 'var(--shadow-md)' : 'none'
                    }}>
                    <div className="w-full aspect-video rounded-lg overflow-hidden mb-2 relative">
                      <img src={cat.iconUrl} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" style={{ filter: formData.category === cat.id ? 'none' : 'grayscale(60%) opacity(80%)' }} />
                      {formData.category === cat.id && <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{ background: 'var(--accent)' }} />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Advanced Category Select */}
              <div className="space-y-3">
                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value, domain: CATEGORY_TO_DOMAIN[e.target.value] || '', subCategory: '' }))}
                  className="input-field text-sm w-full font-medium shadow-sm">
                  <option value="">Or select from all categories...</option>
                  {MUNICIPALITY_HIERARCHY.map(entry => (
                    <optgroup key={entry.domain} label={entry.domain}>
                      <option value={entry.category}>{entry.category}</option>
                    </optgroup>
                  ))}
                  <option value="Other">Other</option>
                </select>

                {/* Subcategory */}
                {getSubcategoriesForCategory(formData.category).length > 0 ? (
                  <select value={formData.subCategory} onChange={e => setFormData(p => ({ ...p, subCategory: e.target.value }))} className="input-field text-sm w-full font-medium shadow-sm">
                    <option value="">Select a sub-category (optional)...</option>
                    {getSubcategoriesForCategory(formData.category).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input type="text" value={formData.subCategory} onChange={e => setFormData(p => ({ ...p, subCategory: e.target.value }))}
                    className="input-field text-sm w-full font-medium shadow-sm" placeholder="Sub-category (e.g., Pothole, Streetlight)..." />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 2: Media & AI ── */}
        <div className="transition-all duration-500 animate-slide-right" style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <div className="space-y-6">

            {/* Premium Artistic Drag & Drop Zone */}
            <div className={`heritage-frame heritage-pattern relative p-1 transition-all duration-300 transform ${isDragging ? 'scale-[1.02]' : 'scale-100'} cursor-pointer`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isDragging && fileInputRef.current?.click()}
            >
              <div
                className="relative bg-white/90 dark:bg-[#171413]/90 backdrop-blur-md rounded-xl p-10 border shadow-inner text-center flex flex-col items-center justify-center min-h-[250px]"
                style={{ borderColor: isDragging ? 'var(--accent)' : 'var(--border)' }}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*" onChange={handleImageUpload} className="hidden" />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />

                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border shadow-sm transition-transform duration-300 group-hover:scale-110" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                  <ImageIcon className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>Upload Visual Evidence</h3>
                <p className="text-sm font-medium mb-6 max-w-[200px]" style={{ color: 'var(--text-muted)' }}>Drag and drop images or click to browse</p>

                <div className="flex gap-3 w-full max-w-xs" onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={startCamera} className="btn-secondary flex-1 justify-center py-2.5 font-bold shadow-sm whitespace-nowrap"><Camera className="w-4 h-4 flex-shrink-0" /> Camera</button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1 justify-center py-2.5 font-bold shadow-sm whitespace-nowrap"><Upload className="w-4 h-4 flex-shrink-0" /> Browse</button>
                </div>
              </div>
            </div>

            {/* Uploaded previews */}
            {formData.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {formData.images.map((f, i) => {
                  const imageUrl = React.useMemo(() => URL.createObjectURL(f), [f]);
                  return (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border shadow-sm" style={{ borderColor: 'var(--border)' }}>
                      <img src={imageUrl} alt="" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'; }} />
                      <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center text-xs shadow-md border border-white/20 hover:bg-black/80 transition-colors">×</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Analysis Panel */}
            <div className="card p-5 border shadow-sm relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {/* Subtle mesh background for AI card */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[var(--accent-blue-subtle)] rounded-full blur-2xl opacity-50" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>MiniCPM Vision AI</h3>
                </div>
                {isAnalyzing ? (
                  <div className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <div className="w-5 h-5 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
                    Analyzing visual context to auto-route your report...
                  </div>
                ) : aiPrediction ? (
                  <div className="animate-fade-in bg-white/5 dark:bg-black/5 p-3 rounded-xl border border-dashed border-[var(--border)]">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="badge badge-blue text-[11px] px-2.5 py-1">{aiPrediction.category}</span>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--accent-blue)' }}>{Math.round(aiPrediction.confidence * 100)}% Match Confidence</span>
                    </div>
                    {aiPrediction.description && <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>{aiPrediction.description}</p>}
                  </div>
                ) : (
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-faint)' }}>Secure, edge-assisted AI auto-analysis will run when media is uploaded to ensure accurate departmental routing.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── STEP 3: Location & Submit ── */}
        <div className="transition-all duration-500 animate-slide-right flex-1 flex flex-col" style={{ display: currentStep === 3 ? 'flex' : 'none' }}>
          <div className="space-y-6 flex-1">
            <div className="card p-5 border shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <label className="block text-[11px] font-bold mb-3 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Incident Location</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--accent-red)' }} />
                  <input type="text" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    className="input-field pl-10 text-sm font-medium shadow-sm" placeholder="Search address or map pin..." />
                </div>
                <button type="button" onClick={getCurrentLocation} disabled={isGettingLocation} className="btn-secondary px-4 shadow-sm" title="Use GPS">
                  {isGettingLocation ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <MapPin className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => setShowMap(true)} className="btn-secondary px-4 shadow-sm font-bold" title="Select on map">Map</button>
              </div>
            </div>

            <div className="card p-5 border shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <label className="block text-[11px] font-bold mb-3 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Priority & Privacy</label>

              <div className="space-y-4">
                <select value={formData.urgency} onChange={e => setFormData(p => ({ ...p, urgency: e.target.value }))} className="input-field text-sm font-bold shadow-sm">
                  <option value="low">Low Priority - Routine maintenance</option>
                  <option value="medium">Medium Priority - Needs attention soon</option>
                  <option value="high">High Priority - Safety hazard</option>
                  <option value="critical">Critical - Immediate danger</option>
                </select>

                <label className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-colors shadow-sm bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--text-faint)]">
                  <input type="checkbox" checked={formData.isAnonymous} onChange={e => setFormData(p => ({ ...p, isAnonymous: e.target.checked }))}
                    className="w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]" />
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Submit Anonymously</span>
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isAnalyzing || !formData.title || !formData.location}
            className="btn-primary w-full justify-center mt-8 py-4 text-base font-extrabold shadow-lg">
            {isSubmitted ? (
              <span className="flex items-center gap-2 text-white"><CheckCircle2 className="w-5 h-5" /> Transmission Complete</span>
            ) : isAnalyzing ? (
              <span className="flex items-center gap-2 text-white"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing Report Hub...</span>
            ) : (
              <span className="flex items-center gap-2 text-white"><Send className="w-5 h-5" /> Submit Official Report</span>
            )}
          </button>
        </div>

      </form>

      {/* ── Modals / Overlays ── */}
      {/* Footer Navigation for steps 1 & 2 */}
      {currentStep < 3 && (
        <div className="pt-6 mt-6 pb-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={() => formData.title && setCurrentStep(p => p + 1)}
            disabled={!formData.title}
            className="btn-primary w-full justify-center py-3.5 text-base font-bold shadow-md">
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Camera Fullscreen Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
          <button onClick={stopCamera} className="absolute top-6 left-6 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"><X className="w-6 h-6" /></button>
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <button onClick={capturePhoto} className="absolute bottom-12 w-20 h-20 rounded-full border-[6px] border-white bg-white/30 backdrop-blur-md active:scale-90 transition-transform shadow-2xl" />
        </div>
      )}

      {/* Map Overlay */}
      {showMap && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[var(--bg-panel)] rounded-2xl overflow-hidden shadow-2xl animate-scale-in border border-white/10">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Pinpoint Issue Location</h3>
              <button onClick={() => setShowMap(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-strong)] transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <MapComponent height="500px" showReports={false} onLocationSelect={(lat, lng, address) => { setCurrentCoords({ latitude: lat, longitude: lng }); setFormData(p => ({ ...p, location: address })); setShowMap(false); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;