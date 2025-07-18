import axios from "axios";
import { YouTubeVideo } from "../../shared/schema";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const API_URL = "https://www.googleapis.com/youtube/v3";

/**
 * Search for YouTube videos based on provided query
 */
export const searchYouTubeVideos = async (
  query: string, 
  maxResults: number = 5
): Promise<YouTubeVideo[]> => {
  try {
    console.log(`Searching YouTube for: ${query}, using API key: ${YOUTUBE_API_KEY ? 'Available' : 'Missing'}`);
    
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    console.log(`YouTube API response: Status ${response.status}, Found ${response.data.items.length} videos`);
    
    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      tags: []
    }));
  } catch (error: any) {
    console.error('Error searching YouTube videos:', error.message);
    
    if (error.response) {
      console.error('YouTube API error response:', error.response.data);
    }
    
    // Return empty array for graceful failure
    return [];
  }
};

/**
 * Get YouTube videos based on provided category/interest
 */
export const getYouTubeVideosByCategory = async (
  category: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> => {
  // Convert category to search query
  let searchQuery = category;
  
  // Add "news" to the query to get more relevant content
  if (!category.includes('news')) {
    searchQuery = `${category} news`;
  }
  
  return searchYouTubeVideos(searchQuery, maxResults);
};

/**
 * Get YouTube videos for focus mode based on interests
 */
export const getFocusModeVideos = async (
  interests: string[] = ["technology", "science", "health"],
  sources: string[] = [],
  maxResults: number = 10
): Promise<YouTubeVideo[]> => {
  try {
    let allVideos: YouTubeVideo[] = [];
    const uniqueVideos = new Map<string, YouTubeVideo>();
    
    // Process each interest to create more specific search queries
    for (const interest of interests) {
      // Create different variations of search queries for better matching
      const searchQueries = [
        `${interest} news`,
        `latest ${interest} news`,
        `${interest} updates`
      ];
      
      // Try to match interest with news sources for more targeted results
      if (sources && sources.length > 0) {
        for (const source of sources) {
          searchQueries.push(`${interest} ${source} news`);
        }
      }
      
      // Search for videos using each query
      for (const query of searchQueries) {
        const videoResults = await searchYouTubeVideos(query, 2);
        
        // Add unique videos to our collection
        for (const video of videoResults) {
          if (!uniqueVideos.has(video.id)) {
            uniqueVideos.set(video.id, video);
          }
        }
        
        // If we already have enough videos, break early
        if (uniqueVideos.size >= maxResults) {
          break;
        }
      }
      
      // If we already have enough videos, break early
      if (uniqueVideos.size >= maxResults) {
        break;
      }
    }
    
    // If we still don't have enough videos, try searching by individual words in the interests
    if (uniqueVideos.size < maxResults) {
      for (const interest of interests) {
        // Split interest phrase into individual words
        const words = interest.split(/\s+/);
        for (const word of words) {
          if (word.length >= 3) { // Only use words that are at least 3 characters
            const wordVideos = await searchYouTubeVideos(`${word} news`, 2);
            
            // Add unique videos to our collection
            for (const video of wordVideos) {
              if (!uniqueVideos.has(video.id)) {
                uniqueVideos.set(video.id, video);
              }
            }
            
            // If we have enough videos, break early
            if (uniqueVideos.size >= maxResults) {
              break;
            }
          }
        }
        
        // If we have enough videos, break early
        if (uniqueVideos.size >= maxResults) {
          break;
        }
      }
    }
    
    // Convert map values to array
    allVideos = Array.from(uniqueVideos.values());
    
    // Shuffle the videos to mix categories
    allVideos = allVideos.sort(() => Math.random() - 0.5);
    
    // Limit to maxResults
    return allVideos.slice(0, maxResults);
  } catch (error) {
    console.error('Error getting focus mode videos:', error);
    return [];
  }
};