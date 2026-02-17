'use client';

import { useState } from 'react';
import { YouTubeLinkInput } from './YouTubeLinkInput';
import { Card, CardContent } from './ui/card';

interface InputSelectorProps {
  onYouTubeSubmit: (url: string) => void;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

type TabType = 'youtube' | 'upload';

export function InputSelector({ onYouTubeSubmit, onFileSelect, isProcessing }: InputSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('youtube');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a video file (MP4, MOV, WebM)');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileSubmit = () => {
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'youtube'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('youtube')}
          disabled={isProcessing}
        >
          YouTube Link
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('upload')}
          disabled={isProcessing}
        >
          Upload Video
        </button>
      </div>

      {activeTab === 'youtube' ? (
        <YouTubeLinkInput onSubmit={onYouTubeSubmit} isProcessing={isProcessing} />
      ) : (
        <Card>
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports MP4, MOV, WebM (max 100MB)
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    disabled={isProcessing}
                  />
                  <label htmlFor="file-upload">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      Select Video
                    </button>
                  </label>
                </>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-blue-500 mb-4"
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
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleFileSubmit}
                      disabled={isProcessing}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Analyzing...' : 'Analyze Speech'}
                    </button>
                    <button
                      onClick={() => setFile(null)}
                      disabled={isProcessing}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Change Video
                    </button>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
