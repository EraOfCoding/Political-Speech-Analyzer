'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from './ui/card';
import { formatDuration } from '@/lib/youtube';

interface AnalysisCardProps {
  id: string;
  sourceType: 'youtube' | 'upload';
  videoTitle: string;
  thumbnailUrl?: string;
  fallacyCount: number;
  createdAt: string;
  duration?: number;
  youtubeUrl?: string;
}

export function AnalysisCard({
  id,
  sourceType,
  videoTitle,
  thumbnailUrl,
  fallacyCount,
  createdAt,
  duration,
}: AnalysisCardProps) {
  return (
    <Link href={`/analysis/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative aspect-video bg-gray-100">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={videoTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="h-16 w-16 text-gray-400"
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
          )}

          {/* Source type badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${
                sourceType === 'youtube'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {sourceType === 'youtube' ? 'YouTube' : 'Upload'}
            </span>
          </div>

          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2">
              <span className="px-2 py-1 text-xs font-semibold bg-black bg-opacity-75 text-white rounded">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {videoTitle}
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">
                {fallacyCount} {fallacyCount === 1 ? 'fallacy' : 'fallacies'}
              </span>
            </div>

            <span className="text-xs">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
