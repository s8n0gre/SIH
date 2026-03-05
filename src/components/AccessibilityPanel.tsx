import React, { useState, useEffect, useRef } from 'react';
import {
    Moon, Sun, ChevronUp, ChevronDown, RotateCcw,
    Space, AlignJustify, ImageOff, MousePointer2, Volume2
} from 'lucide-react';

const AccessibilityPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [contrast, setContrast] = useState<'normal' | 'high'>('normal');
    const [fontSize, setFontSize] = useState(100);
    const [letterSpacing, setLetterSpacing] = useState(false);
    const [lineHeight, setLineHeight] = useState(false);
    const [hideImages, setHideImages] = useState(false);
    const [bigCursor, setBigCursor] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => { document.documentElement.style.fontSize = `${fontSize}%`; }, [fontSize]);
    useEffect(() => { document.body.classList.toggle('high-contrast', contrast === 'high'); }, [contrast]);
    useEffect(() => { document.body.classList.toggle('letter-spacing', letterSpacing); }, [letterSpacing]);
    useEffect(() => { document.body.classList.toggle('line-height-large', lineHeight); }, [lineHeight]);
    useEffect(() => { document.body.classList.toggle('hide-images', hideImages); }, [hideImages]);
    useEffect(() => { document.body.classList.toggle('big-cursor', bigCursor); }, [bigCursor]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const Btn = ({
        icon: Icon, label, active, onClick
    }: { icon: React.ElementType; label: string; active?: boolean; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center w-full
        ${active
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-[11px] font-medium leading-tight">{label}</span>
        </button>
    );

    return (
        <div className="relative" ref={panelRef}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Accessibility Tools"
                className={`p-2 rounded-lg border transition-colors duration-300 ${isOpen
                        ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-orange-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v5m0 0l-3 4m3-4l3 4M8 8l-2 2m10-2l2 2M9 15l-1 4m6-4l1 4" />
                </svg>
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[200] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 via-white to-green-600">
                        <span className="font-bold text-sm text-gray-800">Accessibility Tools</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-900 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-5 max-h-[80vh] overflow-y-auto">

                        {/* Contrast */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Contrast Adjustment</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Btn icon={Moon} label="High Contrast" active={contrast === 'high'} onClick={() => setContrast(c => c === 'high' ? 'normal' : 'high')} />
                                <Btn icon={Sun} label="Normal" active={contrast === 'normal'} onClick={() => setContrast('normal')} />
                            </div>
                        </div>

                        {/* Text Size */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                                Text Size {fontSize !== 100 && <span className="text-orange-500 normal-case font-normal">({fontSize}%)</span>}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <Btn icon={ChevronUp} label="Increase Text" onClick={() => setFontSize(s => Math.min(s + 10, 150))} />
                                <Btn icon={ChevronDown} label="Decrease Text" onClick={() => setFontSize(s => Math.max(s - 10, 70))} />
                                <Btn icon={RotateCcw} label="Reset Text" onClick={() => setFontSize(100)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Btn icon={Space} label="Text Spacing" active={letterSpacing} onClick={() => setLetterSpacing(v => !v)} />
                                <Btn icon={AlignJustify} label="Line Height" active={lineHeight} onClick={() => setLineHeight(v => !v)} />
                            </div>
                        </div>

                        {/* Others */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Others</p>
                            <div className="grid grid-cols-3 gap-2">
                                <Btn icon={ImageOff} label="Hide Images" active={hideImages} onClick={() => setHideImages(v => !v)} />
                                <Btn icon={MousePointer2} label="Big Cursor" active={bigCursor} onClick={() => setBigCursor(v => !v)} />
                                <Btn icon={Volume2} label="Screen Reader" onClick={() => alert('Select any text on the page; browser screen reader support coming soon.')} />
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessibilityPanel;
