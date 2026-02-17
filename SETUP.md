# Setup Instructions

This guide will help you set up the Political Speech Analyzer with YouTube integration and database persistence.

## Prerequisites

- Node.js 18+ installed
- OpenAI API account
- Supabase account

## Step 1: Clone and Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (takes ~2 minutes)
3. Go to **Project Settings > API** and copy:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Create Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Paste the following SQL and click **Run**:

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Source identification
  source_type TEXT NOT NULL,
  youtube_url TEXT,
  youtube_id TEXT UNIQUE,
  video_title TEXT,
  thumbnail_url TEXT,
  duration REAL,

  -- Transcript data
  transcript_text TEXT NOT NULL,
  words JSONB NOT NULL,
  language TEXT,

  -- Fallacy analysis
  fallacies JSONB NOT NULL,
  fallacy_count INTEGER DEFAULT 0,

  -- Metadata
  processing_time INTEGER,
  view_count INTEGER DEFAULT 0
);

CREATE INDEX idx_youtube_id ON analyses(youtube_id);
CREATE INDEX idx_created_at ON analyses(created_at DESC);
CREATE INDEX idx_source_type ON analyses(source_type);
```

## Step 4: Get OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key (starts with `sk-`)

## Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your keys:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### YouTube Analysis
- Paste any YouTube URL
- Videos up to 1 hour supported
- Automatic deduplication (same video analyzed once)
- Metadata fetched automatically (title, thumbnail, duration)

### File Upload
- Upload MP4, WebM, or other video files
- Max file size: 100MB

### Library
- View all previously analyzed videos
- Filter by YouTube or uploads
- Click any card to view full analysis

### Shareable URLs
- Each analysis gets a unique URL: `/analysis/{id}`
- Share the URL with anyone
- No login required to view

## Database Schema

The `analyses` table stores:
- `id`: Unique identifier (UUID)
- `source_type`: 'youtube' or 'upload'
- `youtube_url`: Original YouTube URL (if applicable)
- `youtube_id`: YouTube video ID for deduplication
- `video_title`: Title of the video
- `thumbnail_url`: Thumbnail image URL
- `duration`: Video duration in seconds
- `transcript_text`: Full transcript text
- `words`: Array of word objects with timestamps
- `fallacies`: Array of detected fallacies
- `fallacy_count`: Number of fallacies found
- `created_at`: When analysis was created
- `view_count`: Number of times viewed

## Cost Estimates

### OpenAI API Costs (approximate)
- Whisper API: ~$0.006 per minute
- GPT-4o-mini: ~$0.001 per analysis

**Example**: 10-minute video costs ~$0.07 total

### Supabase
- Free tier includes:
  - 500 MB database storage
  - 50 MB file storage
  - 2 GB bandwidth

## Rate Limiting

The app implements basic rate limiting:
- 5 analyses per hour per IP address
- Prevents abuse and controls costs
- Cached YouTube videos don't count against the limit

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and contains both Supabase variables
- Restart the dev server after adding variables

### "Failed to fetch video metadata"
- Check if the YouTube URL is valid and the video is public
- Some videos may be region-restricted or age-restricted

### "Video is too long"
- Maximum duration is 1 hour (3600 seconds)
- This limit prevents excessive API costs

### Database connection errors
- Verify your Supabase URL and API key are correct
- Check if your Supabase project is active (not paused)

## Security Notes

- ✅ OpenAI API key is server-side only (no `NEXT_PUBLIC_` prefix)
- ✅ Supabase Row Level Security (RLS) should be configured for production
- ✅ Rate limiting prevents abuse
- ✅ Input validation on all user inputs

## Next Steps

Consider adding:
- User authentication (Supabase Auth)
- Row Level Security policies
- Advanced search/filtering in library
- Export analysis as PDF
- Social sharing with Open Graph meta tags
