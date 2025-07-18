import { AiInsight } from './types';
import { OPENAI_API_KEY } from './constants';

// Analyze news article sentiment and topics
export const analyzeArticle = async (articleContent: string): Promise<{ 
  sentiment: 'positive' | 'negative' | 'neutral', 
  topics: string[],
  summary: string
}> => {
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: articleContent }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze article');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing article:', error);
    return {
      sentiment: 'neutral',
      topics: [],
      summary: ''
    };
  }
};

// Check if article might contain misinformation
export const factCheck = async (claim: string): Promise<{
  isReliable: boolean,
  confidence: number,
  explanation: string
}> => {
  try {
    const response = await fetch('/api/ai/factcheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim }),
    });

    if (!response.ok) {
      throw new Error('Failed to fact check claim');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fact checking claim:', error);
    return {
      isReliable: true,
      confidence: 0.5,
      explanation: 'Unable to verify claim'
    };
  }
};

// Generate insights from recent news
export const generateInsights = async (): Promise<AiInsight[]> => {
  try {
    const response = await fetch('/api/ai/insights', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate insights');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
};

// Generate a crossword puzzle from news headlines
export const generateCrossword = async (difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<any> => {
  try {
    const response = await fetch(`/api/ai/crossword?difficulty=${difficulty}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate crossword');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating crossword:', error);
    return null;
  }
};
