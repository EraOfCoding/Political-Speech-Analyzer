import { execa } from 'execa';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

/**
 * Gets YouTube video metadata using yt-dlp
 */
export async function getYouTubeInfo(url: string) {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('No YouTube URL provided.');
    }

    const normalizedUrl = url.trim();

    if (!normalizedUrl.includes('youtube.com') && !normalizedUrl.includes('youtu.be')) {
        throw new Error('The provided link does not appear to be a YouTube URL.');
    }

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
                timeout: 30000, // 30 second timeout for metadata
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

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'speech-analyzer-'));
    const audioPath = path.join(tempDir, 'audio.mp3');

    try {
        console.log('[yt-dlp] Downloading audio from:', normalizedUrl);

        const { stderr, failed, exitCode } = await execa(
            'yt-dlp',
            [
                '-x',                           // extract audio
                '--audio-format', 'mp3',
                '--audio-quality', '0',         // best quality
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
                timeout: 300000, // 5 minute timeout for download
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

        // Verify file exists and has reasonable size
        const stats = await fs.stat(audioPath);
        if (stats.size < 10000) {
            throw new Error('Downloaded audio file is too small — extraction probably failed.');
        }

        console.log(`[yt-dlp] Audio downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        // Compress audio to 128kbps mono MP3 for optimal quality/size balance
        const compressedPath = path.join(tempDir, 'audio-compressed.mp3');
        console.log('[ffmpeg] Compressing audio to 128kbps mono...');

        const { stderr: ffmpegStderr, failed: ffmpegFailed } = await execa(
            '/opt/homebrew/bin/ffmpeg',
            [
                '-i', audioPath,                    // input file
                '-ac', '1',                         // mono (1 audio channel)
                '-ab', '128k',                      // 128kbps bitrate (better quality for Whisper)
                '-ar', '16000',                     // 16kHz sample rate (optimal for Whisper)
                '-y',                               // overwrite output file
                compressedPath,
            ],
            {
                reject: false,
                cleanup: true,
                timeout: 120000, // 2 minute timeout
            }
        );

        if (ffmpegFailed) {
            console.error('[ffmpeg compression failed]', ffmpegStderr);
            throw new Error(`Failed to compress audio: ${ffmpegStderr || 'no details'}`);
        }

        // Verify compressed file
        const compressedStats = await fs.stat(compressedPath);
        if (compressedStats.size < 10000) {
            throw new Error('Compressed audio file is too small — compression probably failed.');
        }

        console.log(`[ffmpeg] Compressed audio: ${(compressedStats.size / 1024 / 1024).toFixed(2)} MB (${((compressedStats.size / stats.size) * 100).toFixed(1)}% of original)`);

        // Read compressed file into buffer
        const buffer = await fs.readFile(compressedPath);

        // Clean up temp files
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

        return buffer;

    } catch (err: any) {
        // Clean up on error
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

        console.error('Audio extraction error:', err);
        throw new Error(
            err.message?.includes('yt-dlp') || err.message?.includes('audio')
                ? err.message
                : `Failed to extract audio from YouTube video. The video may be age-restricted or unavailable.`
        );
    }
}

/**
 * Downloads audio-only from a YouTube URL and returns the file path.
 * (Legacy function - prefer using downloadAudio for Buffer)
 */
export async function extractYouTubeAudio(youtubeUrl: string | null | undefined): Promise<string> {
    if (!youtubeUrl || typeof youtubeUrl !== 'string' || youtubeUrl.trim() === '') {
        throw new Error('No YouTube URL provided.');
    }

    const url = youtubeUrl.trim();

    if (url === 'undefined' || url === 'null' || url.length < 10) {
        throw new Error('Invalid YouTube URL format.');
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        throw new Error('The provided link does not appear to be a YouTube URL.');
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'speech-analyzer-'));
    const audioPath = path.join(tempDir, 'audio.mp3');

    try {
        const { stderr, failed } = await execa(
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
                url,
            ],
            {
                reject: false,
                cleanup: true,
            }
        );

        if (failed) {
            throw new Error(
                `Failed to download audio from YouTube.\n` +
                `yt-dlp message: ${stderr || 'no details'}\n` +
                `Video may be age-restricted, private, region-locked, or unavailable.`
            );
        }

        const stats = await fs.stat(audioPath);
        if (stats.size < 10000) {
            throw new Error('Downloaded audio file is too small — extraction probably failed.');
        }

        console.log(`[YouTube audio extracted] ${audioPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        // Compress audio to 128kbps mono MP3
        const compressedPath = path.join(tempDir, 'audio-compressed.mp3');
        console.log('[ffmpeg] Compressing audio to 128kbps mono...');

        const { stderr: ffmpegStderr, failed: ffmpegFailed } = await execa(
            '/opt/homebrew/bin/ffmpeg',
            [
                '-i', audioPath,
                '-ac', '1',                         // mono
                '-ab', '128k',                      // 128kbps bitrate (better quality for Whisper)
                '-ar', '16000',                     // 16kHz sample rate (optimal for Whisper)
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

        // Verify compressed file
        const compressedStats = await fs.stat(compressedPath);
        if (compressedStats.size < 10000) {
            throw new Error('Compressed audio file is too small — compression probably failed.');
        }

        console.log(`[ffmpeg] Compressed audio: ${(compressedStats.size / 1024 / 1024).toFixed(2)} MB (${((compressedStats.size / stats.size) * 100).toFixed(1)}% of original)`);

        // Remove original, keep compressed
        await fs.rm(audioPath).catch(() => {});

        return compressedPath;

    } catch (err: any) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        throw new Error(
            err.message?.includes('yt-dlp')
                ? err.message
                : `Audio extraction failed: ${err.message || 'unknown error'}`
        );
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