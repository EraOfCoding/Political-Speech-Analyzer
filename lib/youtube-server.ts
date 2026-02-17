import { getSupadataTranscript, getSupadataVideoInfo } from './supadata';

/**
 * Gets YouTube video metadata
 */
export async function getYouTubeInfo(url: string) {
    return getSupadataVideoInfo(url);
}

/**
 * Gets YouTube transcript with timestamps using Supadata
 */
export async function getYouTubeTranscript(url: string) {
    return getSupadataTranscript(url);
}