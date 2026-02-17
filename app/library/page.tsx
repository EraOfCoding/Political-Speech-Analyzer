'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnalysisCard } from '@/components/AnalysisCard';
import { Button } from '@/components/ui/button';

interface AnalysisListItem {
  id: string;
  sourceType: 'youtube' | 'upload';
  youtubeUrl?: string;
  videoTitle: string;
  thumbnailUrl?: string;
  fallacyCount: number;
  createdAt: string;
  duration?: number;
}

type FilterType = 'all' | 'youtube' | 'upload';

export default function LibraryPage() {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchAnalyses() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          limit: '20',
          offset: '0',
        });

        if (filter !== 'all') {
          params.set('sourceType', filter);
        }

        const response = await fetch(`/api/analyses?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch analyses');
        }

        const data = await response.json();
        setAnalyses(data.analyses);
        setTotal(data.total);
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError('Failed to load analyses');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalyses();
  }, [filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Library</h1>
              <p className="text-gray-600 mt-1">
                {total} {total === 1 ? 'analysis' : 'analyses'} saved
              </p>
            </div>
            <Link href="/">
              <Button>New Analysis</Button>
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('youtube')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'youtube'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              YouTube
            </button>
            <button
              onClick={() => setFilter('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upload'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Uploads
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading analyses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No analyses yet
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start by analyzing your first video.'
                : `No ${filter} analyses found.`}
            </p>
            <Link href="/">
              <Button>Analyze a Video</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {analyses.map((analysis) => (
              <AnalysisCard key={analysis.id} {...analysis} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
