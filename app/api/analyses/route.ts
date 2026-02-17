import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sourceType = searchParams.get('sourceType');

    // Build query
    let query = supabase
      .from('analyses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by source type if provided
    if (sourceType && ['youtube', 'upload'].includes(sourceType)) {
      query = query.eq('source_type', sourceType);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to fetch analyses');
    }

    // Transform data for response
    const analyses = data?.map((analysis) => ({
      id: analysis.id,
      sourceType: analysis.source_type,
      youtubeUrl: analysis.youtube_url,
      videoTitle: analysis.video_title,
      thumbnailUrl: analysis.thumbnail_url,
      fallacyCount: analysis.fallacy_count,
      createdAt: analysis.created_at,
      duration: analysis.duration,
    })) || [];

    return NextResponse.json({
      analyses,
      total: count || 0,
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch analyses',
      },
      { status: 500 }
    );
  }
}
