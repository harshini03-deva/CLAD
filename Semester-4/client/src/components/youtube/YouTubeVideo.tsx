import { useState } from 'react';
import { YouTubeVideo as YouTubeVideoType } from '@/lib/types';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface YouTubeVideoProps {
  video: YouTubeVideoType;
  autoplay?: boolean;
}

const YouTubeVideo = ({ video, autoplay = false }: YouTubeVideoProps) => {
  const [expanded, setExpanded] = useState(false);
  const [playerActive, setPlayerActive] = useState(false);
  
  const formatPublishedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  const getVideoEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? '1' : '0'}`;
  };
  
  const handleThumbnailClick = () => {
    setPlayerActive(true);
  };
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 transition duration-300 hover:shadow-lg">
      <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 relative">
        {playerActive ? (
          <iframe
            src={getVideoEmbedUrl(video.id)}
            title={video.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={handleThumbnailClick}
          >
            <img 
              src={video.thumbnailUrl} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">{video.title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{video.channelTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatPublishedDate(video.publishedAt)}</span>
          </div>
        </div>
        
        <p className={`text-gray-700 dark:text-gray-300 text-sm ${expanded ? '' : 'line-clamp-3'}`}>
          {video.description}
        </p>
        
        {video.description && video.description.length > 150 && (
          <button
            className="text-sm text-primary font-medium mt-2 hover:underline focus:outline-none"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideo;