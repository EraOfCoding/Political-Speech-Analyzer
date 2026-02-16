'use client';

import { Film } from 'lucide-react';

export default function ProcessingView() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-6">
          <Film className="mx-auto h-16 w-16 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Processing your video...
        </h2>
        <p className="text-gray-600">
          This may take a moment. Please don't close this page.
        </p>
      </div>
    </div>
  );
}
