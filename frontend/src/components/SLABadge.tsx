import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLABadgeProps {
    /** ISO timestamp when the report was submitted */
    submittedAt: string;
    /** Category determines SLA hours — can be overridden with slaHours */
    category?: string;
    /** Explicit SLA duration in hours (overrides category lookup) */
    slaHours?: number;
    /** Current status — if resolved/closed/completed, show "Resolved within SLA" */
    status?: string;
    /** Show full countdown or just the colored badge dot */
    compact?: boolean;
}

// ─── SLA rules (hours per category, can be overridden by urgency) ─────────────
const CATEGORY_SLA: Record<string, number> = {
    'Public Safety': 6,
    'Electricity': 24,
    'Water Services': 24,
    'Roads & Infrastructure': 72,
    'Waste Management': 48,
    'Parks & Recreation': 168,
    'Other': 72,
};

function getSlaHours(category?: string, slaHours?: number): number {
    if (slaHours) return slaHours;
    if (category && CATEGORY_SLA[category]) return CATEGORY_SLA[category];
    return 72;
}

function formatDuration(ms: number): string {
    if (ms <= 0) return 'Overdue';
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const mins = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

const SLABadge: React.FC<SLABadgeProps> = ({
    submittedAt,
    category,
    slaHours,
    status = 'pending',
    compact = false,
}) => {
    const [remaining, setRemaining] = useState<number>(0);

    const sla = getSlaHours(category, slaHours);
    const deadlineMs = new Date(submittedAt).getTime() + sla * 3600000;

    useEffect(() => {
        const tick = () => setRemaining(deadlineMs - Date.now());
        tick();
        const id = setInterval(tick, 30000); // update every 30s
        return () => clearInterval(id);
    }, [deadlineMs]);

    const isResolved = ['resolved', 'completed', 'closed'].includes(status.toLowerCase());
    const isOverdue = remaining <= 0 && !isResolved;
    const pct = Math.min(100, Math.max(0, (remaining / (sla * 3600000)) * 100));
    const nearingThreshold = pct < 20 && !isOverdue;

    // Color scheme
    const color = isResolved
        ? 'text-green-700 dark:text-green-400'
        : isOverdue
            ? 'text-red-600 dark:text-red-400'
            : nearingThreshold
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-blue-600 dark:text-blue-400';

    const bgColor = isResolved
        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        : isOverdue
            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
            : nearingThreshold
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';

    const barColor = isResolved
        ? 'bg-green-500'
        : isOverdue
            ? 'bg-red-500'
            : nearingThreshold
                ? 'bg-amber-400'
                : 'bg-blue-500';

    const icon = isResolved
        ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
        : isOverdue
            ? <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            : <Clock className="w-3.5 h-3.5 flex-shrink-0" />;

    const label = isResolved
        ? '✅ Resolved within SLA'
        : isOverdue
            ? `⚠️ SLA Overdue by ${formatDuration(Math.abs(remaining))}`
            : `⏱️ ${formatDuration(remaining)} remaining`;

    if (compact) {
        // Just a colored dot with tooltip
        return (
            <span
                title={label + ` (SLA: ${sla}h)`}
                className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${isResolved ? 'bg-green-500' : isOverdue ? 'bg-red-500 animate-pulse' : nearingThreshold ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'
                    }`}
            />
        );
    }

    return (
        <div className={`inline-flex flex-col gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium min-w-[160px] ${bgColor}`}>
            <div className={`flex items-center gap-1.5 ${color}`}>
                {icon}
                <span>{label}</span>
            </div>

            {!isResolved && (
                <>
                    {/* Progress bar (time consumed) */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                            style={{ width: `${100 - pct}%` }}
                        />
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-[10px]">
                        SLA: {sla}h total • {Math.round(100 - pct)}% elapsed
                    </span>
                </>
            )}
        </div>
    );
};

export default SLABadge;
