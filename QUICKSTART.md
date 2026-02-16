# Quick Start Guide

Get your Political Speech Analyzer running in 5 minutes!

## Step 1: Install Node.js

If you don't have Node.js installed:
1. Go to https://nodejs.org/
2. Download the LTS version (18+)
3. Run the installer
4. Verify installation:
```bash
node --version  # Should show v18 or higher
npm --version   # Should show 9 or higher
```

## Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/signup
2. Create an account (free $5 credit included)
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with "sk-...")
6. **IMPORTANT**: Save it somewhere - you can't see it again!

## Step 3: Setup Project

Open terminal/command prompt and run:

```bash
# Navigate to the project folder
cd political-speech-analyzer

# Install all dependencies
npm install

# This will take 2-3 minutes
```

## Step 4: Add Your API Key

1. Open the `.env.local` file in the project folder
2. Replace `your_openai_api_key_here` with your actual API key:
```
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-key-here
```
3. Save the file

## Step 5: Run the App

```bash
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

## Step 6: Open in Browser

1. Open your browser (Chrome or Firefox recommended)
2. Go to: http://localhost:3000
3. You should see the upload page!

## Test It Out

### Finding a Test Video

**Option 1: YouTube Political Speech**
1. Go to YouTube and search "political debate clip"
2. Use a YouTube downloader like y2mate.com or savefrom.net
3. Download as MP4 (keep it under 10 minutes)

**Option 2: Record Your Own**
1. Record yourself reading a political article
2. Save as MP4, MOV, or WebM
3. Keep it under 5 minutes for faster processing

### Using the App

1. **Upload**: Drag and drop your video or click "Select Video"
2. **Analyze**: Click "Analyze Speech" button
3. **Wait**: Processing takes 1-2 minutes for a 10-minute video
4. **Explore**: 
   - Click words in the transcript to jump to that moment
   - Hover over blue highlights to see fallacy explanations
   - Watch the live transcript follow along

## Expected Costs

Your first 35 videos (10 minutes each) are **FREE** using the $5 credit:
- Per video: ~$0.14
- $5 credit = ~35 videos

After that:
- Add a payment method at https://platform.openai.com/account/billing
- Or create a new account for another $5 free credit

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 is already in use
```bash
# Use a different port
npm run dev -- -p 3001
# Then go to http://localhost:3001
```

### API key not working
- Make sure there are no spaces before/after the key in `.env.local`
- Restart the development server after changing `.env.local`
- Check you have credit: https://platform.openai.com/usage

### Video won't upload
- Try a smaller video (under 50MB)
- Use MP4 format
- Check browser console for errors (F12)

## Next Steps

Once it's working:
- Try different types of political speeches
- Experiment with debates vs. prepared speeches
- Compare fallacy detection across different speakers
- Read the full README.md for more details

## Need Help?

- Check the README.md for more detailed information
- Review the code comments in the source files
- OpenAI docs: https://platform.openai.com/docs

Enjoy analyzing political rhetoric! 🎯
