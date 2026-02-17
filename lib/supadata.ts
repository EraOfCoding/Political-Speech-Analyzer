/**
 * Supadata API client for YouTube transcription
 * https://supadata.ai/youtube-transcript-api
 */

const SUPADATA_API_URL = 'https://api.supadata.ai/v1/transcript';
const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;

interface SupadataChunk {
    text: string;
    offset: number;
    duration: number;
    lang?: string;
}

interface SupadataTranscriptResponse {
    content: SupadataChunk[] | string;
    lang: string;
    availableLangs?: string[];
}

interface SupadataJobResponse {
    jobId: string;
    status: 'processing';
}

/**
 * Gets YouTube transcript using Supadata API
 */
export async function getSupadataTranscript(youtubeUrl: string) {
    if (!SUPADATA_API_KEY) {
        throw new Error('SUPADATA_API_KEY environment variable is not set');
    }

    const url = new URL(SUPADATA_API_URL);
    url.searchParams.append('url', youtubeUrl);
    url.searchParams.append('text', 'false'); // Get timestamped chunks, not plain text
    // mode=auto is default - will use native captions or generate if unavailable

    console.log('[Supadata] Fetching transcript for:', youtubeUrl);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'x-api-key': SUPADATA_API_KEY,
            },
        });

        // Check if it's an async job (long video)
        if (response.status === 202) {
            const jobData: SupadataJobResponse = await response.json();
            console.log('[Supadata] Async job created:', jobData.jobId);
            throw new Error('Video is too long (>20 minutes) and requires async processing. Please try a shorter video.');
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Supadata] API error:', response.status, errorText);

            if (response.status === 401 || response.status === 403) {
                throw new Error('Supadata API key is invalid or missing.');
            } else if (response.status === 404) {
                throw new Error('Video not found or unavailable.');
            } else {
                throw new Error(`Supadata API error: ${response.status}`);
            }
        }

        const data: SupadataTranscriptResponse = await response.json();
        console.log('[Supadata] Response structure:', {
            hasContent: !!data.content,
            contentType: Array.isArray(data.content) ? 'array' : typeof data.content,
            lang: data.lang,
            availableLangs: data.availableLangs,
        });

        if (!data.content) {
            console.error('[Supadata] No content in response:', data);
            throw new Error('No transcript data in response. The video may not have captions available.');
        }

        // Handle chunked response (array of timestamped segments)
        if (Array.isArray(data.content)) {
            const chunks = data.content;

            if (chunks.length === 0) {
                throw new Error('Empty transcript returned. The video may not have captions available.');
            }

            // Build full text
            const fullText = chunks.map(chunk => chunk.text).join(' ');

            // Convert chunks to word-level timestamps
            const words: Array<{ word: string; start: number; end: number }> = [];

            chunks.forEach((chunk) => {
                const chunkWords = chunk.text.split(/\s+/).filter(w => w.length > 0);
                const chunkDuration = chunk.duration / 1000; // Convert ms to seconds
                const startTime = chunk.offset / 1000; // Convert ms to seconds
                const wordDuration = chunkDuration / chunkWords.length;

                chunkWords.forEach((word, index) => {
                    const wordStart = startTime + (index * wordDuration);
                    words.push({
                        word: word,
                        start: wordStart,
                        end: wordStart + wordDuration,
                    });
                });
            });

            console.log(`[Supadata] Transcript retrieved: ${words.length} words, ${data.lang}, ${(fullText.length / 1024).toFixed(2)} KB`);

            return {
                text: fullText,
                words: words,
                language: data.lang,
            };
        } else {
            // Plain text response (shouldn't happen with text=false, but handle it)
            throw new Error('Unexpected plain text response from Supadata. Expected timestamped chunks.');
        }

    } catch (err: any) {
        console.error('[Supadata] Error:', err.message);

        if (err.message?.includes('API key')) {
            throw err;
        } else if (err.message?.includes('async processing')) {
            throw err;
        } else if (err.message?.includes('not found')) {
            throw err;
        } else {
            throw new Error(`Failed to get transcript: ${err.message}`);
        }
    }
}

/**
 * Gets YouTube video metadata from Supadata
 */
export async function getSupadataVideoInfo(youtubeUrl: string) {
    if (!SUPADATA_API_KEY) {
        throw new Error('SUPADATA_API_KEY environment variable is not set');
    }

    // Extract video ID
    const videoIdMatch = youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }

    // Use YouTube oEmbed API for basic metadata (no API key needed)
    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);

        if (!response.ok) {
            throw new Error('Video not found or unavailable');
        }

        const data = await response.json();

        return {
            videoDetails: {
                videoId: videoId,
                title: data.title,
                lengthSeconds: '0', // oEmbed doesn't provide duration
                author: {
                    name: data.author_name,
                },
                thumbnails: [
                    {
                        url: data.thumbnail_url,
                        width: data.thumbnail_width,
                        height: data.thumbnail_height,
                    },
                ],
            },
        };
    } catch (err: any) {
        console.error('[YouTube oEmbed] Error:', err);
        throw new Error('Failed to fetch video metadata. The video may be unavailable or private.');
    }
}
