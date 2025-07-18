import axios from 'axios';
import { Article } from '@/lib/types';
import { storage } from '../storage';

// Use NEWS_API_KEY from environment variables
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const API_URL = 'https://newsapi.org/v2';

// Helper to estimate reading time
export const estimateReadingTime = (text: string): number => {
  if (!text) return 1;
  // Average reading speed: 200 words per minute
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

// Convert NewsAPI article to our Article format
const mapNewsApiArticle = (article: any, category: string): Article => {
  // Generate a more detailed description if missing
  let description = article.description;
  if (!description || description.length < 10) {
    // Create a description from the title and content
    if (article.content && article.content.length > 20) {
      // Use first 150 chars of content as description
      description = article.content.substring(0, 150).replace(/\[\+\d+ chars\]$/, '') + '...';
    } else {
      // Use title as description
      description = `${article.title}. Read the full article for more details.`;
    }
  }
  
  return {
    id: Buffer.from(article.url).toString('base64'),
    title: article.title,
    description: description,
    content: article.content || '',
    url: article.url,
    image: article.urlToImage || '',
    publishedAt: article.publishedAt,
    source: article.source,
    category,
    estimatedReadingTime: estimateReadingTime(article.content || '')
  };
};

// Load articles from storage (a caching mechanism)
const loadArticlesFromStorage = async (category: string, limit: number): Promise<Article[]> => {
  try {
    const { articles } = await storage.getArticlesByCategory(category, 1, limit);
    if (articles.length > 0) {
      console.log(`Loaded ${articles.length} cached articles for ${category} from storage`);
      return articles.map(article => ({
        id: article.apiId,
        title: article.title,
        description: article.description || '',
        content: article.content || '',
        url: article.url,
        image: article.imageUrl || '',
        publishedAt: article.publishedAt.toISOString(),
        source: {
          id: article.sourceId || null,
          name: article.sourceName
        },
        category: article.category,
        estimatedReadingTime: article.estimatedReadingTime || 3
      }));
    }
  } catch (err) {
    console.error('Error loading articles from storage:', err);
  }
  return [];
};

// Fetch news articles by category
export const fetchNewsArticles = async (
  category: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ articles: Article[], hasMore: boolean }> => {
  try {
    // Always try to fetch from API first to get the latest articles
    // For home category, use top headlines without category filter
    const endpoint = category === 'home' 
      ? `${API_URL}/top-headlines?country=us&pageSize=${pageSize}&page=${page}`
      : `${API_URL}/top-headlines?country=us&category=${category}&pageSize=${pageSize}&page=${page}`;
    
    console.log(`Fetching news from: ${endpoint}&apiKey=[HIDDEN]`);
    console.log(`Using NEWS_API_KEY: ${NEWS_API_KEY ? 'Available' : 'Missing'}`);
    
    const response = await axios.get(`${endpoint}&apiKey=${NEWS_API_KEY}`);
    
    if (response.status !== 200) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    console.log(`News API response: Status ${response.status}, Total results: ${response.data.totalResults}, Articles: ${response.data.articles.length}`);
    
    const data = response.data;
    const mappedArticles = data.articles.map((article: any) => mapNewsApiArticle(article, category));
    
    // If we got articles from the API, return them
    if (mappedArticles.length > 0) {
      return {
        articles: mappedArticles,
        hasMore: data.totalResults > page * pageSize
      };
    } else {
      // If the API returned no articles, fall back to cached content
      console.log(`No articles returned from API for ${category}, trying cached content`);
      throw new Error('No articles returned from News API');
    }
  } catch (error) {
    console.error('Error fetching news from API:', error);
    
    // On error, try to get cached articles from storage
    console.log('Falling back to cached articles');
    const cachedArticles = await loadArticlesFromStorage(category, pageSize);
    if (cachedArticles.length > 0) {
      console.log(`Using ${cachedArticles.length} cached articles for ${category}`);
      return { 
        articles: cachedArticles, 
        hasMore: false // Disable pagination for cached articles
      };
    }
    
    // If no cached articles either, return empty array
    return {
      articles: [],
      hasMore: false
    };
  }
};

// Search news articles
export const searchNewsArticles = async (
  query: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ articles: Article[], hasMore: boolean }> => {
  try {
    const endpoint = `${API_URL}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&page=${page}&sortBy=relevancy`;
    
    console.log(`Searching news from: ${endpoint}&apiKey=[HIDDEN]`);
    console.log(`Using NEWS_API_KEY: ${NEWS_API_KEY ? 'Available' : 'Missing'}`);
    
    const response = await axios.get(`${endpoint}&apiKey=${NEWS_API_KEY}`);
    
    if (response.status !== 200) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    console.log(`News API search response: Status ${response.status}, Total results: ${response.data.totalResults}, Articles: ${response.data.articles.length}`);
    
    const data = response.data;
    const mappedArticles = data.articles.map((article: any) => mapNewsApiArticle(article, 'home'));
    
    // If we got articles from the API, return them
    if (mappedArticles.length > 0) {
      return {
        articles: mappedArticles,
        hasMore: data.totalResults > page * pageSize
      };
    } else {
      // If the API returned no articles, throw an error
      console.log(`No articles returned from API for search query "${query}"`);
      throw new Error('No articles returned from News API for search');
    }
  } catch (error) {
    console.error('Error searching news:', error);
    
    // For search, since we don't have a way to cache searches, just return empty array
    return {
      articles: [],
      hasMore: false
    };
  }
};

// Fetch article by ID
export const fetchArticleById = async (id: string): Promise<Article | null> => {
  try {
    console.log(`Fetching article with ID: ${id}`);
    
    // Try to get the URL from the ID
    let articleUrl = "";
    try {
      articleUrl = Buffer.from(id, 'base64').toString();
      console.log(`Decoded article URL: ${articleUrl}`);
    } catch (error) {
      console.error('Error decoding article ID:', error);
    }
    
    // First try to fetch from API if we have a valid URL
    if (articleUrl) {
      try {
        // Try to use the 'everything' endpoint with the exact URL for better match
        console.log(`Searching for exact article URL: ${articleUrl}`);
        const { articles } = await searchNewsArticles(articleUrl, 1, 1);
        
        if (articles.length > 0) {
          console.log('Found article via URL search in API');
          
          // Save article to database for future retrieval
          try {
            await storage.createArticle({
              apiId: id,
              title: articles[0].title,
              description: articles[0].description,
              content: articles[0].content,
              url: articles[0].url,
              imageUrl: articles[0].image,
              publishedAt: new Date(articles[0].publishedAt),
              sourceId: articles[0].source.id,
              sourceName: articles[0].source.name,
              category: articles[0].category,
              estimatedReadingTime: articles[0].estimatedReadingTime
            });
            console.log('Saved fresh article to database');
          } catch (saveError) {
            console.error('Error saving article to database:', saveError);
          }
          
          return articles[0];
        }
      } catch (apiError) {
        console.error('Error fetching from API:', apiError);
      }
    }
    
    // If API fetch failed, check if we have it in the database
    const articleFromDb = await storage.getArticleByApiId(id);
    if (articleFromDb) {
      console.log('Found article in database');
      return {
        id,
        title: articleFromDb.title,
        description: articleFromDb.description || '',
        content: articleFromDb.content || '',
        url: articleFromDb.url,
        image: articleFromDb.imageUrl || '',
        publishedAt: articleFromDb.publishedAt.toISOString(),
        source: {
          id: articleFromDb.sourceId || null,
          name: articleFromDb.sourceName
        },
        category: articleFromDb.category,
        estimatedReadingTime: articleFromDb.estimatedReadingTime
      };
    }
    
    // If not in DB or API fetch above failed, try other approaches
    try {
      // Skip if we already tried decoding the URL above
      if (!articleUrl) {
        articleUrl = Buffer.from(id, 'base64').toString();
        console.log(`Decoded article URL: ${articleUrl}`);
      }
      
      // Extract domain to guess the category
      const domain = new URL(articleUrl).hostname;
      
      // Simple category mapping based on domain
      let category: string = 'home';
      if (domain.includes('tech') || domain.includes('wired')) category = 'technology';
      else if (domain.includes('health')) category = 'health';
      else if (domain.includes('sport')) category = 'sports';
      else if (domain.includes('business') || domain.includes('finance')) category = 'business';

      // If exact URL search fails, try searching by title from other endpoints
      // This can happen when URL structures don't match exactly
      console.log('Exact URL search failed, trying to search by title parts');
      
      // Get the title from the pathname
      const pathParts = new URL(articleUrl).pathname.split('/');
      const titlePart = pathParts[pathParts.length - 1].replace(/-/g, ' ');
      
      if (titlePart && titlePart.length > 5) {
        const { articles: titleSearchArticles } = await searchNewsArticles(titlePart, 1, 3);
        
        if (titleSearchArticles.length > 0) {
          console.log('Found article via title search');
          
          // Save article to database for future retrieval
          try {
            await storage.createArticle({
              apiId: id,
              title: titleSearchArticles[0].title,
              description: titleSearchArticles[0].description,
              content: titleSearchArticles[0].content,
              url: titleSearchArticles[0].url,
              imageUrl: titleSearchArticles[0].image,
              publishedAt: new Date(titleSearchArticles[0].publishedAt),
              sourceId: titleSearchArticles[0].source.id,
              sourceName: titleSearchArticles[0].source.name,
              category: titleSearchArticles[0].category,
              estimatedReadingTime: titleSearchArticles[0].estimatedReadingTime
            });
            console.log('Saved article to database');
          } catch (saveError) {
            console.error('Error saving article to database:', saveError);
          }
          
          return titleSearchArticles[0];
        }
      }
      
      // Fallback: Create a basic article with the available information
      console.log('No article found via API, creating basic article from URL');
      const title = titlePart ? titlePart.charAt(0).toUpperCase() + titlePart.slice(1) : 'Article';
      
      // Create a proper description from the title
      const description = `${title}. This appears to be an article from ${domain}. ` +
        `The article is about ${titlePart.split('-').join(' ')}. ` +
        `Click "Read full article" to see the original content.`;
        
      return {
        id,
        title,
        description: description,
        content: 'This article content is not available. Click "Read full article" to view the original article.',
        url: articleUrl,
        image: '',
        publishedAt: new Date().toISOString(),
        source: {
          id: null,
          name: domain
        },
        category,
        estimatedReadingTime: 1
      };
    } catch (error) {
      console.error('Error decoding article ID:', error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};
