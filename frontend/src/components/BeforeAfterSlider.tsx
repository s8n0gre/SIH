import React, { useState, useRef, useCallback } from 'react';

interface BeforeAfterSliderProps {
    beforeUrl: string;
    afterUrl: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
    beforeUrl,
    afterUrl,
    beforeLabel = 'Before',
    afterLabel = 'After',
    className = '',
}) => {
    const [sliderPos, setSliderPos] = useState(50); // percentage
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const updateSlider = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    }, []);

    const onMouseDown = () => { isDragging.current = true; };
    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging.current) updateSlider(e.clientX);
    }, [updateSlider]);
    const onMouseUp = () => { isDragging.current = false; };

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        updateSlider(e.touches[0].clientX);
    }, [updateSlider]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-xl select-none cursor-col-resize ${className}`}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchMove={onTouchMove}
        >
            {/* After image (full) */}
            <img src={afterUrl} alt="After" className="w-full h-full object-cover block" draggable={false} />

            {/* Before image (clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
            >
                <img
                    src={beforeUrl}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-cover block"
                    style={{ minWidth: `${(100 / sliderPos) * 100}%` }}
                    draggable={false}
                />
            </div>

            {/* Divider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                style={{ left: `${sliderPos}%` }}
            />

            {/* Drag handle */}
            <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-gray-200 flex items-center justify-center z-20 cursor-col-resize"
                style={{ left: `${sliderPos}%` }}
                onMouseDown={onMouseDown}
                onTouchStart={() => { isDragging.current = true; }}
                onTouchEnd={() => { isDragging.current = false; }}
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                </svg>
            </div>

            {/* Labels */}
            <span className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                {beforeLabel}
            </span>
            <span className="absolute top-2 right-2 bg-green-600 bg-opacity-90 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                {afterLabel}
            </span>

            {/* Hint */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full z-10 pointer-events-none">
                ← Drag to compare →
            </div>
        </div>
    );
};

export default BeforeAfterSlider;
