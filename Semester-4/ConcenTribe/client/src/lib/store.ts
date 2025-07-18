import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Article, User, UserPreferences, Badge, Bookmark } from './types';
import { AVAILABLE_BADGES } from './constants';

// Main user store
interface UserState {
  user: User;
  preferences: UserPreferences;
  bookmarks: Bookmark[];
  badges: Badge[];
  streaks: number;
  lastVisit: string | null;
  
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  addBadge: (badgeId: string) => void;
  updateUser: (userData: Partial<User>) => void;
  incrementStreak: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null as any, // Start with null user (not authenticated)
      preferences: {
        interests: [],
        sources: [],
        formats: [],
        focusDuration: 20
      },
      bookmarks: [],
      badges: [],
      streaks: 0,
      lastVisit: null,
      
      updatePreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),
      
      addBadge: (badgeId) => set((state) => {
        // Check if badge already exists
        if (state.badges.some(badge => badge.id === badgeId)) {
          return state;
        }
        
        // Find badge definition
        const badgeToAdd = AVAILABLE_BADGES.find(badge => badge.id === badgeId);
        if (!badgeToAdd) return state;
        
        // Add new badge with current date
        const newBadge = {
          ...badgeToAdd,
          dateEarned: new Date().toISOString()
        };
        
        return { badges: [...state.badges, newBadge] };
      }),
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
      
      incrementStreak: () => set((state) => {
        const today = new Date().toDateString();
        const lastVisitDate = state.lastVisit ? new Date(state.lastVisit).toDateString() : null;
        
        // If last visit was yesterday, increment streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (lastVisitDate === yesterdayString) {
          // If streak reaches 7, award badge
          const newStreaks = state.streaks + 1;
          if (newStreaks % 7 === 0) {
            setTimeout(() => {
              useUserStore.getState().addBadge('daily-streak');
            }, 0);
          }
          
          return { 
            streaks: newStreaks,
            lastVisit: today
          };
        } 
        // If last visit was today, do nothing
        else if (lastVisitDate === today) {
          return state;
        } 
        // Otherwise reset streak
        else {
          return { 
            streaks: 1,
            lastVisit: today
          };
        }
      })
    }),
    {
      name: 'concentribe-user-storage'
    }
  )
);

// Theme store
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    {
      name: 'concentribe-theme-storage'
    }
  )
);

// Focus mode store
interface FocusModeState {
  isFocusModeOpen: boolean;
  focusSession: {
    active: boolean;
    startTime: string | null;
    duration: number;
    articles: Article[];
  };
  
  toggleFocusMode: () => void;
  startFocusSession: (duration: number) => void;
  endFocusSession: (completed: boolean) => void;
}

export const useFocusMode = create<FocusModeState>((set, get) => ({
  isFocusModeOpen: false,
  focusSession: {
    active: false,
    startTime: null,
    duration: 20,
    articles: []
  },
  
  toggleFocusMode: () => set((state) => ({ 
    isFocusModeOpen: !state.isFocusModeOpen 
  })),
  
  startFocusSession: async (duration) => {
    try {
      // Fetch personalized articles based on user preferences
      const response = await fetch('/api/focus/articles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch personalized articles');
      }
      
      const articles = await response.json();
      
      set({
        focusSession: {
          active: true,
          startTime: new Date().toISOString(),
          duration: duration,
          articles: articles
        }
      });
    } catch (error) {
      console.error('Error starting focus session:', error);
      // Fallback to empty articles list
      set({
        focusSession: {
          active: true,
          startTime: new Date().toISOString(),
          duration: duration,
          articles: []
        }
      });
    }
  },
  
  endFocusSession: (completed) => {
    // If session was completed successfully, award badge
    if (completed) {
      setTimeout(() => {
        useUserStore.getState().addBadge('focus-champion');
      }, 0);
    }
    
    set({
      focusSession: {
        active: false,
        startTime: null,
        duration: 20,
        articles: []
      }
    });
  }
}));

// Bookmarks store
interface BookmarksState {
  bookmarks: Article[];
  isBookmarked: (articleId: string) => boolean;
  toggleBookmark: (article: Article) => void;
  getBookmarks: () => Article[];
}

export const useBookmarks = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      
      isBookmarked: (articleId) => {
        return get().bookmarks.some(bookmark => bookmark.id === articleId);
      },
      
      toggleBookmark: (article) => set((state) => {
        const isAlreadyBookmarked = state.bookmarks.some(bookmark => bookmark.id === article.id);
        
        if (isAlreadyBookmarked) {
          return {
            bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== article.id)
          };
        } else {
          return {
            bookmarks: [...state.bookmarks, article]
          };
        }
      }),
      
      getBookmarks: () => get().bookmarks
    }),
    {
      name: 'concentribe-bookmarks-storage'
    }
  )
);

// Text-to-speech store
interface TextToSpeechState {
  isSpeaking: boolean;
  currentText: string | null;
  startSpeech: (text: string) => void;
  stopSpeech: () => void;
}

export const useTextToSpeech = create<TextToSpeechState>((set) => ({
  isSpeaking: false,
  currentText: null,
  
  startSpeech: (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set up event handlers
    utterance.onend = () => {
      set({ isSpeaking: false, currentText: null });
    };
    
    utterance.onerror = () => {
      set({ isSpeaking: false, currentText: null });
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    set({ isSpeaking: true, currentText: text });
  },
  
  stopSpeech: () => {
    window.speechSynthesis.cancel();
    set({ isSpeaking: false, currentText: null });
  }
}));
