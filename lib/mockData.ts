// Mock data for testing the UI without making API calls
// To use: import this file and use the mock data instead of API calls

export const MOCK_TRANSCRIPT = {
  text: "My opponent claims they support working families, but their voting record tells a different story. They voted against raising the minimum wage five times. Either you're with the workers or you're against them. There's no middle ground. If we allow this policy to pass, it will destroy our economy and lead to total chaos. The facts are clear: crime is up 50%, unemployment is skyrocketing, and our schools are failing. My opponent is a career politician who doesn't understand real people. They grew up with a silver spoon and never worked a day in their life. This policy worked in one town, so it will work everywhere. Anyone who disagrees with this common sense approach is simply wrong.",
  words: [
    { word: "My", start: 0.0, end: 0.2 },
    { word: "opponent", start: 0.2, end: 0.6 },
    { word: "claims", start: 0.6, end: 0.9 },
    { word: "they", start: 0.9, end: 1.1 },
    { word: "support", start: 1.1, end: 1.5 },
    { word: "working", start: 1.5, end: 1.9 },
    { word: "families,", start: 1.9, end: 2.4 },
    { word: "but", start: 2.5, end: 2.7 },
    { word: "their", start: 2.7, end: 2.9 },
    { word: "voting", start: 2.9, end: 3.2 },
    { word: "record", start: 3.2, end: 3.6 },
    { word: "tells", start: 3.6, end: 3.9 },
    { word: "a", start: 3.9, end: 4.0 },
    { word: "different", start: 4.0, end: 4.5 },
    { word: "story.", start: 4.5, end: 5.0 },
    { word: "They", start: 5.2, end: 5.4 },
    { word: "voted", start: 5.4, end: 5.8 },
    { word: "against", start: 5.8, end: 6.2 },
    { word: "raising", start: 6.2, end: 6.6 },
    { word: "the", start: 6.6, end: 6.8 },
    { word: "minimum", start: 6.8, end: 7.2 },
    { word: "wage", start: 7.2, end: 7.5 },
    { word: "five", start: 7.5, end: 7.8 },
    { word: "times.", start: 7.8, end: 8.3 },
    { word: "Either", start: 8.5, end: 8.9 },
    { word: "you're", start: 8.9, end: 9.2 },
    { word: "with", start: 9.2, end: 9.4 },
    { word: "the", start: 9.4, end: 9.6 },
    { word: "workers", start: 9.6, end: 10.1 },
    { word: "or", start: 10.1, end: 10.3 },
    { word: "you're", start: 10.3, end: 10.6 },
    { word: "against", start: 10.6, end: 11.0 },
    { word: "them.", start: 11.0, end: 11.4 },
    { word: "There's", start: 11.5, end: 11.9 },
    { word: "no", start: 11.9, end: 12.1 },
    { word: "middle", start: 12.1, end: 12.5 },
    { word: "ground.", start: 12.5, end: 13.0 },
    { word: "If", start: 13.2, end: 13.4 },
    { word: "we", start: 13.4, end: 13.6 },
    { word: "allow", start: 13.6, end: 13.9 },
    { word: "this", start: 13.9, end: 14.1 },
    { word: "policy", start: 14.1, end: 14.5 },
    { word: "to", start: 14.5, end: 14.7 },
    { word: "pass,", start: 14.7, end: 15.1 },
    { word: "it", start: 15.2, end: 15.3 },
    { word: "will", start: 15.3, end: 15.6 },
    { word: "destroy", start: 15.6, end: 16.1 },
    { word: "our", start: 16.1, end: 16.3 },
    { word: "economy", start: 16.3, end: 16.8 },
    { word: "and", start: 16.9, end: 17.1 },
    { word: "lead", start: 17.1, end: 17.4 },
    { word: "to", start: 17.4, end: 17.6 },
    { word: "total", start: 17.6, end: 17.9 },
    { word: "chaos.", start: 17.9, end: 18.4 },
  ],
};

export const MOCK_FALLACIES = [
  {
    type: "Strawman",
    quote: "My opponent claims they support working families, but their voting record tells a different story",
    startWordIndex: 0,
    endWordIndex: 14,
    explanation: "This misrepresents the opponent's position by oversimplifying their stance on working families and ignoring the complexity of voting records.",
    severity: "moderate" as const,
  },
  {
    type: "False Dichotomy",
    quote: "Either you're with the workers or you're against them. There's no middle ground",
    startWordIndex: 24,
    endWordIndex: 36,
    explanation: "This presents only two extreme options when there are actually many nuanced positions one could take on labor policy.",
    severity: "severe" as const,
  },
  {
    type: "Slippery Slope",
    quote: "If we allow this policy to pass, it will destroy our economy and lead to total chaos",
    startWordIndex: 37,
    endWordIndex: 53,
    explanation: "This assumes that allowing the policy will inevitably lead to extreme negative consequences without providing evidence for this causal chain.",
    severity: "moderate" as const,
  },
];

export const MOCK_ANALYSIS_DATA = {
  transcript: MOCK_TRANSCRIPT,
  fallacies: MOCK_FALLACIES,
};

// Instructions for using mock data:
// 1. In VideoUpload.tsx, comment out the API calls
// 2. Import MOCK_ANALYSIS_DATA from this file
// 3. Use it directly instead of calling processVideo()
// 4. Example:
//
// import { MOCK_ANALYSIS_DATA } from '@/lib/mockData';
//
// const processVideo = async () => {
//   setIsProcessing(true);
//   setTimeout(() => {
//     sessionStorage.setItem('analysisData', JSON.stringify(MOCK_ANALYSIS_DATA));
//     sessionStorage.setItem('videoUrl', URL.createObjectURL(file));
//     router.push('/analysis');
//   }, 2000);
// };
