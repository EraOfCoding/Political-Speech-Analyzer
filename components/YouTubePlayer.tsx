'use client';

import { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({ videoId, onTimeUpdate }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (window.YT && containerRef.current && !playerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              setIsReady(true);
              // Start time update interval
              const interval = setInterval(() => {
                if (playerRef.current?.getCurrentTime) {
                  const currentTime = playerRef.current.getCurrentTime();
                  onTimeUpdate?.(currentTime);
                }
              }, 100);
              return () => clearInterval(interval);
            },
          },
        });
      }
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, onTimeUpdate]);

  // Expose jump to time function
  useEffect(() => {
    const handleJumpToTime = (event: CustomEvent) => {
      if (playerRef.current && isReady) {
        playerRef.current.seekTo(event.detail.time, true);
        playerRef.current.playVideo();
      }
    };

    window.addEventListener('jumpToTimestamp' as any, handleJumpToTime as any);
    return () => {
      window.removeEventListener('jumpToTimestamp' as any, handleJumpToTime as any);
    };
  }, [isReady]);

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden"
      />
    </div>
  );
}

export function jumpToTimestamp(time: number) {
  const event = new CustomEvent('jumpToTimestamp', { detail: { time } });
  window.dispatchEvent(event);
}
