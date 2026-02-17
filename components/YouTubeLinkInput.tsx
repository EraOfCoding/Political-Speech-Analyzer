'use client';

import { useState } from 'react';
import { Button } from './ui/button';

interface YouTubeLinkInputProps {
  onSubmit: (url: string) => void;
  isProcessing: boolean;
}

export function YouTubeLinkInput({ onSubmit, isProcessing }: YouTubeLinkInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /^[a-zA-Z0-9_-]{11}$/,
    ];
    return patterns.some((pattern) => pattern.test(url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    onSubmit(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Speech'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Maximum video duration: 1 hour
          </p>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Supported formats:
        </h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
          <li>• https://youtu.be/VIDEO_ID</li>
          <li>• https://youtube.com/watch?v=VIDEO_ID&t=30s</li>
        </ul>
      </div>
    </div>
  );
}
