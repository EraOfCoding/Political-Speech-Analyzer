import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractVideoId, normalizeYouTubeUrl } from '@/lib/youtube';
import { detectFallacies } from '@/lib/openai';
import { Fallacy, YouTubeMetadata } from '@/lib/types';

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Server-only YouTube functions (dynamic import to avoid client bundling)
async function getYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const { getYouTubeInfo } = await import('@/lib/youtube-server');
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    const info = await getYouTubeInfo(url);
    const details = info.videoDetails;

    const thumbnails = details.thumbnails;
    const thumbnailUrl =
      thumbnails[thumbnails.length - 1]?.url ||
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return {
      videoId,
      title: details.title,
      thumbnailUrl,
      duration: parseInt(details.lengthSeconds) || 0,
      channelName: details.author?.name,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    throw new Error('Failed to fetch video metadata. Please check the URL and try again.');
  }
}

async function getYouTubeTranscriptData(url: string) {
  const { getYouTubeTranscript } = await import('@/lib/youtube-server');
  return getYouTubeTranscript(url);
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const urlParam = formData.get('youtubeUrl') as string;

    if (!urlParam) {
      return NextResponse.json(
        { error: 'YouTube URL is required.' },
        { status: 400 }
      );
    }

    // Validate and normalize URL
    const videoId = extractVideoId(urlParam);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format.' },
        { status: 400 }
      );
    }

    const youtubeId = videoId;
    const youtubeUrl = normalizeYouTubeUrl(urlParam);

    // Check if already analyzed (deduplication)
    const { data: existingAnalysis } = await supabase
      .from('analyses')
      .select('*')
      .eq('youtube_id', youtubeId)
      .single();

    if (existingAnalysis) {
      // Return cached analysis
      return NextResponse.json({
        id: existingAnalysis.id,
        analysisData: {
          transcript: {
            text: existingAnalysis.transcript_text,
            words: existingAnalysis.words,
          },
          fallacies: existingAnalysis.fallacies,
        },
        metadata: {
          sourceType: existingAnalysis.source_type,
          youtubeUrl: existingAnalysis.youtube_url,
          videoTitle: existingAnalysis.video_title,
          thumbnailUrl: existingAnalysis.thumbnail_url,
          duration: existingAnalysis.duration,
        },
        fromCache: true,
      });
    }

    // Fetch metadata
    const metadata = await getYouTubeMetadata(youtubeUrl);
    const videoTitle = metadata.title;
    const thumbnailUrl = metadata.thumbnailUrl;
    const duration = metadata.duration;

    // Get transcript from Supadata
    const transcriptResponse = await getYouTubeTranscriptData(youtubeUrl);

    // Detect fallacies
    const fallaciesResponse = await detectFallacies(
      transcriptResponse.text,
      transcriptResponse.words
    );

    // Transform fallacies to match our schema
    const fallacies: Fallacy[] = fallaciesResponse.fallacies.map((f) => ({
      type: f.type,
      quote: f.quote,
      startWordIndex: f.start_word_index,
      endWordIndex: f.end_word_index,
      explanation: f.explanation,
      severity: f.severity,
    }));

    const processingTime = Date.now() - startTime;

    // Save to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('analyses')
      .insert({
        source_type: 'youtube',
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
        video_title: videoTitle,
        thumbnail_url: thumbnailUrl,
        duration,
        transcript_text: transcriptResponse.text,
        words: transcriptResponse.words,
        language: transcriptResponse.language,
        fallacies,
        fallacy_count: fallacies.length,
        processing_time: processingTime,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw new Error('Failed to save analysis to database');
    }

    return NextResponse.json({
      id: savedAnalysis.id,
      analysisData: {
        transcript: {
          text: transcriptResponse.text,
          words: transcriptResponse.words,
        },
        fallacies,
      },
      metadata: {
        sourceType: 'youtube',
        youtubeUrl,
        videoTitle,
        thumbnailUrl,
        duration,
      },
      fromCache: false,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during analysis. Please try again.',
      },
      { status: 500 }
    );
  }
}
