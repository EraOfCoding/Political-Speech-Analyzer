import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function findWordAtTime(words: Array<{ word: string; start: number; end: number }>, time: number): number {
  return words.findIndex((w, idx) => {
    return w.start <= time && (w.end >= time || (words[idx + 1] && words[idx + 1].start > time));
  });
}
