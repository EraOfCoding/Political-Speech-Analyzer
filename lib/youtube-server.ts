import 'server-only';

// This file contains all YouTube-related functionality
// It should ONLY be imported in API routes (server-side)

export async function getYouTubeInfo(url: string) {
  const play = await import('play-dl');

  try {
    const info = await play.video_info(url);

    if (!info) {
      throw new Error('Could not fetch video information');
    }

    const video = info.video_details;

    return {
      videoDetails: {
        videoId: video.id,
        title: video.title,
        lengthSeconds: video.durationInSec.toString(),
        author: {
          name: video.channel?.name || 'Unknown',
        },
        thumbnails: video.thumbnails.map((t: any) => ({ url: t.url })),
      },
    };
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    throw new Error('Failed to fetch video information. The video may be private, deleted, or region-restricted.');
  }
}

export async function downloadAudio(url: string): Promise<Buffer> {
  const play = await import('play-dl');
  const https = await import('https');

  return new Promise(async (resolve, reject) => {
    try {
      // Get audio stream URL
      const stream = await play.stream(url, {
        quality: 2, // Low quality audio
      });

      const chunks: Buffer[] = [];

      // Download the audio stream
      https.get(stream.url, (response) => {
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });

        response.on('error', (error) => {
          console.error('Audio download error:', error);
          reject(new Error('Failed to download audio from YouTube'));
        });
      }).on('error', (error) => {
        console.error('Audio download error:', error);
        reject(new Error('Failed to download audio from YouTube'));
      });
    } catch (error) {
      console.error('Audio extraction error:', error);
      reject(new Error('Failed to extract audio from YouTube video. The video may be age-restricted or unavailable.'));
    }
  });
}
