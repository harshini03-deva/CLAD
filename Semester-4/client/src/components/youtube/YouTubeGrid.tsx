import { YouTubeVideo as YouTubeVideoType } from '@/lib/types';
import YouTubeVideo from './YouTubeVideo';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface YouTubeGridProps {
  title?: string;
  videos: YouTubeVideoType[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const YouTubeGrid = ({ 
  title, 
  videos, 
  isLoading = false,
  hasMore = false,
  onLoadMore
}: YouTubeGridProps) => {
  return (
    <div className="space-y-6">
      {title && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
        </div>
      )}
      
      {isLoading && videos.length === 0 ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-video animate-pulse bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        // Empty state
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No videos found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        // Videos grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <YouTubeVideo key={video.id} video={video} />
          ))}
        </div>
      )}
      
      {/* Load more button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default YouTubeGrid;