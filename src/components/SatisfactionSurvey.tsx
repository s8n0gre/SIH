import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star, Send, AlertCircle } from 'lucide-react';

interface SatisfactionSurveyProps {
    reportId: string;
    reportTitle?: string;
    /** Called with rating (1-5) and optional comment when citizen submits */
    onSubmit?: (data: { reportId: string; rating: number; comment: string; reopen: boolean }) => void;
    /** Called when citizen requests reopen */
    onReopen?: (reportId: string, reason: string) => void;
    onClose?: () => void;
}

const SatisfactionSurvey: React.FC<SatisfactionSurveyProps> = ({
    reportId,
    reportTitle,
    onSubmit,
    onReopen,
    onClose,
}) => {
    const [step, setStep] = useState<'rating' | 'comment' | 'reopen' | 'thanks'>('rating');
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [satisfied, setSatisfied] = useState<boolean | null>(null);
    const [comment, setComment] = useState('');
    const [reopenReason, setReopenReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const ratingLabels = ['', 'Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];
    const ratingColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];

    const handleSatisfied = (isHappy: boolean) => {
        setSatisfied(isHappy);
        setRating(isHappy ? 4 : 2);
        if (isHappy) {
            setStep('comment');
        } else {
            setStep('reopen');
        }
    };

    const handleSubmitPositive = async () => {
        setSubmitting(true);
        try {
            onSubmit?.({ reportId, rating, comment, reopen: false });
        } finally {
            setSubmitting(false);
            setStep('thanks');
        }
    };

    const handleReopen = async () => {
        if (!reopenReason.trim()) return;
        setSubmitting(true);
        try {
            onReopen?.(reportId, reopenReason);
            onSubmit?.({ reportId, rating, comment: reopenReason, reopen: true });
        } finally {
            setSubmitting(false);
            setStep('thanks');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden max-w-sm w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Issue Resolved</p>
                <h3 className="font-bold text-base mt-0.5">How was your experience?</h3>
                {reportTitle && (
                    <p className="text-xs text-green-100 mt-0.5 truncate">{reportTitle}</p>
                )}
            </div>

            <div className="p-5">
                {/* ── Step 1: Was it resolved? ── */}
                {step === 'rating' && (
                    <div className="space-y-4">
                        {/* Quick thumbs */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => handleSatisfied(true)}
                                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                            >
                                <ThumbsUp className="w-8 h-8 text-gray-400 group-hover:text-green-500 transition-colors" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                                    👍 Resolved!
                                </span>
                            </button>
                            <button
                                onClick={() => handleSatisfied(false)}
                                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                            >
                                <ThumbsDown className="w-8 h-8 text-gray-400 group-hover:text-red-500 transition-colors" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                                    👎 Not Fixed
                                </span>
                            </button>
                        </div>

                        {/* Star rating */}
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">Or rate your experience</p>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => { setRating(star); setStep('comment'); }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-125"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {(hoverRating || rating) > 0 && (
                                <p className={`text-center text-xs font-medium mt-1 ${ratingColors[hoverRating || rating]}`}>
                                    {ratingLabels[hoverRating || rating]}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-1"
                        >
                            Skip survey
                        </button>
                    </div>
                )}

                {/* ── Step 2: Positive comment ── */}
                {step === 'comment' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <ThumbsUp className="w-5 h-5" />
                            <span className="font-semibold">Thanks for the feedback!</span>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                                Any comments? (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm resize-none focus:ring-2 focus:ring-green-500"
                                placeholder="Tell us what went well..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSubmitPositive}
                                disabled={submitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                            <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Skip
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Reopen workflow ── */}
                {step === 'reopen' && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Reopen this Complaint?</p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                    It will be sent back to the assigned department with priority status.
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                                Describe what's still wrong <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reopenReason}
                                onChange={e => setReopenReason(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm resize-none focus:ring-2 focus:ring-amber-500"
                                placeholder="e.g. Water is still leaking from the same spot..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReopen}
                                disabled={submitting || !reopenReason.trim()}
                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
                            >
                                {submitting ? 'Reopening...' : '🔄 Reopen Complaint'}
                            </button>
                            <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Thank you ── */}
                {step === 'thanks' && (
                    <div className="text-center py-4 space-y-3">
                        <div className="text-5xl">{satisfied === false ? '🔄' : '🙏'}</div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                            {satisfied === false ? 'Complaint Reopened' : 'Thank you!'}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {satisfied === false
                                ? 'Your complaint has been reopened with high priority. You will be notified on the next update.'
                                : 'Your feedback helps us improve municipal services for everyone.'}
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SatisfactionSurvey;
