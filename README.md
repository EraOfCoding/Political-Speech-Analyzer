# Political Speech Analyzer

A React-based web application that analyzes political speeches for logical fallacies using AI. Upload a video, get a transcript with highlighted fallacies, and click on words to jump to video timestamps.

## Features

- 🎥 **Video Upload**: Drag-and-drop or browse to upload political speech videos
- 📝 **AI Transcription**: Automatically transcribe speech using OpenAI Whisper
- 🧠 **Fallacy Detection**: Identify 8 types of logical fallacies using GPT-4o-mini
- 🎯 **Interactive Transcript**: Click any word to jump to that moment in the video
- 💡 **Detailed Explanations**: Hover over highlighted text to see fallacy explanations
- 🎨 **Modern UI**: Built with Next.js, shadcn/ui, and Tailwind CSS

## Detected Fallacy Types

1. **Strawman** - Misrepresenting someone's argument
2. **Ad Hominem** - Attacking the person instead of the argument
3. **False Dichotomy** - Presenting only two options when more exist
4. **Appeal to Emotion** - Using emotions instead of logic
5. **Slippery Slope** - Claiming one thing will lead to extreme consequences
6. **Hasty Generalization** - Drawing conclusions from insufficient evidence
7. **Red Herring** - Diverting attention from the real issue
8. **Circular Reasoning** - The conclusion is assumed in the premise

## Cost Estimate

Processing costs (using OpenAI APIs):
- **10-minute video**: ~$0.14
  - Whisper transcription: $0.06
  - GPT-4o-mini analysis: $0.08

With the free $5 OpenAI credit:
- You can analyze ~35 videos (10 minutes each)

## Prerequisites

- Node.js 18+ installed
- OpenAI API key (get $5 free credit at https://platform.openai.com)

## Installation

1. **Clone or download this project**

2. **Install dependencies**
```bash
npm install
```

3. **Set up your OpenAI API key**

Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

To get your API key:
- Go to https://platform.openai.com/api-keys
- Sign up (you'll get $5 free credit)
- Create a new API key
- Copy and paste it into `.env.local`

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**

Navigate to http://localhost:3000

## Usage

### 1. Upload a Video

- Drag and drop a video file (MP4, MOV, WebM) onto the upload area
- Or click "Select Video" to browse your files
- Maximum recommended file size: 100MB
- Recommended length: 5-15 minutes for best results

### 2. Processing

The app will:
1. Transcribe the video (~30-60 seconds)
2. Analyze for logical fallacies (~20-40 seconds)
3. Generate the interactive analysis view

### 3. Analysis View

**Left Panel:**
- Video player with standard controls
- Live transcript that highlights the current word being spoken

**Right Panel:**
- Full transcript with all detected fallacies highlighted in blue
- Click any word to jump to that timestamp in the video
- Hover over blue highlighted text to see fallacy details

**Fallacy Tooltip:**
When you hover over a highlighted section, you'll see:
- Fallacy type
- Severity level (minor/moderate/severe)
- The exact quote
- Explanation of why it's a fallacy

## Project Structure

```
political-speech-analyzer/
├── app/
│   ├── page.tsx              # Upload page
│   ├── analysis/page.tsx     # Analysis view
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   └── tooltip.tsx
│   ├── VideoUpload.tsx       # Upload component
│   ├── VideoPlayer.tsx       # Video player with live transcript
│   ├── TranscriptView.tsx    # Interactive transcript
│   ├── FallacyTooltip.tsx    # Fallacy explanation popup
│   └── ProcessingView.tsx    # Loading state
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── utils.ts              # Utility functions
│   └── openai.ts             # OpenAI API integration
└── public/                   # Static assets
```

## Technical Details

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **AI APIs**: OpenAI (Whisper + GPT-4o-mini)

### How It Works

1. **Video Upload**: File is stored in browser memory (not uploaded to any server)
2. **Transcription**: Video sent to OpenAI Whisper API, returns transcript with word-level timestamps
3. **Analysis**: Transcript sent to GPT-4o-mini with custom prompt to detect logical fallacies
4. **Display**: Results stored in sessionStorage and rendered in interactive UI
5. **Interaction**: Click events and hover states controlled by React state management

### Data Storage

- **Local Only**: Videos and analysis results stay in your browser
- **No Database**: Uses sessionStorage for temporary data
- **Privacy**: Nothing is stored on any server

## Limitations & Notes

- **OpenAI API Key**: Required for transcription and analysis
- **Browser Only**: API calls made from browser (not production-ready security)
- **Session Storage**: Data cleared when you close the browser tab
- **File Size**: Large videos (>100MB) may cause performance issues
- **Accuracy**: AI detection is not perfect - results should be reviewed critically

## Moving to Production

For a production deployment, you should:

1. **Move API calls to server-side** (use Next.js API routes)
2. **Add proper authentication**
3. **Store videos and results in a database**
4. **Add rate limiting**
5. **Implement proper error handling**
6. **Add user accounts**
7. **Deploy to Vercel or similar platform**

## Troubleshooting

### "Failed to transcribe video"
- Check that your OpenAI API key is correct in `.env.local`
- Ensure you have credit in your OpenAI account
- Try a smaller video file

### Video not playing
- Make sure the video format is supported (MP4, MOV, WebM)
- Try using Chrome or Firefox

### No fallacies detected
- The speech may genuinely have no fallacies
- Try a more clearly political/argumentative speech
- AI detection isn't perfect - some fallacies may be missed

### Out of API credits
- Check your OpenAI usage at https://platform.openai.com/usage
- Add payment method or wait for monthly reset

## Future Enhancements

Potential features to add:
- [ ] Support for multiple speakers
- [ ] Fact-checking integration
- [ ] Export results as PDF
- [ ] Side-by-side comparison of two speeches
- [ ] Real-time analysis of live streams
- [ ] Community voting on fallacy accuracy
- [ ] Browser extension for YouTube videos

## License

MIT License - feel free to use and modify as needed.

## Disclaimer

This tool is for educational and analytical purposes. The AI-detected fallacies should not be considered definitive and should be reviewed critically. Political analysis requires human judgment and context.
