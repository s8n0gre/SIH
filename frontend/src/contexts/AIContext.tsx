import React, { createContext, useContext, useState, useCallback } from 'react';
import { aiModelService } from '../services/aiModel';

interface AITask {
  id: string;
  imageFile: File;
  imagePreview: string;
  status: 'uploading' | 'analyzing' | 'complete' | 'failed';
  progress: number;
  statusText: string;
  result?: {
    category: string;
    description: string;
    confidence: number;
  };
  startTime: number;
}

interface ReportDraft {
  taskId: string;
  title: string;
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
  urgency: string;
  isAnonymous: boolean;
  isReviewed: boolean;
}

interface AIContextType {
  tasks: Record<string, AITask>;
  draft: ReportDraft | null;
  startTask: (imageFile: File) => string;
  removeTask: (id: string) => void;
  getTask: (id: string) => AITask | undefined;
  updateDraft: (updates: Partial<ReportDraft>) => void;
  resetDraft: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Record<string, AITask>>({});
  const [draft, setDraft] = useState<ReportDraft | null>(null);

  const updateDraft = useCallback((updates: Partial<ReportDraft>) => {
    setDraft(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(null);
  }, []);

  const startTask = useCallback((imageFile: File) => {
    const id = Math.random().toString(36).substring(7);
    const imagePreview = URL.createObjectURL(imageFile);
    
    // Initialize draft
    setDraft({
      taskId: id,
      title: '',
      location: '',
      coordinates: null,
      urgency: 'medium',
      isAnonymous: false,
      isReviewed: false
    });
    const newTask: AITask = {
      id,
      imageFile,
      imagePreview,
      status: 'uploading',
      progress: 0,
      statusText: 'Preparing...',
      startTime: Date.now(),
    };

    setTasks(prev => ({ ...prev, [id]: newTask }));

    // Start actual processing
    aiModelService.predictFromImage(imageFile, (progress, statusText) => {
      setTasks(prev => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            progress,
            statusText,
            status: progress < 100 ? (statusText.toLowerCase().includes('analyzing') ? 'analyzing' : 'uploading') : 'complete'
          }
        };
      });
    }).then(result => {
      setTasks(prev => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            status: 'complete',
            progress: 100,
            statusText: 'Analysis complete!',
            result: {
              category: result.category,
              description: result.description || '',
              confidence: result.confidence
            }
          }
        };
      });
    }).catch(error => {
      setTasks(prev => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            status: 'failed',
            statusText: 'Analysis failed: ' + error.message
          }
        };
      });
    });

    return id;
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      if (newTasks[id]) {
        URL.revokeObjectURL(newTasks[id].imagePreview);
        delete newTasks[id];
      }
      return newTasks;
    });
  }, []);

  const getTask = useCallback((id: string) => {
    return tasks[id];
  }, [tasks]);

  return (
    <AIContext.Provider value={{ tasks, draft, startTask, removeTask, getTask, updateDraft, resetDraft }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
