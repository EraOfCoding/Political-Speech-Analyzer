import 'server-only';
import OpenAI from 'openai';
import { WhisperResponse, FallacyDetectionResponse } from './types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function transcribeVideo(audioBuffer: Buffer, filename: string): Promise<WhisperResponse> {
    try {
        // Ensure filename has .mp3 extension
        const mp3Filename = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;

        console.log(`[Whisper] Transcribing file: ${mp3Filename} (${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

        // Create a File-like object from Buffer for OpenAI API
        const file = new File([new Uint8Array(audioBuffer)], mp3Filename, { type: 'audio/mpeg' });

        const response = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            response_format: 'verbose_json',
            timestamp_granularities: ['word'],
        });

        console.log(`[Whisper] Transcription complete. Language: ${response.language}`);
        return response as unknown as WhisperResponse;
    } catch (error) {
        console.error('Transcription error:', error);
        throw new Error('Failed to transcribe video. Please try again.');
    }
}

export async function detectFallacies(
    transcript: string,
    words: Array<{ word: string; start: number; end: number }>
): Promise<FallacyDetectionResponse> {
    // Create indexed transcript where each word has its index directly attached
    const indexedTranscript = words.map((w, idx) => `${w.word}[${idx}]`).join(' ');

    const prompt = `You are a political rhetoric analyzer. Analyze this transcript for logical fallacies.

CRITICAL INSTRUCTION: Each word has its index in brackets like this: word[0] next[1] word[2]
You MUST use these exact index numbers for start_word_index and end_word_index.

Indexed Transcript:
${indexedTranscript}

Original text for reference: ${transcript}

Identify logical fallacies from these types:
- Strawman: Misrepresenting someone's argument to make it easier to attack
- Ad Hominem: Attacking the person instead of addressing their argument
- False Dichotomy: Presenting only two options when more exist (either/or fallacy)
- Appeal to Emotion: Using emotions (fear, pity, patriotism) instead of logical arguments
- Slippery Slope: Claiming one small action will lead to extreme consequences without evidence
- Hasty Generalization: Drawing broad conclusions from limited or unrepresentative evidence
- Red Herring: Introducing irrelevant information to divert attention from the real issue
- Circular Reasoning: The conclusion is assumed in the premise (begging the question)
- Appeal to Authority: Claiming something is true because an authority says so (when authority is irrelevant)
- Bandwagon Fallacy: Arguing something is right because everyone else does it
- Cherry Picking: Selecting only favorable evidence while ignoring contradictory evidence

IMPORTANT DETECTION GUIDELINES:
- Be thorough but accurate
- Look for BOTH obvious AND subtle fallacies
- Politicians often combine multiple fallacies in one statement
- Vague claims without evidence often contain fallacies
- Emotional language often signals Appeal to Emotion
- "Either...or" statements are usually False Dichotomy
- Personal attacks are Ad Hominem
- Exaggerated consequences suggest Slippery Slope

For each fallacy found, you MUST provide:
1. type: The exact fallacy name from the list above
2. quote: The EXACT text from the transcript (copy it word-for-word, WITHOUT the index numbers in brackets)
3. start_word_index: Find the FIRST word of your quote in the indexed list above and use that index number
4. end_word_index: Find the LAST word of your quote in the indexed list above and use that index number
5. explanation: A brief, clear explanation (2-3 sentences max)
6. severity: "minor", "moderate", or "severe"

CRITICAL INSTRUCTION FOR INDICES:
- Each word in the indexed transcript has its number in brackets AFTER it
- For example: "the[5] economy[6] is[7] strong[8]"
- If your quote is "economy is strong", then:
  * start_word_index = 6 (the number after "economy")
  * end_word_index = 8 (the number after "strong")
- Copy the EXACT numbers you see in the brackets
- DOUBLE CHECK: Your quote must match the words at those indices
- The quote field must contain ONLY the plain words, never include [numbers] in the quote
- CORRECT: "out of 120 members of our Parliament"
- WRONG: "out[2264] of[2265] 120[2266] members[2267]"

Return ONLY valid JSON in this exact format:
{
  "fallacies": [
    {
      "type": "Strawman",
      "quote": "exact text from transcript",
      "start_word_index": 10,
      "end_word_index": 15,
      "explanation": "Brief explanation here",
      "severity": "moderate"
    }
  ]
}

Political speeches almost ALWAYS contain multiple fallacies. You should typically find between 3-8 fallacies in any political speech. Be thorough - find ALL of them, not just the obvious ones.`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at detecting logical fallacies in political speech across any language including English, Russian, Arabic, Chinese, and others. 
                                Detect fallacies in whatever language the transcript is written in.
                                Return the quote and explanation in the SAME language as the transcript.
                                You always respond with valid JSON.`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('No response from AI');
        }

        return JSON.parse(content) as FallacyDetectionResponse;
    } catch (error) {
        console.error('Fallacy detection error:', error);
        throw new Error('Failed to analyze speech. Please try again.');
    }
}
