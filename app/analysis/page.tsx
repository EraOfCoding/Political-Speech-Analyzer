'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import TranscriptView from '@/components/TranscriptView';
import ProcessingView from '@/components/ProcessingView';
import { AnalysisData } from '@/lib/types';

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('analysisData');
    const storedVideoUrl = sessionStorage.getItem('videoUrl');
    
    if (storedData && storedVideoUrl) {
      setAnalysisData(JSON.parse(storedData));
      setVideoUrl(storedVideoUrl);
      setIsProcessing(false);
    }
  }, []);

  if (isProcessing || !analysisData || !videoUrl) {
    return <ProcessingView />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Speech Analysis</h1>
          <p className="text-gray-600 mt-1">
            {analysisData.fallacies.length} logical fallacies detected
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Left Panel - Video */}
          <div className="flex flex-col space-y-4">
            <VideoPlayer
              videoUrl={videoUrl}
              transcript={analysisData.transcript}
              onTimeUpdate={setCurrentTime}
            />
          </div>

          {/* Right Panel - Transcript */}
          <div className="flex flex-col">
            <TranscriptView
              transcript={analysisData.transcript}
              fallacies={analysisData.fallacies}
              currentTime={currentTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
