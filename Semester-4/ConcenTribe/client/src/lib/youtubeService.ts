import { YouTubeVideo } from '@/lib/types';
import { API_BASE_URL } from './constants';

export const searchYouTubeVideos = async (query: string, limit = 5): Promise<YouTubeVideo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/youtube/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
};

export const getYouTubeVideosByCategory = async (category: string, limit = 5): Promise<YouTubeVideo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/youtube/category/${encodeURIComponent(category)}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error('Error fetching YouTube videos by category:', error);
    return [];
  }
};

export const getFocusModeVideos = async (
  interests: string[] = [], 
  sources: string[] = [], 
  limit = 10
): Promise<YouTubeVideo[]> => {
  try {
    // Build query params for interests
    const interestsParams = interests.map(i => 
      `interests=${encodeURIComponent(i)}`
    ).join('&');
    
    // Build query params for sources
    const sourcesParams = sources.map(s => 
      `sources=${encodeURIComponent(s)}`
    ).join('&');
    
    // Combine parameters
    const queryParams = [
      interestsParams,
      sourcesParams,
      `limit=${limit}`
    ].filter(Boolean).join('&');
    
    const response = await fetch(`${API_BASE_URL}/focus/videos?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching focus mode videos:', error);
    return [];
  }
};