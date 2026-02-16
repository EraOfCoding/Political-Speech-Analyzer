'use client';

import VideoUpload from '@/components/VideoUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Political Speech Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a political speech video and we'll detect logical fallacies in real-time
          </p>
        </div>
        
        <VideoUpload />
        
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-3">1</div>
              <h3 className="text-lg font-semibold mb-2">Upload Video</h3>
              <p className="text-gray-600">
                Upload your political speech video (MP4, MOV, or WebM)
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
              <h3 className="text-lg font-semibold mb-2">Review Results</h3>
              <p className="text-gray-600">
                See highlighted fallacies with explanations and video timestamps
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
