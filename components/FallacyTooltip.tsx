'use client';

import { useEffect, useState } from 'react';
import { Fallacy } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

interface FallacyTooltipProps {
    fallacy: Fallacy;
    position: { x: number; y: number };
    onTooltipEnter: () => void;
    onTooltipLeave: () => void;
}

const SEVERITY_COLORS = {
    minor: 'bg-yellow-50 border-yellow-400',
    moderate: 'bg-orange-50 border-orange-400',
    severe: 'bg-red-50 border-red-400',
};

const SEVERITY_TEXT_COLORS = {
    minor: 'text-yellow-800',
    moderate: 'text-orange-800',
    severe: 'text-red-800',
};

const SEVERITY_BADGE = {
    minor: 'bg-yellow-200 text-yellow-900',
    moderate: 'bg-orange-200 text-orange-900',
    severe: 'bg-red-200 text-red-900',
};

export default function FallacyTooltip({
    fallacy,
    position,
    onTooltipEnter,
    onTooltipLeave,
}: FallacyTooltipProps) {
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    useEffect(() => {
        const tooltipWidth = 380;
        const tooltipHeight = 280; // approximate — you can measure more accurately if needed
        const padding = 20;

        let x = position.x - tooltipWidth / 2;
        let y = position.y - tooltipHeight - 34; // increased gap so tooltip doesn't overlap trigger as much

        // Keep within viewport horizontally
        if (x < padding) {
            x = padding;
        }
        if (x + tooltipWidth > window.innerWidth - padding) {
            x = window.innerWidth - tooltipWidth - padding;
        }

        // Keep within viewport vertically
        if (y < padding) {
            y = position.y + 44; // show below instead
        }

        setAdjustedPosition({ x, y });
    }, [position]);

    return (
        <div
            className={`fixed z-[9999] rounded-xl border-2 shadow-2xl pointer-events-auto ${SEVERITY_COLORS[fallacy.severity]}`}
            style={{
                left: `${adjustedPosition.x}px`,
                top: `${adjustedPosition.y}px`,
                width: '380px',
                maxWidth: 'calc(100vw - 40px)',
            }}
            onMouseEnter={onTooltipEnter}
            onMouseLeave={onTooltipLeave}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className={`h-5 w-5 ${SEVERITY_TEXT_COLORS[fallacy.severity]}`} />
                        <h4 className={`font-bold text-lg ${SEVERITY_TEXT_COLORS[fallacy.severity]}`}>
                            {fallacy.type}
                        </h4>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${SEVERITY_BADGE[fallacy.severity]}`}>
                        {fallacy.severity.toUpperCase()}
                    </span>
                </div>

                {/* Quote */}
                <div className="mb-3">
                    <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${SEVERITY_TEXT_COLORS[fallacy.severity]}`}>
                        Quote
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-800 italic leading-relaxed">
                            "{fallacy.quote}"
                        </p>
                    </div>
                </div>

                {/* Explanation */}
                <div>
                    <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${SEVERITY_TEXT_COLORS[fallacy.severity]}`}>
                        Why This Is A Fallacy
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {fallacy.explanation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}