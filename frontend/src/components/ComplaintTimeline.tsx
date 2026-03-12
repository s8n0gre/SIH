import React from 'react';
import { CheckCircle, Clock, Wrench, AlertTriangle, FileText, User } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
export type LifecycleStage =
    | 'submitted'
    | 'acknowledged'
    | 'in-progress'
    | 'resolved'
    | 'closed'
    | 'escalated'
    | 'reopened';

export interface TimelineEntry {
    stage: LifecycleStage;
    label: string;
    timestamp: string;        // ISO or formatted date string
    actor?: string;           // Name/role of who performed this action
    remarks?: string;         // Staff note or system message
    proofImageUrl?: string;   // Optional photo proof (used for resolved stage)
}

interface ComplaintTimelineProps {
    entries: TimelineEntry[];
    currentStage: LifecycleStage;
    compact?: boolean;        // Slim mode for card view
}

// ─── Stage config ─────────────────────────────────────────────────────────────
const STAGE_CONFIG: Record<LifecycleStage, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    submitted: { icon: <FileText className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-300 dark:border-blue-700' },
    acknowledged: { icon: <Clock className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-300 dark:border-indigo-700' },
    'in-progress': { icon: <Wrench className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300 dark:border-orange-700' },
    resolved: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-300 dark:border-green-700' },
    closed: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600' },
    escalated: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-300 dark:border-red-700' },
    reopened: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-300 dark:border-amber-700' },
};

// Standard order for pending stages indicator
const STAGE_ORDER: LifecycleStage[] = ['submitted', 'acknowledged', 'in-progress', 'resolved', 'closed'];

// ─── Component ────────────────────────────────────────────────────────────────
const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ entries, currentStage, compact = false }) => {
    if (entries.length === 0) {
        // Create default stages from the ordered list up to current
        const ci = STAGE_ORDER.indexOf(currentStage);
        const autoEntries: TimelineEntry[] = STAGE_ORDER.slice(0, ci + 1).map(stage => ({
            stage,
            label: stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' '),
            timestamp: '',
        }));
        entries = autoEntries;
    }

    if (compact) {
        // Horizontal progress dots for card footers
        return (
            <div className="flex items-center gap-0.5 overflow-x-auto">
                {STAGE_ORDER.map((stage, i) => {
                    const done = STAGE_ORDER.indexOf(currentStage) >= i;
                    const active = stage === currentStage;
                    const cfg = STAGE_CONFIG[stage];
                    return (
                        <React.Fragment key={stage}>
                            <div title={stage} className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? `${cfg.bg} ${cfg.border} ${cfg.color}` :
                                    done ? 'bg-green-100 border-green-400 text-green-600' :
                                        'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                                }`}>
                                {done ? <CheckCircle className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                            {i < STAGE_ORDER.length - 1 && (
                                <div className={`flex-1 h-0.5 min-w-3 ${STAGE_ORDER.indexOf(currentStage) > i ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap capitalize">
                    {currentStage.replace('-', ' ')}
                </span>
            </div>
        );
    }

    // Full vertical timeline
    return (
        <div className="space-y-0">
            {entries.map((entry, idx) => {
                const cfg = STAGE_CONFIG[entry.stage] || STAGE_CONFIG['submitted'];
                const isLast = idx === entries.length - 1;

                return (
                    <div key={idx} className="flex gap-3">
                        {/* Stepper column */}
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {cfg.icon}
                            </div>
                            {!isLast && (
                                <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1 min-h-6" />
                            )}
                        </div>

                        {/* Content */}
                        <div className={`pb-5 flex-1 min-w-0 ${isLast ? '' : ''}`}>
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div>
                                    <span className={`text-sm font-semibold ${cfg.color}`}>
                                        {entry.label}
                                    </span>
                                    {entry.actor && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <User className="w-3 h-3" />{entry.actor}
                                        </span>
                                    )}
                                </div>
                                {entry.timestamp && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{entry.timestamp}</span>
                                )}
                            </div>

                            {entry.remarks && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                                    {entry.remarks}
                                </p>
                            )}

                            {entry.proofImageUrl && (
                                <img
                                    src={entry.proofImageUrl}
                                    alt="Proof of work"
                                    className="mt-2 h-24 w-full max-w-xs object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ComplaintTimeline;
