export type ViewState = 'AUTH' | 'HOME' | 'GAMES' | 'DIFFICULTY' | 'QUIZ' | 'LEADERBOARD' | 'LEARN';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Question {
  id: number;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  bibleVerse?: string;
  sources?: GroundingSource[]; // Added sources for grounded questions
}

export interface FactCheckResult {
  text: string;
  sources: GroundingSource[];
  isLoading: boolean;
}

export interface HintResult {
  text: string;
  sources: GroundingSource[];
  isLoading: boolean;
}

export interface LiveFact {
  fact: string;
  source?: GroundingSource;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  isUser?: boolean;
}

export interface UserStats {
  score: number;
  streak: number;
  rank: number;
  name: string;
}

export interface LearnContent {
  category: 'Scripture' | 'Tradition' | 'History';
  title: string;
  description: string;
  details: string; // Detailed educational content
  reference?: string; // e.g. "Isaiah 9:6"
}