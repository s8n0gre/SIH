import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Brain, Camera, Check, CheckCircle2, Edit2, Route, Droplets, Zap, Trash2, TreePine, ShieldAlert, Image as ImageIcon, X } from 'lucide-react';
import MapComponent from './MapComponent';
import { CATEGORY_TO_DOMAIN } from '../data/municipalityData';
import { useAI } from '../contexts/AIContext';

const TOP_CATEGORIES = [
  { id: 'Roads & Infrastructure', Icon: Route, label: 'Roads', color: 'var(--accent-blue)' },
  { id: 'Water Services', Icon: Droplets, label: 'Water', color: 'var(--accent)' },
  { id: 'Electricity Services', Icon: Zap, label: 'Electric', color: '#eab308' },
  { id: 'Waste Management', Icon: Trash2, label: 'Waste', color: '#84cc16' },
  { id: 'Parks & Recreation', Icon: TreePine, label: 'Parks', color: '#10b981' },
  { id: 'Public Safety', Icon: ShieldAlert, label: 'Safety', color: 'var(--accent-red)' },
];

const ReportIssueV2: React.FC = () => {
  const { tasks, draft, startTask, removeTask, updateDraft, resetDraft } = useAI();
  
  // Local UI state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMap, setShowMap] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync editedDescription with AI result or draft
  const currentTask = draft ? tasks[draft.taskId] : null;

  useEffect(() => {
    if (currentTask?.status === 'complete' && !draft?.isReviewed && !editedDescription) {
      setEditedDescription(currentTask.result?.description || '');
    }
  }, [currentTask?.status, draft?.isReviewed, editedDescription, currentTask?.result?.description]);

  // Handle image selection
  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Start background task
    startTask(file);
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
      updateDraft({ 
        location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (GPS)`,
        coordinates: { latitude, longitude }
      });
    } catch {
      alert('Unable to get location.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || !currentTask) return;
    
    if (!draft.location) {
      alert('Please provide a location');
      return;
    }

    try {
      const reportData = {
        title: draft.title,
        description: editedDescription || currentTask.result?.description,
        domain: CATEGORY_TO_DOMAIN[currentTask.result?.category || ''] || 'General',
        category: currentTask.result?.category || 'Other',
        urgency: draft.urgency,
        isAnonymous: draft.isAnonymous,
        locationAddress: draft.location,
        latitude: draft.coordinates?.latitude || 23.3441,
        longitude: draft.coordinates?.longitude || 85.3096,
        images: [currentTask.imageFile], // Send the actual File object
        aiDetectedCategory: currentTask.result?.category,
        aiConfidenceScore: currentTask.result?.confidence,
        aiRecommendation: currentTask.result?.description,
        aiModelVersion: 'MiniCPM-V-2.6'
      };

      const { apiService } = await import('../services/api');
      await apiService.createReport(reportData, (sent, total) => {
        setUploadProgress(Math.round((sent / total) * 100));
      });

      setIsSubmitted(true);
      setTimeout(() => {
        resetDraft();
        removeTask(draft.taskId);
        setIsSubmitted(false);
        window.dispatchEvent(new CustomEvent('reportStatusUpdated'));
      }, 2500);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit report.');
    }
  };

  // Global Loading State (for submission)
  const isSubmitting = uploadProgress > 0 && !isSubmitted;

  if (isSubmitting) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 min-h-[400px]">
        <div className="w-full max-w-xs text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/10" />
            <svg className="absolute inset-0 w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * uploadProgress) / 100}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-[var(--accent)]">{uploadProgress}%</span>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Uploading Report</h3>
          <p className="text-xs text-gray-500">Sending images to server...</p>
        </div>
      </div>
    );
  }

  // STAGE 4: Submitted
  if (isSubmitted) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 min-h-[400px]">
        <div className="text-center animate-bounce-in">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Report Submitted!
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Thank you for helping improve the community.
          </p>
        </div>
      </div>
    );
  }

  // STAGE 1: Image Upload (Lead-in)
  if (!draft) {
    return (
      <div className="flex flex-col h-full animate-fade-in max-w-2xl mx-auto w-full p-4 sm:p-0">
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
            Snap an Issue
          </h2>
          <p className="text-sm mb-8 text-center px-4" style={{ color: 'var(--text-muted)' }}>
            Upload a photo and our AI will automatically identify the problem and route it to the right department.
          </p>

          <div
            className={`heritage-frame heritage-pattern relative p-1 transition-all duration-300 transform ${isDragging ? 'scale-[1.02]' : 'scale-100'} cursor-pointer w-full max-w-sm`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageSelect(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="relative bg-white/90 dark:bg-[#171413]/90 backdrop-blur-md rounded-xl p-10 border shadow-inner text-center flex flex-col items-center justify-center h-64">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files)} className="hidden" />
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border shadow-sm" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                <Camera className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Take or Upload Photo</h3>
              <p className="text-xs text-gray-500">Tap to snap a picture or pick from gallery</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {TOP_CATEGORIES.map(cat => (
              <span key={cat.id} className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-panel)] border border-[var(--border)]" style={{ color: 'var(--text-muted)' }}>
                #{cat.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STAGE 2: Filling Details while AI Processes
  if (!draft.isReviewed) {
    return (
      <div className="flex flex-col h-full animate-fade-in max-w-2xl mx-auto w-full pb-20">
        {/* Persistent AI Status Header */}
        <div className="sticky top-0 z-20 pb-4 pt-2 px-4 shadow-sm backdrop-blur-md border-b" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0 shadow-sm">
                <img src={currentTask?.imagePreview} alt="Target" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                   <h3 className="text-xs font-bold uppercase tracking-widest truncate" style={{ color: currentTask?.status === 'complete' ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                     {currentTask?.status === 'failed' ? '❌ Analysis Failed' : (currentTask?.status === 'complete' ? '✨ Analysis Ready' : '🧠 AI is identifying...')}
                   </h3>
                   <span className="text-[10px] font-mono">{currentTask?.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" 
                    style={{ width: `${currentTask?.progress || 0}%` }} 
                   />
                </div>
              </div>
           </div>
           {currentTask?.status === 'complete' && (
             <button 
              onClick={() => updateDraft({ isReviewed: true })}
              className="mt-3 w-full btn-primary py-2 text-xs font-bold animate-pulse"
             >
               Review AI Suggestions
             </button>
           )}
        </div>

        <div className="p-4 space-y-6">
          <p className="text-sm font-medium italic" style={{ color: 'var(--text-secondary)' }}>
            Tell us more while AI scans your photo...
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Issue Label</label>
              <input 
                type="text" 
                value={draft.title} 
                onChange={(e) => updateDraft({ title: e.target.value })}
                className="input-field py-3" 
                placeholder="What exactly is the issue?" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Location</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input 
                    type="text" 
                    value={draft.location} 
                    onChange={(e) => updateDraft({ location: e.target.value })}
                    className="input-field pl-9 py-3" 
                    placeholder="Where is this?" 
                  />
                </div>
                <button type="button" onClick={getCurrentLocation} className="btn-secondary px-4 shadow-sm">
                  {isGettingLocation ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <MapPin className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => setShowMap(true)} className="btn-secondary px-4 shadow-sm font-bold">Map</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Urgency</label>
                  <select 
                    value={draft.urgency} 
                    onChange={(e) => updateDraft({ urgency: e.target.value })}
                    className="input-field py-2.5 text-xs font-bold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
               </div>
               <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    checked={draft.isAnonymous} 
                    onChange={(e) => updateDraft({ isAnonymous: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600" 
                  />
                  <span className="text-xs font-bold text-gray-600">Anonymous</span>
               </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-panel)] to-transparent pointer-events-none">
           <button 
            onClick={() => updateDraft({ isReviewed: true })}
            disabled={currentTask?.status !== 'complete'} 
            className={`w-full py-3 px-6 rounded-xl font-bold transition-all pointer-events-auto shadow-lg ${
              currentTask?.status === 'complete' 
                ? 'btn-primary opacity-100' 
                : 'btn-secondary opacity-50 cursor-not-allowed'
            }`}
           >
             {currentTask?.status === 'complete' ? 'Continue to Review' : 'Waiting for AI...'}
           </button>
        </div>

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-[var(--bg-panel)] rounded-2xl overflow-hidden shadow-2xl animate-scale-in border border-white/10">
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Pinpoint Issue Location
                </h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-strong)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <MapComponent
                height="500px"
                showReports={false}
                onLocationSelect={(lat, lng, address) => {
                  updateDraft({ 
                    location: address,
                    coordinates: { latitude: lat, longitude: lng }
                  });
                  setShowMap(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // STAGE 3: Final Review & Confirmation
  return (
    <div className="flex flex-col h-full animate-fade-in max-w-2xl mx-auto w-full pb-20 p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Brain className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Review Analysis</h2>
          <p className="text-xs text-gray-500">AI has drafted the details based on your photo</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Prediction Card */}
        <div className="card p-5 border-2 shadow-sm relative overflow-hidden" style={{ borderColor: 'var(--accent-blue)' }}>
           <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-bl-lg">
             {((currentTask?.result?.confidence || 0) * 100).toFixed(0)}% MATCH
           </div>
           
           <label className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 mb-2 block">AI CATEGORY</label>
           <h3 className="text-lg font-bold mb-4">{currentTask?.result?.category}</h3>

           <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">AUTO-DRAFTED DESCRIPTION</label>
              <button 
                onClick={() => setIsEditingDescription(!isEditingDescription)}
                className="text-[10px] font-extrabold text-blue-600 flex items-center gap-1 uppercase"
              >
                {isEditingDescription ? <Check className="w-3 h-3"/> : <Edit2 className="w-3 h-3"/>}
                {isEditingDescription ? 'Confirm' : 'Edit'}
              </button>
           </div>

           {isEditingDescription ? (
             <textarea 
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full bg-white dark:bg-black/20 border rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 ring-blue-500/20"
             />
           ) : (
             <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed">
               "{editedDescription || currentTask?.result?.description}"
             </p>
           )}
        </div>

        {/* Form Summary Check */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-panel)] rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <MapPin className="w-4 h-4 text-red-500" />
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LOCATION</p>
               <p className="text-sm font-semibold truncate">{draft.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-panel)] rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TITLE</p>
               <p className="text-sm font-semibold truncate">{draft.title || 'Untitled Report'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-panel)] to-transparent">
         <button 
          onClick={handleSubmit}
          className="w-full btn-primary py-4 text-base font-extrabold shadow-xl shadow-blue-500/20"
         >
           Confirm & Submit
         </button>
      </div>

      {/* Map Modal in Review Stage */}
      {showMap && (
        <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[var(--bg-panel)] rounded-2xl overflow-hidden shadow-2xl animate-scale-in border border-white/10">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Pinpoint Issue Location
              </h3>
              <button
                onClick={() => setShowMap(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-strong)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <MapComponent
              height="500px"
              showReports={false}
              onLocationSelect={(lat, lng, address) => {
                updateDraft({ 
                  location: address,
                  coordinates: { latitude: lat, longitude: lng }
                });
                setShowMap(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssueV2;
