'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { transcribeVideo, detectFallacies } from '@/lib/openai';
import { Progress } from '@/components/ui/progress';

export default function VideoUpload() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
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
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const processVideo = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    setProgress(0);

    try {
      // Step 1: Transcribe
      setStatusMessage('Transcribing video...');
      setProgress(20);
      const transcriptResult = await transcribeVideo(file);
      
      setProgress(50);
      
      // Step 2: Detect fallacies
      setStatusMessage('Analyzing for logical fallacies...');
      const fallacyResult = await detectFallacies(
        transcriptResult.text,
        transcriptResult.words
      );
      
      setProgress(80);

      // Step 3: Prepare data
      setStatusMessage('Preparing analysis...');
      const analysisData = {
        transcript: {
          text: transcriptResult.text,
          words: transcriptResult.words,
        },
        fallacies: fallacyResult.fallacies.map(f => ({
          type: f.type,
          quote: f.quote,
          startWordIndex: f.start_word_index,
          endWordIndex: f.end_word_index,
          explanation: f.explanation,
          severity: f.severity,
        })),
      };

      // Create video URL
      const videoUrl = URL.createObjectURL(file);
      
      // Store in sessionStorage
      sessionStorage.setItem('analysisData', JSON.stringify(analysisData));
      sessionStorage.setItem('videoUrl', videoUrl);
      
      setProgress(100);
      
      // Navigate to analysis page
      setTimeout(() => {
        router.push('/analysis');
      }, 500);
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during processing');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          {!isProcessing ? (
            <>
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
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                    />
                    <label htmlFor="file-upload">
                      <Button asChild>
                        <span>Select Video</span>
                      </Button>
                    </label>
                  </>
                ) : (
                  <>
                    <Film className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={processVideo} size="lg">
                        Analyze Speech
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setFile(null)}
                        size="lg"
                      >
                        Change Video
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Film className="mx-auto h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {statusMessage}
                </h3>
                <p className="text-gray-600">This may take a minute...</p>
              </div>
              
              <Progress value={progress} className="w-full" />
              
              <div className="text-center text-sm text-gray-500">
                {progress}% complete
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Make sure you have set your OpenAI API key in the .env.local file.
            Processing a 10-minute video costs approximately $0.15.
          </p>
        </div>
      )}
    </div>
  );
}
