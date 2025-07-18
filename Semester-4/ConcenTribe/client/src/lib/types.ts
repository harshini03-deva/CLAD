export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  category: Category;
  estimatedReadingTime: number;
}

export type Category = 
  | 'home' 
  | 'india' 
  | 'world' 
  | 'health' 
  | 'technology' 
  | 'business' 
  | 'entertainment'
  | 'sports'
  | 'science';

export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  googleId?: string;
  preferences: UserPreferences;
  bookmarks: Bookmark[];
  badges: Badge[];
  streaks: number;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  backgroundColor: string;
  description: string;
  dateEarned: string;
}

export interface Bookmark {
  articleId: string;
  addedAt: string;
}

export interface UserPreferences {
  interests: Interest[];
  sources: NewsSource[];
  formats: ContentFormat[];
  focusDuration: number;
}

export type Interest = 
  | 'education'
  | 'lifestyle'
  | 'technology'
  | 'politics'
  | 'sports'
  | 'health'
  | 'business'
  | 'entertainment';

export type NewsSource = 
  | 'bbc'
  | 'cnn'
  | 'reuters'
  | 'aljazeera'
  | 'toi'
  | 'guardian'
  | 'foxnews'
  | 'techcrunch'
  | 'wired'
  | 'bloomberg'
  | 'forbes'
  | 'wsj'
  | 'espn'
  | 'skysports';

export type ContentFormat = 
  | 'text'
  | 'video'
  | 'podcast'
  | 'social';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number;
  icon: string;
  externalUrl?: string;
}

export interface Riddle {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TongueTwister {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SudokuCell {
  value: number | null;
  isOriginal: boolean;
  isValid?: boolean;
}

export type SudokuGrid = SudokuCell[][];

export interface CrosswordCell {
  letter: string;
  clueNumber?: number;
  isBlack: boolean;
  isHighlighted: boolean;
}

export interface CrosswordClue {
  number: number;
  text: string;
  orientation: 'across' | 'down';
  answer: string;
  relatedArticleId?: string;
}

export interface CrosswordPuzzle {
  grid: CrosswordCell[][];
  clues: CrosswordClue[];
  size: number;
}

export interface AiInsight {
  id: string;
  type: 'trend' | 'factCheck' | 'analysis';
  title: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  relatedArticles: string[];
  category?: Category;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[];
}
