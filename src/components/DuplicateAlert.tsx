import React, { useState } from 'react';
import { AlertTriangle, ThumbsUp, Merge, X } from 'lucide-react';

interface DuplicateSuggestion {
    id: string;
    title: string;
    location?: string;
    votes: number;
    submittedAt?: string;
    similarity?: number; // 0–1
}

interface DuplicateAlertProps {
    suggestions: DuplicateSuggestion[];
    onVoteExisting: (id: string) => void;
    onDismiss: () => void;
}

const DuplicateAlert: React.FC<DuplicateAlertProps> = ({ suggestions, onVoteExisting, onDismiss }) => {
    const [dismissed, setDismissed] = useState(false);
    const [voted, setVoted] = useState<string | null>(null);

    if (dismissed || suggestions.length === 0) return null;

    const handleVote = (id: string) => {
        setVoted(id);
        onVoteExisting(id);
        setTimeout(() => { setDismissed(true); }, 1500);
    };

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss();
    };

    return (
        <div className="border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            Similar report{suggestions.length > 1 ? 's' : ''} found nearby
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            Vote on an existing report instead to speed up resolution
                        </p>
                    </div>
                </div>
                <button onClick={handleDismiss} className="text-amber-500 hover:text-amber-700 flex-shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Duplicate suggestions */}
            <div className="space-y-2">
                {suggestions.map(s => (
                    <div key={s.id} className={`bg-white dark:bg-gray-800 rounded-lg p-3 border transition-all ${voted === s.id
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'border-amber-200 dark:border-amber-700'
                        }`}>
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                                    {s.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    {s.location && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">📍 {s.location}</span>
                                    )}
                                    {s.similarity !== undefined && (
                                        <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                            {Math.round(s.similarity * 100)}% similar
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />{s.votes}
                                </span>
                                {voted === s.id ? (
                                    <span className="text-xs text-green-600 font-semibold">✓ Voted!</span>
                                ) : (
                                    <button
                                        onClick={() => handleVote(s.id)}
                                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <Merge className="w-3 h-3" /> Vote
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continue anyway */}
            <button
                onClick={handleDismiss}
                className="w-full text-xs text-amber-700 dark:text-amber-400 hover:underline py-1"
            >
                This is a different issue — continue filing new report →
            </button>
        </div>
    );
};

// ─── Detection utility (can be called from ReportIssue before submit) ─────────
export function detectDuplicates(
    title: string,
    lat: number | null,
    lng: number | null,
    existingReports: Array<{ id: string; title: string; location?: string; votes: number; submittedAt?: string; latitude?: number; longitude?: number }>
): DuplicateSuggestion[] {
    const results: DuplicateSuggestion[] = [];
    const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    for (const r of existingReports) {
        // Text similarity: jaccard-like overlap
        const rWords = r.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const intersection = words.filter(w => rWords.includes(w)).length;
        const union = new Set([...words, ...rWords]).size;
        const textSimilarity = union > 0 ? intersection / union : 0;

        // GPS proximity (< 50m = 0.00045 degrees approximately)
        let gpsSimilarity = 0;
        if (lat && lng && r.latitude && r.longitude) {
            const dlat = Math.abs(lat - r.latitude);
            const dlng = Math.abs(lng - r.longitude);
            const dist = Math.sqrt(dlat * dlat + dlng * dlng);
            gpsSimilarity = dist < 0.0005 ? 1 : dist < 0.001 ? 0.5 : 0;
        }

        const combined = textSimilarity * 0.6 + gpsSimilarity * 0.4;
        if (combined > 0.3) {
            results.push({ ...r, similarity: combined });
        }
    }

    return results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0)).slice(0, 3);
}

export default DuplicateAlert;
