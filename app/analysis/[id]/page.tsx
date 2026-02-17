'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import TranscriptView from '@/components/TranscriptView';
import ProcessingView from '@/components/ProcessingView';
import { Button } from '@/components/ui/button';
import { Fallacy, Word } from '@/lib/types';

interface Analysis {
  id: string;
  sourceType: 'youtube' | 'upload';
  youtubeUrl?: string;
  youtubeId?: string;
  videoTitle: string;
  thumbnailUrl?: string;
  duration?: number;
  transcript: {
    text: string;
    words: Word[];
  };
  fallacies: Fallacy[];
  language?: string;
  createdAt: string;
  viewCount: number;
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const response = await fetch(`/api/analyses/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Analysis not found');
          } else {
            setError('Failed to load analysis');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  if (isLoading) {
    return <ProcessingView />;
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Analysis not found'}
          </h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {analysis.videoTitle}
              </h1>
              <p className="text-gray-600 mt-1">
                {analysis.fallacies.length} logical{' '}
                {analysis.fallacies.length === 1 ? 'fallacy' : 'fallacies'} detected
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/library">
                <Button variant="outline">View Library</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">New Analysis</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Left Panel - Video */}
          <div className="flex flex-col space-y-4">
            {analysis.sourceType === 'youtube' && analysis.youtubeId ? (
              <YouTubePlayer
                videoId={analysis.youtubeId}
                onTimeUpdate={setCurrentTime}
              />
            ) : (
              <div className="bg-gray-100 rounded-lg flex items-center justify-center p-12">
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto h-16 w-16 mb-4"
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
                  <p className="text-sm">
                    Video playback not available for uploaded files.
                    <br />
                    View the transcript and analysis below.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Transcript */}
          <div className="flex flex-col">
            <TranscriptView
              transcript={analysis.transcript}
              fallacies={analysis.fallacies}
              currentTime={currentTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
