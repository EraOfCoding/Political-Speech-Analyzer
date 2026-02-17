import { execa } from 'execa';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { Readable } from 'node:stream';

// Detect if running on Vercel or other serverless environments
const IS_SERVERLESS = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || !process.env.HOME?.includes('/Users/');

if (IS_SERVERLESS) {
    console.log('[Environment] Running in serverless mode (using ytdl-core)');
} else {
    console.log('[Environment] Running in local mode (using yt-dlp + ffmpeg)');
}

/**
 * Gets YouTube video metadata
 */
export async function getYouTubeInfo(url: string) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('No YouTube URL provided.');
    }

    const normalizedUrl = url.trim();

    if (!normalizedUrl.includes('youtube.com') && !normalizedUrl.includes('youtu.be')) {
        throw new Error('The provided link does not appear to be a YouTube URL.');
    }

    if (IS_SERVERLESS) {
        // Use ytdl-core for serverless environments
        console.log('[ytdl-core] Fetching video info...');
        const ytdl = (await import('ytdl-core')).default;

        try {
            const info = await ytdl.getInfo(normalizedUrl);
            const videoDetails = info.videoDetails;

            return {
                videoDetails: {
                    videoId: videoDetails.videoId,
                    title: videoDetails.title,
                    lengthSeconds: videoDetails.lengthSeconds,
                    author: {
                        name: videoDetails.author.name,
                    },
                    thumbnails: videoDetails.thumbnails,
                },
            };
        } catch (err: any) {
            console.error('[ytdl-core metadata failed]', err);
            throw new Error('Failed to fetch video metadata. The video may be unavailable or private.');
        }
    } else {
        // Use yt-dlp for local development
        try {
            const { stdout, stderr, failed } = await execa(
                'yt-dlp',
                [
                    '--dump-json',
                    '--no-playlist',
                    '--no-warnings',
                    normalizedUrl,
                ],
                {
                    reject: false,
                    timeout: 30000,
                }
            );

            if (failed) {
                console.error('[yt-dlp metadata failed]', stderr);
                throw new Error('Failed to fetch video metadata. The video may be unavailable or private.');
            }

            const info = JSON.parse(stdout);

            return {
                videoDetails: {
                    videoId: info.id,
                    title: info.title,
                    lengthSeconds: String(info.duration || 0),
                    author: {
                        name: info.uploader || info.channel || 'Unknown',
                    },
                    thumbnails: info.thumbnails?.map((t: any) => ({
                        url: t.url,
                        width: t.width,
                        height: t.height,
                    })) || [],
                },
            };
        } catch (err: any) {
            if (err.message?.includes('JSON')) {
                throw new Error('Failed to parse video metadata. The video may be unavailable.');
            }
            throw new Error(`Failed to fetch video info: ${err.message || 'unknown error'}`);
        }
    }
}

/**
 * Downloads audio from YouTube URL and returns as Buffer
 */
export async function downloadAudio(url: string): Promise<Buffer> {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('No YouTube URL provided.');
    }

    const normalizedUrl = url.trim();

    if (normalizedUrl === 'undefined' || normalizedUrl === 'null' || normalizedUrl.length < 10) {
        throw new Error('Invalid YouTube URL format.');
    }

    if (!normalizedUrl.includes('youtube.com') && !normalizedUrl.includes('youtu.be')) {
        throw new Error('The provided link does not appear to be a YouTube URL.');
    }

    if (IS_SERVERLESS) {
        // Use ytdl-core for serverless environments (Vercel, AWS Lambda, etc.)
        console.log('[ytdl-core] Downloading audio from:', normalizedUrl);
        const ytdl = (await import('ytdl-core')).default;

        try {
            const audioStream = ytdl(normalizedUrl, {
                quality: 'lowestaudio',
                filter: 'audioonly',
            });

            const chunks: Buffer[] = [];

            for await (const chunk of audioStream) {
                chunks.push(Buffer.from(chunk));
            }

            const buffer = Buffer.concat(chunks);

            if (buffer.length < 10000) {
                throw new Error('Downloaded audio file is too small — extraction probably failed.');
            }

            console.log(`[ytdl-core] Audio downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
            return buffer;

        } catch (err: any) {
            console.error('[ytdl-core download failed]', err);
            throw new Error(
                `Failed to extract audio from YouTube video. ` +
                `The video may be age-restricted or unavailable.`
            );
        }
    } else {
        // Use yt-dlp + ffmpeg for local development (better quality)
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'speech-analyzer-'));
        const audioPath = path.join(tempDir, 'audio.mp3');

        try {
            console.log('[yt-dlp] Downloading audio from:', normalizedUrl);

            const { stderr, failed, exitCode } = await execa(
                'yt-dlp',
                [
                    '-x',
                    '--audio-format', 'mp3',
                    '--audio-quality', '0',
                    '--no-playlist',
                    '--restrict-filenames',
                    '--no-warnings',
                    '--ffmpeg-location', '/opt/homebrew/bin/ffmpeg',
                    '-o', audioPath,
                    normalizedUrl,
                ],
                {
                    reject: false,
                    cleanup: true,
                    timeout: 300000,
                }
            );

            if (failed || exitCode !== 0) {
                console.error('[yt-dlp download failed]', { exitCode, stderr });
                throw new Error(
                    `Failed to extract audio from YouTube video. ` +
                    `The video may be age-restricted or unavailable.\n` +
                    `Error: ${stderr || 'no details'}`
                );
            }

            const stats = await fs.stat(audioPath);
            if (stats.size < 10000) {
                throw new Error('Downloaded audio file is too small — extraction probably failed.');
            }

            console.log(`[yt-dlp] Audio downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

            // Compress audio
            const compressedPath = path.join(tempDir, 'audio-compressed.mp3');
            console.log('[ffmpeg] Compressing audio to 128kbps mono...');

            const { stderr: ffmpegStderr, failed: ffmpegFailed } = await execa(
                '/opt/homebrew/bin/ffmpeg',
                [
                    '-i', audioPath,
                    '-ac', '1',
                    '-ab', '128k',
                    '-ar', '16000',
                    '-y',
                    compressedPath,
                ],
                {
                    reject: false,
                    cleanup: true,
                    timeout: 120000,
                }
            );

            if (ffmpegFailed) {
                console.error('[ffmpeg compression failed]', ffmpegStderr);
                throw new Error(`Failed to compress audio: ${ffmpegStderr || 'no details'}`);
            }

            const compressedStats = await fs.stat(compressedPath);
            if (compressedStats.size < 10000) {
                throw new Error('Compressed audio file is too small — compression probably failed.');
            }

            console.log(`[ffmpeg] Compressed audio: ${(compressedStats.size / 1024 / 1024).toFixed(2)} MB (${((compressedStats.size / stats.size) * 100).toFixed(1)}% of original)`);

            const buffer = await fs.readFile(compressedPath);
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

            return buffer;

        } catch (err: any) {
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
            console.error('Audio extraction error:', err);
            throw new Error(
                err.message?.includes('yt-dlp') || err.message?.includes('audio')
                    ? err.message
                    : `Failed to extract audio from YouTube video. The video may be age-restricted or unavailable.`
            );
        }
    }
}

/**
 * Downloads audio-only from a YouTube URL and returns the file path.
 * (Legacy function - prefer using downloadAudio for Buffer)
 */
export async function extractYouTubeAudio(youtubeUrl: string | null | undefined): Promise<string> {
    // Use downloadAudio and write to temp file
    const buffer = await downloadAudio(youtubeUrl!);

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'speech-analyzer-'));
    const audioPath = path.join(tempDir, 'audio.mp3');

    try {
        // Write buffer to file
        await fs.writeFile(audioPath, buffer);
        console.log(`[Audio] Saved to: ${audioPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        return audioPath;
    } catch (err: any) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        throw new Error(`Failed to save audio file: ${err.message || 'unknown error'}`);
    }
}

/**
 * Clean up audio file after processing
 */
export async function cleanupAudioFile(filePath: string): Promise<void> {
    try {
        const dir = path.dirname(filePath);
        await fs.rm(filePath);
        await fs.rmdir(dir).catch(() => {});
    } catch (err) {
        console.warn('Cleanup failed:', err);
    }
}