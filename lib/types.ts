export interface Word {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptSegment {
  text: string;
  words: Word[];
}

export interface Fallacy {
  type: string;
  quote: string;
  startWordIndex: number;
  endWordIndex: number;
  explanation: string;
  severity: 'minor' | 'moderate' | 'severe';
}

export interface AnalysisData {
  transcript: TranscriptSegment;
  fallacies: Fallacy[];
}

export interface WhisperResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  words: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

export interface FallacyDetectionResponse {
  fallacies: Array<{
    type: string;
    quote: string;
    start_word_index: number;
    end_word_index: number;
    explanation: string;
    severity: 'minor' | 'moderate' | 'severe';
  }>;
}
