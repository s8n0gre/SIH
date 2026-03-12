import React from 'react';
import { Brain, CheckCircle2 } from 'lucide-react';
import { useAI } from '../contexts/AIContext';

interface AITaskIndicatorProps {
  onClick: () => void;
}

const AITaskIndicator: React.FC<AITaskIndicatorProps> = ({ onClick }) => {
  const { tasks, draft } = useAI();
  
  const currentTask = draft ? tasks[draft.taskId] : null;
  
  if (!currentTask && !draft) return null;

  const isProcessing = currentTask?.status === 'analyzing' || currentTask?.status === 'uploading';
  const isComplete = currentTask?.status === 'complete' && !draft?.isReviewed;

  if (!isProcessing && !isComplete) return null;

  return (
    <div 
      onClick={onClick}
      className={`fixed bottom-24 right-6 z-[60] group cursor-pointer animate-fade-in`}
    >
      <div className={`relative flex items-center gap-3 p-2 pr-4 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-500 transform hover:scale-105 active:scale-95 ${
        isComplete 
          ? 'bg-green-500/10 border-green-500/50 text-green-600' 
          : 'bg-blue-500/10 border-blue-500/50 text-blue-600'
      }`}>
        {/* Progress ring or icon */}
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
            isComplete ? 'bg-green-500' : 'bg-blue-600'
          }`}>
            {isProcessing ? (
              <Brain className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white" />
            )}
          </div>
          
          {isProcessing && (
            <svg className="absolute inset-0 w-10 h-10 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * (currentTask?.progress || 0)) / 100}
                className="opacity-20 translate-x-[-1px] translate-y-[-1px]"
              />
            </svg>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5">
            {isProcessing ? 'AI Processing' : 'Report Ready'}
          </span>
          <span className="text-[11px] font-bold truncate max-w-[120px]">
            {isProcessing ? 'Analyzing photo...' : (draft?.title || 'Review your report')}
          </span>
        </div>

        {/* Glow effect */}
        <div className={`absolute -inset-1 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity ${
          isComplete ? 'bg-green-400' : 'bg-blue-400'
        }`} />
      </div>
    </div>
  );
};

export default AITaskIndicator;
