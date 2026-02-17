import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('analyses')
      .update({ view_count: (analysis.view_count || 0) + 1 })
      .eq('id', id);

    // Return formatted analysis
    return NextResponse.json({
      analysis: {
        id: analysis.id,
        sourceType: analysis.source_type,
        youtubeUrl: analysis.youtube_url,
        youtubeId: analysis.youtube_id,
        videoTitle: analysis.video_title,
        thumbnailUrl: analysis.thumbnail_url,
        duration: analysis.duration,
        transcript: {
          text: analysis.transcript_text,
          words: analysis.words,
        },
        fallacies: analysis.fallacies,
        language: analysis.language,
        createdAt: analysis.created_at,
        viewCount: (analysis.view_count || 0) + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch analysis',
      },
      { status: 500 }
    );
  }
}
