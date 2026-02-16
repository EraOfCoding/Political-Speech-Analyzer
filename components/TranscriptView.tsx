'use client';

import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TranscriptSegment, Fallacy } from '@/lib/types';
import FallacyTooltip from './FallacyTooltip';

interface TranscriptViewProps {
    transcript: TranscriptSegment;
    fallacies: Fallacy[];
    currentTime: number;
}

export default function TranscriptView({ transcript, fallacies, currentTime }: TranscriptViewProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hoveredFallacy, setHoveredFallacy] = useState<Fallacy | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const HIDE_DELAY_MS = 100; // 80–150 ms usually feels natural

    const showTooltip = (fallacy: Fallacy, rect: DOMRect) => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
        setHoveredFallacy(fallacy);
    };

    const scheduleHide = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = setTimeout(() => {
            setHoveredFallacy(null);
            hideTimeoutRef.current = null;
        }, HIDE_DELAY_MS);
    };

    const cancelHide = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    const isWordInFallacy = (wordIndex: number): Fallacy | null => {
        return fallacies.find(
            (f) => wordIndex >= f.startWordIndex && wordIndex <= f.endWordIndex
        ) || null;
    };

    const isCurrentWord = (word: { start: number; end: number }) => {
        return currentTime >= word.start && currentTime <= word.end;
    };

    const handleWordClick = (timestamp: number) => {
        const event = new CustomEvent('jumpToTimestamp', { detail: timestamp });
        window.dispatchEvent(event);
    };

    const renderTranscript = () => {
        const elements: JSX.Element[] = [];
        let i = 0;

        while (i < transcript.words.length) {
            const word = transcript.words[i];
            const fallacy = isWordInFallacy(i);
            const isCurrent = isCurrentWord(word);

            if (fallacy) {
                const fallacyWords: typeof transcript.words = [];
                let j = i;

                while (j < transcript.words.length && isWordInFallacy(j)?.type === fallacy.type) {
                    fallacyWords.push(transcript.words[j]);
                    j++;
                }

                const fallacyText = fallacyWords.map((w) => w.word).join(' ');
                const firstWord = fallacyWords[0];

                elements.push(
                    <span
                        key={`fallacy-${i}`}
                        className="highlighted cursor-pointer"
                        onClick={() => handleWordClick(firstWord.start)}
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            showTooltip(fallacy, rect);
                        }}
                        onMouseLeave={scheduleHide}
                    >
                        {fallacyText}{' '}
                    </span>
                );

                i = j;
            } else {
                elements.push(
                    <span
                        key={`word-${i}`}
                        className={`word ${isCurrent ? 'current-word' : ''}`}
                        onClick={() => handleWordClick(word.start)}
                    >
                        {word.word}{' '}
                    </span>
                );
                i++;
            }
        }

        return elements;
    };

    return (
        <>
            <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Full Transcript</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                {fallacies.length} {fallacies.length === 1 ? 'fallacy' : 'fallacies'} detected
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col">
                    <div
                        ref={scrollContainerRef}
                        className="bg-white rounded-lg p-6 flex-1 overflow-y-auto border border-gray-200 mb-4"
                    >
                        <div className="text-gray-800 leading-relaxed text-lg">{renderTranscript()}</div>
                    </div>

                    <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 border-b-2 border-blue-500 rounded"></div>
                            <span>Logical Fallacy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                            <span>Currently Playing</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            💡 Click any word to jump to that moment
                        </div>
                    </div>
                </CardContent>
            </Card>

            {hoveredFallacy && (
                <FallacyTooltip
                    fallacy={hoveredFallacy}
                    position={tooltipPosition}
                    onTooltipEnter={cancelHide}
                    onTooltipLeave={scheduleHide}
                />
            )}
        </>
    );
}