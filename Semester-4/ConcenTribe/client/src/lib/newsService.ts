import { Article, Category, NewsApiResponse, NewsApiArticle } from './types';
import { NEWS_API_KEY } from './constants';

const API_URL = 'https://newsapi.org/v2';

// Helper to estimate reading time based on content length
const estimateReadingTime = (text: string): number => {
  if (!text) return 1;
  // Average reading speed: 200 words per minute
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

// Convert NewsAPI article to our Article format
const mapNewsApiArticle = (article: NewsApiArticle, category: Category): Article => {
  return {
    id: Buffer.from(article.url).toString('base64'),
    title: article.title,
    description: article.description || '',
    content: article.content || '',
    url: article.url,
    image: article.urlToImage || '',
    publishedAt: article.publishedAt,
    source: article.source,
    category,
    estimatedReadingTime: estimateReadingTime(article.content || '')
  };
};

// Fetch headlines by category
export const fetchNewsByCategory = async (category: Category, page = 1, pageSize = 10): Promise<Article[]> => {
  try {
    // For home category, use top headlines without category filter
    const endpoint = category === 'home' 
      ? `${API_URL}/top-headlines?country=in&pageSize=${pageSize}&page=${page}`
      : `${API_URL}/top-headlines?country=in&category=${category}&pageSize=${pageSize}&page=${page}`;
    
    const response = await fetch(`${endpoint}&apiKey=${NEWS_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    const data: NewsApiResponse = await response.json();
    return data.articles.map(article => mapNewsApiArticle(article, category));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Search news articles
export const searchNews = async (query: string, page = 1, pageSize = 10): Promise<{ articles: Article[], hasMore: boolean }> => {
  try {
    const endpoint = `/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${pageSize}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching news:', error);
    return { articles: [], hasMore: false };
  }
};

// Fetch article by ID
export const fetchArticleById = async (id: string): Promise<Article | null> => {
  try {
    // Fetch from the API
    const response = await fetch(`/api/news/article/${id}`);
    
    if (!response.ok) {
      throw new Error(`Article API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};

// Fetch personalized news based on user preferences
export const fetchPersonalizedNews = async (interests: string[], sources: string[]): Promise<{ articles: Article[], hasMore: boolean }> => {
  try {
    // Build the query parameters
    const queryParams = new URLSearchParams();
    
    if (interests && interests.length > 0) {
      interests.forEach(interest => queryParams.append('interests', interest));
    }
    
    if (sources && sources.length > 0) {
      sources.forEach(source => queryParams.append('sources', source));
    }
    
    // Fetch personalized news from our API
    const endpoint = `/api/news/personalized?${queryParams.toString()}`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Personalized news API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching personalized news:', error);
    return { articles: [], hasMore: false };
  }
};
