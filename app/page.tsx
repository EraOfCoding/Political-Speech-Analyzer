'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { YouTubeLinkInput } from '@/components/YouTubeLinkInput';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      statusTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const handleYouTubeSubmit = async (url: string) => {
    setIsProcessing(true);
    setError('');
    setProgress(0);
    setStatusMessage('Fetching video metadata...');

    // Smooth progress animation
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 85%
        if (prev < 85) {
          return prev + Math.random() * 2 + 0.5; // Faster at start
        } else if (prev < 90) {
          return prev + Math.random() * 0.5; // Slower near end
        }
        return prev; // Stop at 90%
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('sourceType', 'youtube');
      formData.append('youtubeUrl', url);

      // Clear any existing timeouts
      statusTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      statusTimeoutsRef.current = [];

      // Update status messages based on progress
      statusTimeoutsRef.current.push(
        setTimeout(() => setStatusMessage('Fetching transcript...'), 2000)
      );
      statusTimeoutsRef.current.push(
        setTimeout(() => setStatusMessage('Analyzing for fallacies...'), 8000)
      );

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze video');
      }

      const data = await response.json();

      // Jump to completion
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      statusTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      statusTimeoutsRef.current = [];

      setProgress(100);
      setStatusMessage('Analysis complete!');

      // Navigate to analysis page
      setTimeout(() => {
        router.push(`/analysis/${data.id}`);
      }, 500);
    } catch (err) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      statusTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      statusTimeoutsRef.current = [];

      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-4">
            Political Speech Analyzer
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Paste a YouTube link to detect logical fallacies in political speeches
          </p>
          <div className="mt-4">
            <Link href="/library">
              <Button variant="outline">View Library</Button>
            </Link>
          </div>
        </div>

        {!isProcessing ? (
          <YouTubeLinkInput
            onSubmit={handleYouTubeSubmit}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {statusMessage}
                </h3>
                <p className="text-gray-600">This may take a minute...</p>
              </div>

              <Progress value={progress} className="w-full" />

              <div className="text-center text-sm text-gray-500">
                {Math.round(progress)}% complete
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!isProcessing && (
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-3">1</div>
                <h3 className="text-lg font-semibold mb-2">Paste YouTube URL</h3>
                <p className="text-gray-600">
                  Enter the link to any YouTube video containing a political speech
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-3">2</div>
                <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI transcribes and analyzes the speech for logical fallacies
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-3">3</div>
                <h3 className="text-lg font-semibold mb-2">Review & Share</h3>
                <p className="text-gray-600">
                  See highlighted fallacies with explanations and share the analysis
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
