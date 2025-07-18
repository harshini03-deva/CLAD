import { Category, Interest, NewsSource, ContentFormat, Challenge, Badge } from './types';

export const APP_NAME = 'ConcenTribe';

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'india', label: 'India', icon: 'flag' },
  { id: 'world', label: 'World', icon: 'public' },
  { id: 'health', label: 'Health', icon: 'local_hospital' },
  { id: 'technology', label: 'Technology', icon: 'devices' },
  { id: 'business', label: 'Business', icon: 'business' },
  { id: 'entertainment', label: 'Entertainment', icon: 'theaters' },
  { id: 'sports', label: 'Sports', icon: 'sports_basketball' },
  { id: 'science', label: 'Science', icon: 'science' }
];

export const INTERESTS: { id: Interest; label: string }[] = [
  { id: 'education', label: 'Education' },
  { id: 'lifestyle', label: 'Lifestyle & Travel' },
  { id: 'technology', label: 'Technology' },
  { id: 'politics', label: 'Politics' },
  { id: 'sports', label: 'Sports' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'business', label: 'Business & Economy' },
  { id: 'entertainment', label: 'Entertainment' }
];

export const NEWS_SOURCES: { id: NewsSource; label: string }[] = [
  { id: 'bbc', label: 'BBC' },
  { id: 'cnn', label: 'CNN' },
  { id: 'reuters', label: 'Reuters' },
  { id: 'aljazeera', label: 'Al Jazeera' },
  { id: 'toi', label: 'The Times of India' },
  { id: 'guardian', label: 'The Guardian' },
  { id: 'foxnews', label: 'Fox News' },
  { id: 'techcrunch', label: 'TechCrunch' },
  { id: 'wired', label: 'Wired' },
  { id: 'bloomberg', label: 'Bloomberg' },
  { id: 'forbes', label: 'Forbes' },
  { id: 'wsj', label: 'The Wall Street Journal' },
  { id: 'espn', label: 'ESPN' },
  { id: 'skysports', label: 'Sky Sports' }
];

export const CONTENT_FORMATS: { id: ContentFormat; label: string; description: string }[] = [
  { 
    id: 'text', 
    label: 'Text-Based Articles', 
    description: 'Traditional news articles from newspapers and online sources' 
  },
  { 
    id: 'video', 
    label: 'Video News', 
    description: 'News videos from YouTube channels and live broadcasts' 
  },
  { 
    id: 'podcast', 
    label: 'Podcast/Audio', 
    description: 'News podcasts from Spotify, Apple Podcasts, and NPR' 
  },
  { 
    id: 'social', 
    label: 'Social Media Feeds', 
    description: 'Trending news from Twitter, Reddit, and LinkedIn' 
  }
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'ai-learn',
    title: 'Learn about AI trends',
    description: 'Spend 10 minutes exploring the latest in artificial intelligence',
    duration: 10,
    icon: 'flash_on',
    externalUrl: 'https://news.google.com/search?q=artificial%20intelligence&hl=en-US'
  },
  {
    id: 'global-update',
    title: 'Global news update',
    description: 'Stay informed with a 5-minute briefing on world events',
    duration: 5,
    icon: 'public',
    externalUrl: 'https://www.bbc.com/news/world'
  },
  {
    id: 'health-digest',
    title: 'Health news digest',
    description: 'Learn about the latest health research in just 8 minutes',
    duration: 8,
    icon: 'fitness_center',
    externalUrl: 'https://www.who.int/news-room'
  }
];

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'focus-champion',
    title: 'Focus Champion',
    icon: 'military_tech',
    backgroundColor: '#fbbc04', // warning yellow
    description: 'Completed 5 focus sessions without interruption',
    dateEarned: ''
  },
  {
    id: 'news-explorer',
    title: 'News Explorer',
    icon: 'explore',
    backgroundColor: '#1a73e8', // primary blue
    description: 'Read articles from 10 different categories',
    dateEarned: ''
  },
  {
    id: 'daily-streak',
    title: 'Daily Streak',
    icon: 'local_fire_department',
    backgroundColor: '#34a853', // secondary green
    description: 'Visited the site for 7 consecutive days',
    dateEarned: ''
  },
  {
    id: 'puzzle-master',
    title: 'Puzzle Master',
    icon: 'extension',
    backgroundColor: '#9c27b0', // purple
    description: 'Completed 10 mind games successfully',
    dateEarned: ''
  }
];

export const GAMES = [
  {
    id: 'riddles',
    title: 'Riddles',
    description: 'Challenge your mind with brain-teasing riddles updated daily.',
    icon: 'lightbulb',
    color: 'yellow'
  },
  {
    id: 'tongue-twisters',
    title: 'Tongue Twisters',
    description: 'Put your pronunciation skills to the test with challenging phrases.',
    icon: 'record_voice_over',
    color: 'blue'
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Test your logical thinking with puzzles of varying difficulty.',
    icon: 'grid_view',
    color: 'green'
  },
  {
    id: 'crossword',
    title: 'News Crossword',
    description: 'Daily crosswords based on current events and trending topics.',
    icon: 'extension',
    color: 'purple'
  }
];

export const API_BASE_URL = '/api';
export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
