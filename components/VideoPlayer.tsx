'use client';

import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TranscriptSegment } from '@/lib/types';
import { findWordAtTime } from '@/lib/utils';

interface VideoPlayerProps {
    videoUrl: string;
    transcript: TranscriptSegment;
    onTimeUpdate: (time: number) => void;
}

export default function VideoPlayer({ videoUrl, transcript, onTimeUpdate }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime;
            onTimeUpdate(currentTime);

            const wordIndex = findWordAtTime(transcript.words, currentTime);
            setCurrentWordIndex(wordIndex);
        };

        const handleJumpToTimestamp = (e: Event) => {
            const customEvent = e as CustomEvent<number>;
            if (video) {
                video.currentTime = customEvent.detail;
                video.play();
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        window.addEventListener('jumpToTimestamp', handleJumpToTimestamp);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            window.removeEventListener('jumpToTimestamp', handleJumpToTimestamp);
        };
    }, [transcript.words, onTimeUpdate]);

    const getLiveTranscriptText = () => {
        if (currentWordIndex === -1) return 'Video not started...';

        const startIndex = Math.max(0, currentWordIndex - 10);
        const endIndex = Math.min(transcript.words.length, currentWordIndex + 15);

        return transcript.words
            .slice(startIndex, endIndex)
            .map((w, idx) => {
                const globalIdx = startIndex + idx;
                const isCurrentWord = globalIdx === currentWordIndex;
                return (
                    <span
                        key={globalIdx}
                        className={isCurrentWord ? 'live-word' : ''}
                    >
                        {w.word}{' '}
                    </span>
                );
            });
    };

    return (
        <>
            <Card>
                <CardContent className="p-4">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full rounded-lg"
                    >
                        Your browser does not support the video tag.
                    </video>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Live Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
                        <p className="text-gray-700 leading-relaxed">
                            {getLiveTranscriptText()}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
